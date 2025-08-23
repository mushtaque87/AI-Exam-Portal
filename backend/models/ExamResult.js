const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamResult = sequelize.define('ExamResult', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    examId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'exams',
            key: 'id'
        }
    },
    score: {
        type: DataTypes.DECIMAL(5, 2), // Score as percentage
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    correctAnswers: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalPoints: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    earnedPoints: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    timeTaken: {
        type: DataTypes.INTEGER, // Time taken in seconds
        allowNull: false
    },
    submittedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('passed', 'failed', 'incomplete'),
        allowNull: false
    },
    isPassed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    tableName: 'exam_results',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'exam_id']
        }
    ]
});

module.exports = ExamResult; 