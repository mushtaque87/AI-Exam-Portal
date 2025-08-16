const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    examId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'exams',
            key: 'id'
        }
    },
    questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    optionA: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true }
    },
    optionB: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true }
    },
    optionC: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true }
    },
    optionD: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true }
    },
    correctOption: {
        type: DataTypes.ENUM('A', 'B', 'C', 'D'),
        allowNull: false,
        validate: {
            isIn: [['A', 'B', 'C', 'D']]
        }
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'questions'
});

module.exports = Question;












