import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaQuestionCircle, FaUserPlus } from 'react-icons/fa';
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
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalExams, setTotalExams] = useState(0);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalExams / itemsPerPage);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 60,
        totalQuestions: 10,
        passingScore: 70,
        instructions: '',
        startDate: '',
        endDate: '',
        date: ''
    });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async (page = currentPage) => {
        try {
            setLoading(true);
            const offset = (page - 1) * itemsPerPage;
            const response = await axios.get(`/api/exams?limit=${itemsPerPage}&offset=${offset}`);
            setExams(response.data.exams);
            setTotalExams(response.data.total || response.data.exams.length);
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
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                date: formData.date ? new Date(formData.date).toISOString() : null
            };

            if (editingExam) {
                await axios.put(`/api/exams/${editingExam.id}`, submitData);
                toast.success('Exam updated successfully');
            } else {
                await axios.post('/api/exams', submitData);
                toast.success('Exam created successfully');
                // After creating an exam, navigate to its questions view
                if (!editingExam) {
                    // For new exams, we need to fetch the created exam to get its ID
                    // This is a simplified approach - in a real app, you'd get the ID from the response
                    // For now, we'll just refresh the exams list and let the user manually go to questions
                }
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
            endDate: exam.endDate ? exam.endDate.split('T')[0] : '',
            date: exam.date ? exam.date.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (examId) => {
        if (window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            try {
                await axios.delete(`/api/exams/${examId}`);
                toast.success('Exam deleted successfully');
                fetchExams();
            } catch (error) {
                // Provide more specific error messages
                if (error.response) {
                    if (error.response.status === 400) {
                        const message = error.response.data.message || 'Cannot delete exam. It may have associated results.';
                        toast.error(message);
                    } else if (error.response.status === 404) {
                        toast.error('Exam not found');
                    } else {
                        toast.error('Failed to delete exam: ' + (error.response.data.message || 'Server error'));
                    }
                } else if (error.request) {
                    toast.error('Failed to delete exam: No response from server');
                } else {
                    toast.error('Failed to delete exam: ' + error.message);
                }
                console.error('Error deleting exam:', error);
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
            // Check authentication first
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please log in to continue');
                return;
            }
            
            // Fetch all users
            const usersResponse = await axios.get('/api/users');
            if (!usersResponse.data || !usersResponse.data.users) {
                throw new Error('Invalid users response format');
            }
            setUsers(usersResponse.data.users);

            // Fetch currently assigned users for this exam
            const examResponse = await axios.get(`/api/exams/${exam.id}`);
            if (!examResponse.data || !examResponse.data.exam) {
                throw new Error('Invalid exam response format');
            }
            
            const assigned = examResponse.data.exam.assignedUsers || [];
            setSelectedUsers(assigned.map(user => user.id));

            setShowAssignModal(true);
        } catch (error) {
            console.error('Assignment data loading error:', error);
            
            // Handle specific error cases
            if (error.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                // Optionally redirect to login
            } else if (error.response?.status === 404) {
                toast.error('Exam not found or has been deleted.');
            } else if (error.response?.status === 500) {
                toast.error('Server error. Please try again later.');
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to load assignment data';
                toast.error(errorMessage);
            }
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
            endDate: '',
            date: ''
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchExams(page);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
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

            <div className="table-container">
                <table className="exam-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Duration</th>
                            <th>Questions</th>
                            <th>Passing Score</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.map((exam) => (
                            <tr key={exam.id}>
                                <td className="exam-title">{exam.title}</td>
                                <td className="exam-description">{exam.description}</td>
                                <td>{exam.duration} min</td>
                                <td>{exam.totalQuestions}</td>
                                <td>{exam.passingScore}%</td>
                                <td>
                                    <span className={`status ${exam.isActive ? 'active' : 'inactive'}`}>
                                        {exam.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="exam-actions">
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => handleEdit(exam)}
                                        title="Edit Exam"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(exam.id)}
                                        title="Delete Exam"
                                    >
                                        <FaTrash />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-info"
                                        onClick={() => handleManageQuestions(exam)}
                                        title="Manage Questions"
                                    >
                                        <FaQuestionCircle />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleAssignUsers(exam)}
                                        title="Assign Users"
                                    >
                                        <FaUserPlus />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalExams)} of {totalExams} exams
                    </div>
                    <div className="pagination-controls">
                        <button 
                            className="btn btn-sm btn-outline" 
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button 
                            className="btn btn-sm btn-outline" 
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

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
                                <label>Exam Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
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
