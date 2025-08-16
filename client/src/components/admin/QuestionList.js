import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';

const QuestionList = ({ examId, examTitle }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [formData, setFormData] = useState({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        points: 1,
        explanation: ''
    });

    const fetchQuestions = useCallback(async () => {
        try {
            const response = await axios.get(`/api/questions/exam/${examId}`);
            setQuestions(response.data.questions);
        } catch (error) {
            toast.error('Failed to fetch questions');
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        if (examId) {
            fetchQuestions();
        }
    }, [examId, fetchQuestions]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                examId: parseInt(examId)
            };

            if (editingQuestion) {
                await axios.put(`/api/questions/${editingQuestion.id}`, submitData);
                toast.success('Question updated successfully');
            } else {
                await axios.post('/api/questions', submitData);
                toast.success('Question created successfully');
            }
            setShowModal(false);
            setEditingQuestion(null);
            resetForm();
            fetchQuestions();
        } catch (error) {
            const message = error.response?.data?.message || 'Operation failed';
            toast.error(message);
        }
    };

    const handleEdit = (question) => {
        setEditingQuestion(question);
        setFormData({
            questionText: question.questionText,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctOption: question.correctOption,
            points: question.points,
            explanation: question.explanation || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (questionId) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                await axios.delete(`/api/questions/${questionId}`);
                toast.success('Question deleted successfully');
                fetchQuestions();
            } catch (error) {
                const message = error.response?.data?.message || 'Failed to delete question';
                toast.error(message);
            }
        }
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) {
            toast.error('Please select a file to import');
            return;
        }

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await axios.post(`/api/exams/${examId}/import-questions`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success(response.data.message);
            setShowImportModal(false);
            setImportFile(null);
            fetchQuestions();
        } catch (error) {
            const message = error.response?.data?.message || 'Import failed';
            const errors = error.response?.data?.errors;
            toast.error(message);
            if (errors && Array.isArray(errors)) {
                errors.forEach(err => toast.error(err));
            }
        }
    };

    const resetForm = () => {
        setFormData({
            questionText: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: 'A',
            points: 1,
            explanation: ''
        });
    };

    const openModal = () => {
        setEditingQuestion(null);
        resetForm();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingQuestion(null);
        resetForm();
    };

    const openImportModal = () => {
        setShowImportModal(true);
    };

    const closeImportModal = () => {
        setShowImportModal(false);
        setImportFile(null);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span>Loading questions...</span>
            </div>
        );
    }

    return (
        <div className="question-list">
            <div className="header">
                <h3>Questions for "{examTitle}"</h3>
                <div className="actions">
                    <button className="btn btn-secondary" onClick={openImportModal} style={{ marginRight: '10px' }}>
                        <FaUpload /> Import from Excel
                    </button>
                    <button className="btn btn-primary" onClick={openModal}>
                        <FaPlus /> Add Question
                    </button>
                </div>
            </div>

            {questions.length === 0 ? (
                <div className="empty-state">
                    <p>No questions found for this exam.</p>
                    <button className="btn btn-primary" onClick={openModal}>
                        <FaPlus /> Add First Question
                    </button>
                </div>
            ) : (
                <div className="question-grid">
                    {questions.map((question, index) => (
                        <div key={question.id} className="question-card">
                            <div className="question-header">
                                <h4>Question {index + 1}</h4>
                                <span className="points">{question.points} point{question.points !== 1 ? 's' : ''}</span>
                            </div>
                            <p className="question-text">{question.questionText}</p>
                            <div className="options">
                                <div className={`option ${question.correctOption === 'A' ? 'correct' : ''}`}>
                                    <strong>A:</strong> {question.optionA}
                                </div>
                                <div className={`option ${question.correctOption === 'B' ? 'correct' : ''}`}>
                                    <strong>B:</strong> {question.optionB}
                                </div>
                                <div className={`option ${question.correctOption === 'C' ? 'correct' : ''}`}>
                                    <strong>C:</strong> {question.optionC}
                                </div>
                                <div className={`option ${question.correctOption === 'D' ? 'correct' : ''}`}>
                                    <strong>D:</strong> {question.optionD}
                                </div>
                            </div>
                            {question.explanation && (
                                <div className="explanation">
                                    <strong>Explanation:</strong> {question.explanation}
                                </div>
                            )}
                            <div className="question-actions">
                                <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => handleEdit(question)}
                                >
                                    <FaEdit /> Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(question.id)}
                                >
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Question Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
                            <button className="close-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Question Text</label>
                                <textarea
                                    value={formData.questionText}
                                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                                    required
                                    rows="3"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Option A</label>
                                    <input
                                        type="text"
                                        value={formData.optionA}
                                        onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Option B</label>
                                    <input
                                        type="text"
                                        value={formData.optionB}
                                        onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Option C</label>
                                    <input
                                        type="text"
                                        value={formData.optionC}
                                        onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Option D</label>
                                    <input
                                        type="text"
                                        value={formData.optionD}
                                        onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Correct Option</label>
                                    <select
                                        value={formData.correctOption}
                                        onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Points</label>
                                    <input
                                        type="number"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Explanation (Optional)</label>
                                <textarea
                                    value={formData.explanation}
                                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                    rows="2"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingQuestion ? 'Update Question' : 'Add Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Questions Modal */}
            {showImportModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Import Questions from Excel</h3>
                            <button className="close-btn" onClick={closeImportModal}>&times;</button>
                        </div>
                        <form onSubmit={handleImportSubmit}>
                            <div className="form-group">
                                <label>Excel File (.xlsx or .xls)</label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                    required
                                />
                                <small className="form-text">
                                    Excel file should have columns: Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Points (optional), Explanation (optional)
                                </small>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeImportModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Import Questions
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionList;