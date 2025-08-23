const User = require('./User');
const Exam = require('./Exam');
const Question = require('./Question');
const UserExamAssignment = require('./UserExamAssignment');
const ExamResponse = require('./ExamResponse');
const ExamResult = require('./ExamResult');

// User - Exam Assignment (Many-to-Many through UserExamAssignment)
User.belongsToMany(Exam, {
    through: UserExamAssignment,
    foreignKey: 'userId',
    otherKey: 'examId',
    as: 'assignedExams'
});

Exam.belongsToMany(User, {
    through: UserExamAssignment,
    foreignKey: 'examId',
    otherKey: 'userId',
    as: 'assignedUsers'
});

// Exam - Question (One-to-Many)
Exam.hasMany(Question, {
    foreignKey: 'examId',
    as: 'questions'
});

Question.belongsTo(Exam, {
    foreignKey: 'examId',
    as: 'exam'
});

// User - ExamResult (One-to-Many)
User.hasMany(ExamResult, {
    foreignKey: 'userId',
    as: 'examResults'
});

ExamResult.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Exam - ExamResult (One-to-Many)
Exam.hasMany(ExamResult, {
    foreignKey: 'examId',
    as: 'results'
});

ExamResult.belongsTo(Exam, {
    foreignKey: 'examId',
    as: 'exam'
});

// User - ExamResponse (One-to-Many)
User.hasMany(ExamResponse, {
    foreignKey: 'userId',
    as: 'examResponses'
});

ExamResponse.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Exam - ExamResponse (One-to-Many)
Exam.hasMany(ExamResponse, {
    foreignKey: 'examId',
    as: 'responses'
});

ExamResponse.belongsTo(Exam, {
    foreignKey: 'examId',
    as: 'exam'
});

// Question - ExamResponse (One-to-Many)
Question.hasMany(ExamResponse, {
    foreignKey: 'questionId',
    as: 'responses'
});

ExamResponse.belongsTo(Question, {
    foreignKey: 'questionId',
    as: 'question'
});

// UserExamAssignment associations
UserExamAssignment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

UserExamAssignment.belongsTo(Exam, {
    foreignKey: 'examId',
    as: 'exam'
});

UserExamAssignment.belongsTo(User, {
    foreignKey: 'assignedBy',
    as: 'assignedByUser'
});

module.exports = {
    User,
    Exam,
    Question,
    UserExamAssignment,
    ExamResponse,
    ExamResult
}; 