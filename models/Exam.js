const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define('Exam', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER, // Duration in minutes
        allowNull: true,
        defaultValue: 60
    },
    totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    passingScore: {
        type: DataTypes.INTEGER, // Passing score as percentage
        allowNull: true,
        defaultValue: 70
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'exams'
});

module.exports = Exam;


