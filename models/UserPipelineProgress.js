const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserPipelineProgress = sequelize.define('UserPipelineProgress', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pipelineId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Array of booleans (or 0/1) aligned with Pipeline.stages order
    completedStages: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    }
}, {
    indexes: [
        { unique: true, fields: ['user_id', 'pipeline_id'] }
    ],
    tableName: 'user_pipeline_progress'
});

module.exports = UserPipelineProgress;


