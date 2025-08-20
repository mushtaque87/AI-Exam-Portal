const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Pipeline, User, UserPipelineProgress } = require('../models');

const router = express.Router();

// All pipeline routes require auth
router.use(authenticateToken);

// Helpers
const validateStages = body('stages').custom((stages) => {
    if (!Array.isArray(stages)) throw new Error('Stages must be an array');
    if (stages.length < 1 || stages.length > 10) throw new Error('Stages must be between 1 and 10');
    for (const s of stages) {
        if (typeof s !== 'string' || s.trim().length === 0) throw new Error('Stage names must be non-empty strings');
        if (s.length > 100) throw new Error('Stage names must be <= 100 characters');
    }
    return true;
});

// Admin: list pipelines
router.get('/', async (req, res) => {
    try {
        const pipelines = await Pipeline.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ pipelines });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: create pipeline (limit 10 total)
router.post('/', requireAdmin, [
    body('name').isString().trim().isLength({ min: 2, max: 100 }),
    validateStages
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const count = await Pipeline.count();
        if (count >= 10) {
            return res.status(400).json({ message: 'Cannot create more than 10 pipelines' });
        }
        const pipeline = await Pipeline.create({ name: req.body.name, stages: req.body.stages, createdBy: req.user.id });
        res.status(201).json({ message: 'Pipeline created', pipeline });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: update pipeline (name, stages)
router.put('/:id', requireAdmin, [
    param('id').isInt(),
    body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
    validateStages.optional()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pipeline = await Pipeline.findByPk(req.params.id);
        if (!pipeline) return res.status(404).json({ message: 'Pipeline not found' });

        const update = {};
        if (req.body.name) update.name = req.body.name;
        if (req.body.stages) update.stages = req.body.stages;
        if (typeof req.body.isActive === 'boolean') update.isActive = req.body.isActive;

        await pipeline.update(update);
        res.json({ message: 'Pipeline updated', pipeline });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: delete pipeline
router.delete('/:id', requireAdmin, [param('id').isInt()], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pipeline = await Pipeline.findByPk(req.params.id);
        if (!pipeline) return res.status(404).json({ message: 'Pipeline not found' });
        await pipeline.destroy();
        res.json({ message: 'Pipeline deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get per-user view of pipeline with completed flags
router.get('/:id/progress', [param('id').isInt()], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pipeline = await Pipeline.findByPk(req.params.id);
        if (!pipeline || !pipeline.isActive) return res.status(404).json({ message: 'Pipeline not found' });
        const progress = await UserPipelineProgress.findOne({ where: { userId: req.user.id, pipelineId: pipeline.id } });
        const completed = Array.isArray(progress?.completedStages) ? progress.completedStages : [];
        const stages = pipeline.stages.map((name, idx) => ({ name, completed: Boolean(completed[idx]) }));
        res.json({ pipeline: { id: pipeline.id, name: pipeline.name }, stages });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: get specific user's progress for a pipeline
router.get('/:id/users/:userId/progress', requireAdmin, [param('id').isInt(), param('userId').isInt()], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pipeline = await Pipeline.findByPk(req.params.id);
        if (!pipeline || !pipeline.isActive) return res.status(404).json({ message: 'Pipeline not found' });
        const user = await User.findByPk(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const progress = await UserPipelineProgress.findOne({ where: { userId: user.id, pipelineId: pipeline.id } });
        const completed = Array.isArray(progress?.completedStages) ? progress.completedStages : [];
        const stages = pipeline.stages.map((name, idx) => ({ name, completed: Boolean(completed[idx]) }));
        res.json({ pipeline: { id: pipeline.id, name: pipeline.name }, stages, user: { id: user.id, name: user.name } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: set per-user stage completion
router.post('/:id/users/:userId/progress', requireAdmin, [
    param('id').isInt(),
    param('userId').isInt(),
    body('stageIndex').isInt({ min: 0 }),
    body('completed').isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const pipeline = await Pipeline.findByPk(req.params.id);
        if (!pipeline) return res.status(404).json({ message: 'Pipeline not found' });
        const user = await User.findByPk(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const stageIndex = req.body.stageIndex;
        if (stageIndex < 0 || stageIndex >= pipeline.stages.length) {
            return res.status(400).json({ message: 'stageIndex out of range' });
        }

        const [progress, created] = await UserPipelineProgress.findOrCreate({
            where: { userId: user.id, pipelineId: pipeline.id },
            defaults: { completedStages: new Array(pipeline.stages.length).fill(false) }
        });
        const completedStages = Array.isArray(progress.completedStages) ? [...progress.completedStages] : new Array(pipeline.stages.length).fill(false);
        if (completedStages.length !== pipeline.stages.length) {
            // re-align length if stages changed
            const resized = new Array(pipeline.stages.length).fill(false);
            for (let i = 0; i < Math.min(completedStages.length, resized.length); i++) resized[i] = Boolean(completedStages[i]);
            completedStages.splice(0, completedStages.length, ...resized);
        }
        completedStages[stageIndex] = !!req.body.completed;
        await progress.update({ completedStages });
        res.json({ message: 'Progress updated', completedStages });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;


