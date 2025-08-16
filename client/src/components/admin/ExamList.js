import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaDownload, FaQuestionCircle, FaUserPlus } from 'react-icons/fa';
import QuestionList from './QuestionList';

const ExamList = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [showQuestions, setShowQuestions] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [users, setUsers] = useState([]);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 60,
        totalQuestions: 10,
        passingScore: 70,
        instructions: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await axios.get('/api/exams');
            setExams(response.data.exams);
        } catch (error) {
            toast.error('Failed to fetch exams');
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert date strings to ISO format
            const submitData = {
                ...formData,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
            };

            if (editingExam) {
                await axios.put(`/api/exams/${editingExam.id}`, submitData);
                toast.success('Exam updated successfully');
            } else {
                await axios.post('/api/exams', submitData);
                toast.success('Exam created successfully');
            }
            setShowModal(false);
            setEditingExam(null);
            resetForm();
            fetchExams();
        } catch (error) {
            const message = error.response?.data?.message || 'Operation failed';
            toast.error(message);
        }
    };

    const handleEdit = (exam) => {
        setEditingExam(exam);
        setFormData({
            title: exam.title,
            description: exam.description,
            duration: exam.duration,
            totalQuestions: exam.totalQuestions,
            passingScore: exam.passingScore,
            instructions: exam.instructions,
            startDate: exam.startDate ? exam.startDate.split('T')[0] : '',
            endDate: exam.endDate ? exam.endDate.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (examId) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            try {
                await axios.delete(`/api/exams/${examId}`);
                toast.success('Exam deleted successfully');
                fetchExams();
            } catch (error) {
                toast.error('Failed to delete exam');
            }
        }
    };

    const handleManageQuestions = (exam) => {
        setShowQuestions(exam);
    };

    const handleBackToExams = () => {
        setShowQuestions(null);
    };

    const handleAssignUsers = async (exam) => {
        setSelectedExam(exam);
        try {
            // Fetch all users
            const usersResponse = await axios.get('/api/users');
            setUsers(usersResponse.data.users);

            // Fetch currently assigned users for this exam
            const examResponse = await axios.get(`/api/exams/${exam.id}`);
            const assigned = examResponse.data.exam.assignedUsers || [];
            setAssignedUsers(assigned);
            setSelectedUsers(assigned.map(user => user.id));

            setShowAssignModal(true);
        } catch (error) {
            toast.error('Failed to load assignment data');
            console.error('Error loading assignment data:', error);
        }
    };

    const handleUserSelection = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleAssignSubmit = async () => {
        try {
            await axios.post(`/api/exams/${selectedExam.id}/assign-users`, {
                userIds: selectedUsers
            });
            toast.success('Users assigned to exam successfully');
            setShowAssignModal(false);
            fetchExams(); // Refresh exam list to show updated assignment count
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to assign users';
            toast.error(message);
        }
    };

    const closeAssignModal = () => {
        setShowAssignModal(false);
        setSelectedExam(null);
        setUsers([]);
        setAssignedUsers([]);
        setSelectedUsers([]);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            duration: 60,
            totalQuestions: 10,
            passingScore: 70,
            instructions: '',
            startDate: '',
            endDate: ''
        });
    };

    const openModal = () => {
        setEditingExam(null);
        resetForm();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingExam(null);
        resetForm();
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span>Loading exams...</span>
            </div>
        );
    }

    if (showQuestions) {
        return (
            <div className="exam-list">
                <div className="header">
                    <button className="btn btn-secondary" onClick={handleBackToExams} style={{ marginRight: '10px' }}>
                        ← Back to Exams
                    </button>
                    <h2>Manage Questions</h2>
                </div>
                <QuestionList examId={showQuestions.id} examTitle={showQuestions.title} />
            </div>
        );
    }

    return (
        <div className="exam-list">
            <div className="header">
                <h2>Exam Management</h2>
                <button className="btn btn-primary" onClick={openModal}>
                    <FaPlus /> Create New Exam
                </button>
            </div>

            <div className="exam-grid">
                {exams.map((exam) => (
                    <div key={exam.id} className="exam-card">
                        <div className="exam-header">
                            <h3>{exam.title}</h3>
                            <span className={`status ${exam.isActive ? 'active' : 'inactive'}`}>
                                {exam.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="description">{exam.description}</p>
                        <div className="exam-details">
                            <div className="detail">
                                <strong>Duration:</strong> {exam.duration} minutes
                            </div>
                            <div className="detail">
                                <strong>Questions:</strong> {exam.totalQuestions}
                            </div>
                            <div className="detail">
                                <strong>Passing Score:</strong> {exam.passingScore}%
                            </div>
                        </div>
                        <div className="exam-actions">
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handleEdit(exam)}
                            >
                                <FaEdit /> Edit
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(exam.id)}
                            >
                                <FaTrash /> Delete
                            </button>
                            <button
                                className="btn btn-sm btn-info"
                                onClick={() => handleManageQuestions(exam)}
                                title="Manage Questions"
                            >
                                <FaQuestionCircle /> Questions
                            </button>
                            <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleAssignUsers(exam)}
                                title="Assign Users"
                            >
                                <FaUserPlus /> Assign
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingExam ? 'Edit Exam' : 'Create New Exam'}</h3>
                            <button className="close-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Duration (minutes)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Total Questions</label>
                                    <input
                                        type="number"
                                        value={formData.totalQuestions}
                                        onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Passing Score (%)</label>
                                    <input
                                        type="number"
                                        value={formData.passingScore}
                                        onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                        min="0"
                                        max="100"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Instructions</label>
                                <textarea
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingExam ? 'Update Exam' : 'Create Exam'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Users Modal */}
            {showAssignModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Assign Users to "{selectedExam?.title}"</h3>
                            <button className="close-btn" onClick={closeAssignModal}>&times;</button>
                        </div>
                        <div className="form-group">
                            <label>Select Users to Assign:</label>
                            <div className="user-list">
                                {users.map(user => (
                                    <div key={user.id} className="user-checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleUserSelection(user.id)}
                                            />
                                            <span className="user-info">
                                                {user.name} ({user.email})
                                                <span className={`role-badge ${user.role}`}>{user.role}</span>
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={closeAssignModal}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleAssignSubmit}>
                                Assign Users
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamList;
