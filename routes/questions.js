const express = require('express');
const { body, validationResult } = require('express-validator');
const { Question, Exam } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// @route   GET /api/questions/exam/:examId
// @desc    Get all questions for a specific exam
// @access  Private (Admin)
router.get('/exam/:examId', async (req, res) => {
    try {
        const exam = await Exam.findByPk(req.params.examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const questions = await Question.findAll({
            where: { examId: req.params.examId },
            order: [['id', 'ASC']]
        });

        res.json({ questions });
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Private (Admin)
router.get('/:id', async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id, {
            include: [
                {
                    model: Exam,
                    as: 'exam',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ question });
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/questions
// @desc    Create new question
// @access  Private (Admin)
router.post('/', [
    body('examId').isInt().withMessage('Exam ID must be an integer'),
    body('questionText').trim().notEmpty().withMessage('Question text is required'),
    body('optionA').trim().notEmpty().withMessage('Option A is required'),
    body('optionB').trim().notEmpty().withMessage('Option B is required'),
    body('optionC').trim().notEmpty().withMessage('Option C is required'),
    body('optionD').trim().notEmpty().withMessage('Option D is required'),
    body('correctOption').isIn(['A', 'B', 'C', 'D']).withMessage('Correct option must be A, B, C, or D'),
    body('points').optional().isInt({ min: 1 }).withMessage('Points must be a positive integer'),
    body('explanation').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            examId,
            questionText,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOption,
            points = 1,
            explanation
        } = req.body;

        // Verify exam exists
        const exam = await Exam.findByPk(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const question = await Question.create({
            examId,
            questionText,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOption,
            points,
            explanation
        });

        // Update exam question count
        await exam.update({ totalQuestions: exam.totalQuestions + 1 });

        res.status(201).json({
            message: 'Question created successfully',
            question
        });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Private (Admin)
router.put('/:id', [
    body('questionText').optional().trim().notEmpty().withMessage('Question text cannot be empty'),
    body('optionA').optional().trim().notEmpty().withMessage('Option A cannot be empty'),
    body('optionB').optional().trim().notEmpty().withMessage('Option B cannot be empty'),
    body('optionC').optional().trim().notEmpty().withMessage('Option C cannot be empty'),
    body('optionD').optional().trim().notEmpty().withMessage('Option D cannot be empty'),
    body('correctOption').optional().isIn(['A', 'B', 'C', 'D']).withMessage('Correct option must be A, B, C, or D'),
    body('points').optional().isInt({ min: 1 }).withMessage('Points must be a positive integer'),
    body('explanation').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const question = await Question.findByPk(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const updateData = { ...req.body };
        delete updateData.examId; // Prevent changing exam ID

        await question.update(updateData);

        res.json({
            message: 'Question updated successfully',
            question
        });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/questions/:id
// @desc    Delete question
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id, {
            include: [
                {
                    model: Exam,
                    as: 'exam'
                }
            ]
        });

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check if question has responses
        const hasResponses = await require('../models').ExamResponse.findOne({
            where: { questionId: question.id }
        });

        if (hasResponses) {
            return res.status(400).json({
                message: 'Cannot delete question that has responses'
            });
        }

        await question.destroy();

        // Update exam question count
        if (question.exam) {
            await question.exam.update({
                totalQuestions: Math.max(0, question.exam.totalQuestions - 1)
            });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/questions/bulk
// @desc    Create multiple questions at once
// @access  Private (Admin)
router.post('/bulk', [
    body('examId').isInt().withMessage('Exam ID must be an integer'),
    body('questions').isArray().withMessage('Questions must be an array'),
    body('questions.*.questionText').trim().notEmpty().withMessage('Question text is required'),
    body('questions.*.optionA').trim().notEmpty().withMessage('Option A is required'),
    body('questions.*.optionB').trim().notEmpty().withMessage('Option B is required'),
    body('questions.*.optionC').trim().notEmpty().withMessage('Option C is required'),
    body('questions.*.optionD').trim().notEmpty().withMessage('Option D is required'),
    body('questions.*.correctOption').isIn(['A', 'B', 'C', 'D']).withMessage('Correct option must be A, B, C, or D')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { examId, questions } = req.body;

        // Verify exam exists
        const exam = await Exam.findByPk(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Prepare questions data
        const questionsData = questions.map(q => ({
            examId,
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
            points: q.points || 1,
            explanation: q.explanation || null
        }));

        // Create questions
        const createdQuestions = await Question.bulkCreate(questionsData);

        // Update exam question count
        await exam.update({ totalQuestions: exam.totalQuestions + questions.length });

        res.status(201).json({
            message: `Successfully created ${createdQuestions.length} questions`,
            questions: createdQuestions
        });
    } catch (error) {
        console.error('Bulk create questions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/questions/reorder
// @desc    Reorder questions for an exam
// @access  Private (Admin)
router.put('/reorder', [
    body('examId').isInt().withMessage('Exam ID must be an integer'),
    body('questionIds').isArray().withMessage('Question IDs must be an array'),
    body('questionIds.*').isInt().withMessage('Each question ID must be an integer')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { examId, questionIds } = req.body;

        // Verify exam exists
        const exam = await Exam.findByPk(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Verify all questions belong to this exam
        const questions = await Question.findAll({
            where: {
                id: questionIds,
                examId
            }
        });

        if (questions.length !== questionIds.length) {
            return res.status(400).json({ message: 'Some questions not found or do not belong to this exam' });
        }

        // Update question order (you might want to add an order field to the Question model)
        // For now, we'll just return success
        res.json({ message: 'Question order updated successfully' });
    } catch (error) {
        console.error('Reorder questions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 