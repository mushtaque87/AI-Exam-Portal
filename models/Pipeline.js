const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pipeline = sequelize.define('Pipeline', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    stages: {
        // Array of stage names in order
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
            isValidStages(value) {
                if (!Array.isArray(value)) {
                    throw new Error('Stages must be an array');
                }
                if (value.length < 1 || value.length > 10) {
                    throw new Error('Stages must contain between 1 and 10 items');
                }
                for (const stageName of value) {
                    if (typeof stageName !== 'string' || stageName.trim().length === 0) {
                        throw new Error('Each stage name must be a non-empty string');
                    }
                    if (stageName.length > 100) {
                        throw new Error('Stage name length must be <= 100 characters');
                    }
                }
            }
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'pipelines'
});

module.exports = Pipeline;


