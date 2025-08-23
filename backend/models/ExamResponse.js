const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamResponse = sequelize.define('ExamResponse', {
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
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'questions',
            key: 'id'
        }
    },
    selectedOption: {
        type: DataTypes.ENUM('A', 'B', 'C', 'D'),
        allowNull: true
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    pointsEarned: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    timeSpent: {
        type: DataTypes.INTEGER, // Time spent in seconds
        defaultValue: 0
    }
}, {
    tableName: 'exam_responses',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'exam_id', 'question_id']
        }
    ]
});

module.exports = ExamResponse; 