const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserExamAssignment = sequelize.define('UserExamAssignment', {
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
    assignedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    assignedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'user_exam_assignments',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'exam_id']
        }
    ]
});

module.exports = UserExamAssignment; 