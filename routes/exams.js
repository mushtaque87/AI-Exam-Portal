const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const {
    Exam,
    Question,
    User,
    UserExamAssignment,
    ExamResult
} = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_PATH || './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'exam-import-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.xlsx', '.xls'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'));
        }
    }
});

// Apply authentication and admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// @route   GET /api/exams
// @desc    Get all exams with pagination and filters
// @access  Private (Admin)
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim(),
    query('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { search, isActive } = req.query;

        // Build where clause
        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }
        if (isActive !== undefined) whereClause.isActive = isActive === 'true';

        const { count, rows: exams } = await Exam.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Question,
                    as: 'questions',
                    attributes: ['id']
                },
                {
                    model: User,
                    as: 'assignedUsers',
                    through: { attributes: [] },
                    attributes: ['id']
                }
            ]
        });

        // Add question count and assigned user count
        const examsWithCounts = exams.map(exam => {
            const examData = exam.toJSON();
            examData.questionCount = exam.questions.length;
            examData.assignedUserCount = exam.assignedUsers.length;
            delete examData.questions;
            delete examData.assignedUsers;
            return examData;
        });

        res.json({
            exams: examsWithCounts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/exams/:id
// @desc    Get exam by ID with questions and assignments
// @access  Private (Admin)
router.get('/:id', async (req, res) => {
    try {
        const exam = await Exam.findByPk(req.params.id, {
            include: [
                {
                    model: Question,
                    as: 'questions',
                    order: [['id', 'ASC']]
                },
                {
                    model: User,
                    as: 'assignedUsers',
                    through: { attributes: ['assignedAt', 'assignedBy'] },
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.json({ exam });
    } catch (error) {
        console.error('Get exam error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/exams
// @desc    Create new exam
// @access  Private (Admin)
router.post('/', [
    body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('description').optional().trim(),
    body('duration').isInt({ min: 1, max: 480 }).withMessage('Duration must be between 1 and 480 minutes'),
    body('totalQuestions').optional().isInt({ min: 0 }).withMessage('Total questions must be a non-negative integer'),
    body('passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
    body('startDate').optional(),
    body('endDate').optional(),
    body('instructions').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            description,
            duration,
            totalQuestions = 0,
            passingScore = 70,
            startDate,
            endDate,
            instructions
        } = req.body;

        // Handle date conversion more gracefully
        let startDateObj = null;
        let endDateObj = null;

        if (startDate) {
            startDateObj = new Date(startDate);
            if (isNaN(startDateObj.getTime())) {
                return res.status(400).json({ message: 'Invalid start date format' });
            }
        }

        if (endDate) {
            endDateObj = new Date(endDate);
            if (isNaN(endDateObj.getTime())) {
                return res.status(400).json({ message: 'Invalid end date format' });
            }
        }

        const exam = await Exam.create({
            title,
            description,
            duration,
            totalQuestions,
            passingScore,
            startDate: startDateObj,
            endDate: endDateObj,
            instructions
        });

        res.status(201).json({
            message: 'Exam created successfully',
            exam
        });
    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private (Admin)
router.put('/:id', [
    body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('description').optional().trim(),
    body('duration').optional().isInt({ min: 1, max: 480 }).withMessage('Duration must be between 1 and 480 minutes'),
    body('totalQuestions').optional().isInt({ min: 0 }).withMessage('Total questions must be a non-negative integer'),
    body('passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
    body('startDate').optional(),
    body('endDate').optional(),
    body('instructions').optional().trim(),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const exam = await Exam.findByPk(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const updateData = { ...req.body };

        // Handle date conversion more gracefully
        if (updateData.startDate) {
            const startDateObj = new Date(updateData.startDate);
            if (isNaN(startDateObj.getTime())) {
                return res.status(400).json({ message: 'Invalid start date format' });
            }
            updateData.startDate = startDateObj;
        }

        if (updateData.endDate) {
            const endDateObj = new Date(updateData.endDate);
            if (isNaN(endDateObj.getTime())) {
                return res.status(400).json({ message: 'Invalid end date format' });
            }
            updateData.endDate = endDateObj;
        }

        await exam.update(updateData);

        res.json({
            message: 'Exam updated successfully',
            exam
        });
    } catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam (soft delete by setting isActive to false)
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const exam = await Exam.findByPk(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Check if exam has results
        const hasResults = await ExamResult.findOne({
            where: { examId: exam.id }
        });

        if (hasResults) {
            return res.status(400).json({
                message: 'Cannot delete exam that has results. Deactivate instead.'
            });
        }

        await exam.update({ isActive: false });

        res.json({ message: 'Exam deactivated successfully' });
    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/exams/:id/assign-users
// @desc    Assign users to exam
// @access  Private (Admin)
router.post('/:id/assign-users', [
    body('userIds').isArray().withMessage('userIds must be an array'),
    body('userIds.*').isInt().withMessage('Each user ID must be an integer')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const exam = await Exam.findByPk(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const { userIds } = req.body;

        // Verify all users exist and are students
        const users = await User.findAll({
            where: {
                id: userIds,
                isActive: true,
                role: 'student'
            }
        });

        if (users.length !== userIds.length) {
            return res.status(400).json({ message: 'Some users not found, inactive, or not students' });
        }

        // Create assignments
        const assignments = userIds.map(userId => ({
            userId,
            examId: exam.id,
            assignedBy: req.user.id
        }));

        await UserExamAssignment.bulkCreate(assignments, {
            ignoreDuplicates: true
        });

        res.json({ message: 'Users assigned to exam successfully' });
    } catch (error) {
        console.error('Assign users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/exams/:id/unassign-users
// @desc    Unassign users from exam
// @access  Private (Admin)
router.delete('/:id/unassign-users', [
    body('userIds').isArray().withMessage('userIds must be an array'),
    body('userIds.*').isInt().withMessage('Each user ID must be an integer')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const exam = await Exam.findByPk(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const { userIds } = req.body;

        await UserExamAssignment.destroy({
            where: {
                examId: exam.id,
                userId: userIds
            }
        });

        res.json({ message: 'Users unassigned from exam successfully' });
    } catch (error) {
        console.error('Unassign users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/exams/:id/import-questions
// @desc    Import questions from Excel file
// @access  Private (Admin)
router.post('/:id/import-questions', upload.single('file'), async (req, res) => {
    try {
        const exam = await Exam.findByPk(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Excel file is required' });
        }

        // Read Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty' });
        }

        // Validate required columns
        const requiredColumns = ['Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectAnswer'];
        const firstRow = data[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));

        if (missingColumns.length > 0) {
            return res.status(400).json({
                message: `Missing required columns: ${missingColumns.join(', ')}`
            });
        }

        // Process questions
        const questions = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNumber = i + 2; // Excel rows start from 1, and we have header

            try {
                // Validate data
                if (!row.Question || !row.OptionA || !row.OptionB || !row.OptionC || !row.OptionD) {
                    errors.push(`Row ${rowNumber}: All fields are required`);
                    continue;
                }

                const correctAnswer = row.CorrectAnswer.toString().toUpperCase();
                if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                    errors.push(`Row ${rowNumber}: CorrectAnswer must be A, B, C, or D`);
                    continue;
                }

                questions.push({
                    examId: exam.id,
                    questionText: row.Question.toString().trim(),
                    optionA: row.OptionA.toString().trim(),
                    optionB: row.OptionB.toString().trim(),
                    optionC: row.OptionC.toString().trim(),
                    optionD: row.OptionD.toString().trim(),
                    correctOption: correctAnswer,
                    points: row.Points || 1,
                    explanation: row.Explanation || null
                });
            } catch (error) {
                errors.push(`Row ${rowNumber}: Invalid data format`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Import failed due to validation errors',
                errors
            });
        }

        // Save questions to database
        await Question.bulkCreate(questions);

        // Update exam question count
        await exam.update({ totalQuestions: exam.totalQuestions + questions.length });

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            message: `Successfully imported ${questions.length} questions`,
            importedCount: questions.length
        });
    } catch (error) {
        console.error('Import questions error:', error);

        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/exams/:id/export-questions
// @desc    Export exam questions to Excel
// @access  Private (Admin)
router.get('/:id/export-questions', async (req, res) => {
    try {
        const exam = await Exam.findByPk(req.params.id, {
            include: [
                {
                    model: Question,
                    as: 'questions',
                    order: [['id', 'ASC']]
                }
            ]
        });

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Prepare data for Excel
        const data = exam.questions.map(q => ({
            Question: q.questionText,
            OptionA: q.optionA,
            OptionB: q.optionB,
            OptionC: q.optionC,
            OptionD: q.optionD,
            CorrectAnswer: q.correctOption,
            Points: q.points,
            Explanation: q.explanation || ''
        }));

        // Create workbook and worksheet
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(data);

        // Add worksheet to workbook
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Questions');

        // Generate file path
        const fileName = `exam-${exam.id}-questions-${Date.now()}.xlsx`;
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
        console.error('Export questions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/exams/stats/overview
// @desc    Get exam statistics overview
// @access  Private (Admin)
router.get('/stats/overview', async (req, res) => {
    try {
        const totalExams = await Exam.count();
        const activeExams = await Exam.count({ where: { isActive: true } });
        const totalQuestions = await Question.count();
        const totalAssignments = await UserExamAssignment.count();
        const totalResults = await ExamResult.count();

        const avgScore = await ExamResult.findOne({
            attributes: [
                [require('sequelize').fn('AVG', require('sequelize').col('score')), 'averageScore']
            ]
        });

        res.json({
            totalExams,
            activeExams,
            totalQuestions,
            totalAssignments,
            totalResults,
            averageScore: avgScore ? parseFloat(avgScore.getDataValue('averageScore')).toFixed(2) : 0
        });
    } catch (error) {
        console.error('Get exam stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 