const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const {
    Exam,
    Question,
    User,
    UserExamAssignment,
    ExamResult,
    ExamResponse
} = require('../models');
const { authenticateToken, requireAdmin, requireStudent } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/results/my-exams
// @desc    Get user's assigned exams and results (for students)
// @access  Private (Student)
router.get('/my-exams', authenticateToken, requireStudent, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                {
                    model: Exam,
                    as: 'assignedExams',
                    through: { attributes: ['assignedAt'] },
                    include: [
                        {
                            model: Question,
                            as: 'questions',
                            attributes: ['id']
                        }
                    ]
                },
                {
                    model: ExamResult,
                    as: 'examResults',
                    include: [
                        {
                            model: Exam,
                            as: 'exam',
                            attributes: ['name', 'duration', 'passingScore']
                        }
                    ]
                }
            ]
        });

        // Map exams with their results
        const examsWithResults = user.assignedExams.map(exam => {
            const examData = exam.toJSON();
            const result = user.examResults.find(r => r.examId === exam.id);
            examData.result = result || null;
            examData.questionCount = exam.questions.length;
            examData.canTake = !result && exam.isActive;
            delete examData.questions;
            return examData;
        });

        res.json({ exams: examsWithResults });
    } catch (error) {
        console.error('Get my exams error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/results/exam/:examId/start
// @desc    Start an exam (get questions without answers)
// @access  Private (Student)
router.get('/exam/:examId/start', authenticateToken, requireStudent, async (req, res) => {
    try {
        // Check if user is assigned to this exam
        const assignment = await UserExamAssignment.findOne({
            where: {
                userId: req.user.id,
                examId: req.params.examId
            },
            include: [
                {
                    model: Exam,
                    as: 'exam',
                    include: [
                        {
                            model: Question,
                            as: 'questions',
                            order: [['id', 'ASC']]
                        }
                    ]
                }
            ]
        });

        if (!assignment) {
            return res.status(404).json({ message: 'Exam not found or not assigned to you' });
        }

        // Check if exam is active
        if (!assignment.exam.isActive) {
            return res.status(400).json({ message: 'This exam is not active' });
        }

        // Check if user has already taken this exam
        const existingResult = await ExamResult.findOne({
            where: {
                userId: req.user.id,
                examId: req.params.examId
            }
        });

        if (existingResult) {
            return res.status(400).json({ message: 'You have already taken this exam' });
        }

        // Prepare questions without correct answers
        const questions = assignment.exam.questions.map(q => ({
            id: q.id,
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            points: q.points
        }));

        res.json({
            exam: {
                id: assignment.exam.id,
                name: assignment.exam.name,
                description: assignment.exam.description,
                duration: assignment.exam.duration,
                instructions: assignment.exam.instructions,
                totalQuestions: questions.length
            },
            questions
        });
    } catch (error) {
        console.error('Start exam error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/results/exam/:examId/submit
// @desc    Submit exam answers and calculate results
// @access  Private (Student)
router.post('/exam/:examId/submit', [
    authenticateToken,
    requireStudent,
    body('answers').isArray().withMessage('Answers must be an array'),
    body('answers.*.questionId').isInt().withMessage('Question ID must be an integer'),
    body('answers.*.selectedOption').optional().isIn(['A', 'B', 'C', 'D']).withMessage('Selected option must be A, B, C, or D'),
    body('timeTaken').isInt({ min: 0 }).withMessage('Time taken must be a positive integer')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { answers, timeTaken } = req.body;
        const examId = parseInt(req.params.examId);

        // Check if user is assigned to this exam
        const assignment = await UserExamAssignment.findOne({
            where: {
                userId: req.user.id,
                examId
            },
            include: [
                {
                    model: Exam,
                    as: 'exam'
                }
            ]
        });

        if (!assignment) {
            return res.status(404).json({ message: 'Exam not found or not assigned to you' });
        }

        // Check if user has already taken this exam
        const existingResult = await ExamResult.findOne({
            where: {
                userId: req.user.id,
                examId
            }
        });

        if (existingResult) {
            return res.status(400).json({ message: 'You have already taken this exam' });
        }

        // Get questions with correct answers
        const questions = await Question.findAll({
            where: { examId },
            order: [['id', 'ASC']]
        });

        // Process answers and calculate results
        const responses = [];
        let correctAnswers = 0;
        let totalPoints = 0;
        let earnedPoints = 0;

        for (const answer of answers) {
            const question = questions.find(q => q.id === answer.questionId);
            if (!question) continue;

            const isCorrect = answer.selectedOption === question.correctOption;
            const pointsEarned = isCorrect ? question.points : 0;

            responses.push({
                userId: req.user.id,
                examId,
                questionId: question.id,
                selectedOption: answer.selectedOption || null,
                isCorrect,
                pointsEarned,
                timeSpent: 0 // You might want to track individual question time
            });

            if (isCorrect) {
                correctAnswers++;
                earnedPoints += pointsEarned;
            }
            totalPoints += question.points;
        }

        // Calculate score percentage
        const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        const isPassed = score >= assignment.exam.passingScore;
        const status = isPassed ? 'passed' : 'failed';

        // Save responses
        await ExamResponse.bulkCreate(responses);

        // Save result
        const result = await ExamResult.create({
            userId: req.user.id,
            examId,
            score,
            totalQuestions: questions.length,
            correctAnswers,
            totalPoints,
            earnedPoints,
            timeTaken,
            status,
            isPassed
        });

        res.json({
            message: 'Exam submitted successfully',
            result: {
                ...result.toJSON(),
                exam: {
                    name: assignment.exam.name,
                    passingScore: assignment.exam.passingScore
                }
            }
        });
    } catch (error) {
        console.error('Submit exam error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/results/my-results
// @desc    Get user's exam results (for students)
// @access  Private (Student)
router.get('/my-results', authenticateToken, requireStudent, async (req, res) => {
    try {
        const results = await ExamResult.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Exam,
                    as: 'exam',
                    attributes: ['name', 'duration', 'passingScore']
                }
            ],
            order: [['submittedAt', 'DESC']]
        });

        res.json({ results });
    } catch (error) {
        console.error('Get my results error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/results/exam/:examId/result
// @desc    Get detailed exam result with answers (for students)
// @access  Private (Student)
router.get('/exam/:examId/result', authenticateToken, requireStudent, async (req, res) => {
    try {
        const result = await ExamResult.findOne({
            where: {
                userId: req.user.id,
                examId: req.params.examId
            },
            include: [
                {
                    model: Exam,
                    as: 'exam',
                    attributes: ['name', 'duration', 'passingScore']
                }
            ]
        });

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        // Get responses with questions
        const responses = await ExamResponse.findAll({
            where: {
                userId: req.user.id,
                examId: req.params.examId
            },
            include: [
                {
                    model: Question,
                    as: 'question',
                    attributes: ['questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctOption', 'explanation']
                }
            ],
            order: [['questionId', 'ASC']]
        });

        res.json({
            result,
            responses
        });
    } catch (error) {
        console.error('Get exam result error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin routes for viewing all results
// @route   GET /api/results
// @desc    Get all exam results with filters (admin only)
// @access  Private (Admin)
router.get('/', [
    authenticateToken,
    requireAdmin,
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('examId').optional().isInt().withMessage('Exam ID must be an integer'),
    query('userId').optional().isInt().withMessage('User ID must be an integer'),
    query('status').optional().isIn(['passed', 'failed', 'incomplete']).withMessage('Status must be passed, failed, or incomplete')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { examId, userId, status } = req.query;

        // Build where clause
        const whereClause = {};
        if (examId) whereClause.examId = examId;
        if (userId) whereClause.userId = userId;
        if (status) whereClause.status = status;

        const { count, rows: results } = await ExamResult.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['submittedAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Exam,
                    as: 'exam',
                    attributes: ['id', 'name', 'duration', 'passingScore']
                }
            ]
        });

        res.json({
            results,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/results/exam/:examId
// @desc    Get all results for a specific exam (admin only)
// @access  Private (Admin)
router.get('/exam/:examId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const exam = await Exam.findByPk(req.params.examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const results = await ExamResult.findAll({
            where: { examId: req.params.examId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['submittedAt', 'DESC']]
        });

        // Calculate statistics
        const totalResults = results.length;
        const passedResults = results.filter(r => r.isPassed).length;
        const failedResults = totalResults - passedResults;
        const avgScore = totalResults > 0 ? results.reduce((sum, r) => sum + parseFloat(r.score), 0) / totalResults : 0;
        const highestScore = totalResults > 0 ? Math.max(...results.map(r => parseFloat(r.score))) : 0;
        const lowestScore = totalResults > 0 ? Math.min(...results.map(r => parseFloat(r.score))) : 0;

        res.json({
            exam,
            results,
            statistics: {
                totalResults,
                passedResults,
                failedResults,
                passRate: totalResults > 0 ? (passedResults / totalResults) * 100 : 0,
                averageScore: parseFloat(avgScore.toFixed(2)),
                highestScore: parseFloat(highestScore.toFixed(2)),
                lowestScore: parseFloat(lowestScore.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Get exam results error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/results/export/exam/:examId
// @desc    Export exam results to Excel (admin only)
// @access  Private (Admin)
router.get('/export/exam/:examId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const exam = await Exam.findByPk(req.params.examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const results = await ExamResult.findAll({
            where: { examId: req.params.examId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'email']
                }
            ],
            order: [['submittedAt', 'DESC']]
        });

        // Prepare data for Excel
        const data = results.map(r => ({
            'Student Name': r.user.name,
            'Email': r.user.email,
            'Score (%)': parseFloat(r.score).toFixed(2),
            'Correct Answers': r.correctAnswers,
            'Total Questions': r.totalQuestions,
            'Earned Points': r.earnedPoints,
            'Total Points': r.totalPoints,
            'Time Taken (seconds)': r.timeTaken,
            'Status': r.status,
            'Passed': r.isPassed ? 'Yes' : 'No',
            'Submitted At': r.submittedAt.toLocaleString()
        }));

        // Create workbook and worksheet
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(data);

        // Add worksheet to workbook
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Results');

        // Generate file path
        const fileName = `exam-${exam.id}-results-${Date.now()}.xlsx`;
        const filePath = path.join(process.env.UPLOAD_PATH || './uploads', fileName);

        // Write file
        xlsx.writeFile(workbook, filePath);

        // Send file
        res.download(filePath, fileName, (err) => {
            // Clean up file after download
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    } catch (error) {
        console.error('Export results error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/results/stats/overview
// @desc    Get overall results statistics (admin only)
// @access  Private (Admin)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalResults = await ExamResult.count();
        const passedResults = await ExamResult.count({ where: { isPassed: true } });
        const failedResults = await ExamResult.count({ where: { isPassed: false } });

        const avgScore = await ExamResult.findOne({
            attributes: [
                [require('sequelize').fn('AVG', require('sequelize').col('score')), 'averageScore']
            ]
        });

        const recentResults = await ExamResult.count({
            where: {
                submittedAt: {
                    [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            }
        });

        res.json({
            totalResults,
            passedResults,
            failedResults,
            passRate: totalResults > 0 ? (passedResults / totalResults) * 100 : 0,
            averageScore: avgScore ? parseFloat(avgScore.getDataValue('averageScore')).toFixed(2) : 0,
            recentResults
        });
    } catch (error) {
        console.error('Get results stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 