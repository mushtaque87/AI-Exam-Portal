const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const {
    User,
    Exam,
    UserExamAssignment,
    ExamResult,
    Question
} = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// @route   GET /api/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin)
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim(),
    query('role').optional().isIn(['admin', 'student']).withMessage('Role must be admin or student'),
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
        const { search, role, isActive } = req.query;

        // Build where clause
        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }
        if (role) whereClause.role = role;
        if (isActive !== undefined) whereClause.isActive = isActive === 'true';

        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['password'] }
        });

        res.json({
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID with exam assignments and results
// @access  Private (Admin)
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Exam,
                    as: 'assignedExams',
                    through: { attributes: ['assignedAt', 'assignedBy'] },
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
                            attributes: ['name', 'duration']
                        }
                    ]
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin)
router.put('/:id', [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['admin', 'student']).withMessage('Role must be admin or student'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, role, isActive } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({
                where: {
                    email,
                    id: { [Op.ne]: req.params.id }
                }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already taken' });
            }
        }

        await user.update(updateData);

        res.json({
            message: 'User updated successfully',
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete by setting isActive to false)
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await user.update({ isActive: false });

        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/users/:id/assign-exams
// @desc    Assign exams to user
// @access  Private (Admin)
router.post('/:id/assign-exams', [
    body('examIds').isArray().withMessage('examIds must be an array'),
    body('examIds.*').isInt().withMessage('Each exam ID must be an integer')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { examIds } = req.body;

        // Verify all exams exist
        const exams = await Exam.findAll({
            where: { id: examIds, isActive: true }
        });

        if (exams.length !== examIds.length) {
            return res.status(400).json({ message: 'Some exams not found or inactive' });
        }

        // Create assignments
        const assignments = examIds.map(examId => ({
            userId: user.id,
            examId,
            assignedBy: req.user.id
        }));

        await UserExamAssignment.bulkCreate(assignments, {
            ignoreDuplicates: true
        });

        res.json({ message: 'Exams assigned successfully' });
    } catch (error) {
        console.error('Assign exams error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/users/:id/unassign-exams
// @desc    Unassign exams from user
// @access  Private (Admin)
router.delete('/:id/unassign-exams', [
    body('examIds').isArray().withMessage('examIds must be an array'),
    body('examIds.*').isInt().withMessage('Each exam ID must be an integer')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { examIds } = req.body;

        await UserExamAssignment.destroy({
            where: {
                userId: user.id,
                examId: examIds
            }
        });

        res.json({ message: 'Exams unassigned successfully' });
    } catch (error) {
        console.error('Unassign exams error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/users/:id/exam-assignments
// @desc    Get user's exam assignments
// @access  Private (Admin)
router.get('/:id/exam-assignments', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [
                {
                    model: Exam,
                    as: 'assignedExams',
                    through: { attributes: ['assignedAt', 'assignedBy'] },
                    include: [
                        {
                            model: Question,
                            as: 'questions',
                            attributes: ['id']
                        }
                    ]
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ assignments: user.assignedExams });
    } catch (error) {
        console.error('Get exam assignments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview
// @access  Private (Admin)
router.get('/stats/overview', async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { isActive: true } });
        const adminUsers = await User.count({ where: { role: 'admin', isActive: true } });
        const studentUsers = await User.count({ where: { role: 'student', isActive: true } });

        const usersWithExams = await UserExamAssignment.count({
            distinct: true,
            col: 'userId'
        });

        const usersWithResults = await ExamResult.count({
            distinct: true,
            col: 'userId'
        });

        res.json({
            totalUsers,
            activeUsers,
            adminUsers,
            studentUsers,
            usersWithExams,
            usersWithResults,
            inactiveUsers: totalUsers - activeUsers
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 