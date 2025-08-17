import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaQuestionCircle, FaUsers, FaChartBar, FaCalendarAlt, FaUserCheck, FaSearch, FaFilter, FaFileExport, FaCheckCircle, FaClock, FaUserPlus } from 'react-icons/fa';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stats, setStats] = useState({
        totalExams: 0,
        activeExams: 0,
        totalAssignments: 0,
        completedExams: 0
    });
    const [formData, setFormData] = useState({
        title: '',
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
        fetchStats();
    }, []);

    const fetchExams = async () => {
        try {
            // Fetch all exams without pagination limits
            const response = await axios.get('/api/exams?limit=100');
            if (!response.data || !Array.isArray(response.data.exams)) {
                throw new Error('Invalid exam data received');
            }
            setExams(response.data.exams);
        } catch (error) {
            toast.error('Failed to fetch exams: ' + (error.response?.data?.message || error.message));
            console.error('Error fetching exams:', error);
            // Don't log out user on error, just show empty state
            setExams([]);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchStats = async () => {
        try {
            // In a real application, you would fetch these stats from the backend
            // For now, we'll calculate them from the exams data
            const response = await axios.get('/api/exams?limit=100');
            if (!response.data || !Array.isArray(response.data.exams)) {
                throw new Error('Invalid exam data received');
            }
            const allExams = response.data.exams;
            
            const activeExams = allExams.filter(exam => exam.isActive).length;
            const totalAssignments = allExams.reduce((sum, exam) => sum + (exam.assignedUsers?.length || 0), 0);
            
            // For completed exams, in a real app you would get this from the backend
            // Here we're just estimating based on dates
            const now = new Date();
            const completedExams = allExams.filter(exam => {
                return exam.endDate && new Date(exam.endDate) < now;
            }).length;
            
            setStats({
                totalExams: allExams.length,
                activeExams,
                totalAssignments,
                completedExams
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Set default stats on error
            setStats({
                totalExams: 0,
                activeExams: 0,
                totalAssignments: 0,
                completedExams: 0
            });
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
            // Fetch all users
            const usersResponse = await axios.get('/api/users');
            if (!usersResponse.data || !Array.isArray(usersResponse.data.users)) {
                throw new Error('Invalid user data received');
            }
            setUsers(usersResponse.data.users);

            // Fetch currently assigned users for this exam
            const examResponse = await axios.get(`/api/exams/${exam.id}`);
            if (!examResponse.data || !examResponse.data.exam) {
                throw new Error('Invalid exam data received');
            }
            const assigned = examResponse.data.exam.assignedUsers || [];
            setSelectedUsers(assigned.map(user => user.id));

            setShowAssignModal(true);
        } catch (error) {
            toast.error('Failed to load assignment data: ' + (error.response?.data?.message || error.message));
            console.error('Error loading assignment data:', error);
        }
    };

    const handleUserSelection = (userId) => {
        if (!userId) {
            console.error('Invalid user ID in selection');
            return;
        }
        
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
            if (!selectedExam || !selectedExam.id) {
                throw new Error('No exam selected');
            }
            
            await axios.post(`/api/exams/${selectedExam.id}/assign-users`, {
                userIds: selectedUsers
            });
            toast.success('Users assigned to exam successfully');
            setShowAssignModal(false);
            fetchExams(); // Refresh exam list to show updated assignment count
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to assign users';
            toast.error(message);
            console.error('Error assigning users:', error);
            // Don't close the modal on error so user can try again
        }
    };

    const closeAssignModal = () => {
        setShowAssignModal(false);
        // Use setTimeout to ensure state is cleaned up after modal animation completes
        setTimeout(() => {
            setSelectedExam(null);
            setUsers([]);
            setSelectedUsers([]);
        }, 300);
    };

    const resetForm = () => {
        setFormData({
            title: '',
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

    // Filter exams based on search term and status filter
    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            exam.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterStatus === 'all') return matchesSearch;
        if (filterStatus === 'active') return matchesSearch && exam.isActive;
        if (filterStatus === 'inactive') return matchesSearch && !exam.isActive;
        
        return matchesSearch;
    });

    return (
        <div className="exam-list">
            <div className="dashboard-header">
                <h1>Exam Management</h1>
                <div className="dashboard-actions">
                    <button className="btn btn-outline" onClick={() => {/* Export functionality */}}>
                        <FaFileExport /> Export
                    </button>
                    <button className="btn btn-primary" onClick={openModal}>
                        <FaPlus /> Create New Exam
                    </button>
                </div>
            </div>
            
            {/* Stats Dashboard */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaChartBar />
                    </div>
                    <h3>{stats.totalExams}</h3>
                    <p>Total Exams</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active">
                        <FaCalendarAlt />
                    </div>
                    <h3>{stats.activeExams}</h3>
                    <p>Active Exams</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaUsers />
                    </div>
                    <h3>{stats.totalAssignments}</h3>
                    <p>Total Assignments</p>
                </div>
                <div className="stat-card">
                    <div className="stat-icon completed">
                        <FaCheckCircle />
                    </div>
                    <h3>{stats.completedExams}</h3>
                    <p>Completed Exams</p>
                </div>
            </div>
            
            {/* Search and Filters */}
            <div className="filters-section">
                <div className="search-form">
                    <div className="search-input-group">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search exams..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filters">
                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <select 
                                className="filter-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="results-info">
                Showing {filteredExams.length} of {exams.length} exams
            </div>

            <div className="exam-grid responsive-grid">
                {filteredExams.map((exam) => (
                    <div key={exam.id} className="exam-card">
                        <div className="exam-header">
                            <h3>{exam.title}</h3>
                            <span className={`status ${exam.isActive ? 'active' : 'inactive'}`}>
                                {exam.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
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
                    <div className="modal modal-large">
                        <div className="modal-header">
                            <h3>{editingExam ? 'Edit Exam' : 'Create New Exam'}</h3>
                            <button className="close-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-tabs">
                                <div className="form-sections">
                                    <div className="form-section">
                                        <h4 className="section-title">Basic Information</h4>
                                        <div className="form-group">
                                            <label htmlFor="title">Title</label>
                                            <input
                                                id="title"
                                                type="text"
                                                className="form-input"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="Enter exam title"
                                                required
                                            />
                                        </div>

                                    </div>
                                    
                                    <div className="form-section">
                                        <h4 className="section-title">Exam Settings</h4>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="duration">
                                                    <span className="label-icon"><FaClock /></span>
                                                    Duration (minutes)
                                                </label>
                                                <input
                                                    id="duration"
                                                    type="number"
                                                    className="form-input"
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                                    min="1"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="totalQuestions">
                                                    <span className="label-icon"><FaQuestionCircle /></span>
                                                    Total Questions
                                                </label>
                                                <input
                                                    id="totalQuestions"
                                                    type="number"
                                                    className="form-input"
                                                    value={formData.totalQuestions}
                                                    onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                                                    min="1"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="passingScore">
                                                <span className="label-icon"><FaCheckCircle /></span>
                                                Passing Score (%)
                                            </label>
                                            <input
                                                id="passingScore"
                                                type="number"
                                                className="form-input"
                                                value={formData.passingScore}
                                                onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                                min="0"
                                                max="100"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-section">
                                        <h4 className="section-title">Schedule</h4>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="startDate">
                                                    <span className="label-icon"><FaCalendarAlt /></span>
                                                    Start Date
                                                </label>
                                                <input
                                                    id="startDate"
                                                    type="date"
                                                    className="form-input"
                                                    value={formData.startDate}
                                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="endDate">
                                                    <span className="label-icon"><FaCalendarAlt /></span>
                                                    End Date
                                                </label>
                                                <input
                                                    id="endDate"
                                                    type="date"
                                                    className="form-input"
                                                    value={formData.endDate}
                                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="examDate">
                                                <span className="label-icon"><FaCalendarAlt /></span>
                                                Exam Date
                                            </label>
                                            <input
                                                id="examDate"
                                                type="date"
                                                className="form-input"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-section">
                                        <h4 className="section-title">Additional Information</h4>
                                        <div className="form-group">
                                            <label htmlFor="instructions">Instructions</label>
                                            <textarea
                                                id="instructions"
                                                className="form-textarea"
                                                value={formData.instructions}
                                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                                rows="3"
                                                placeholder="Enter instructions for students taking this exam"
                                            />
                                        </div>
                                    </div>
                                </div>
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
                                {users && users.length > 0 ? (
                                    users.map(user => (
                                        <div key={user.id || 'unknown'} className="user-checkbox">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={user.id && selectedUsers.includes(user.id)}
                                                    onChange={() => handleUserSelection(user.id)}
                                                    disabled={!user.id}
                                                />
                                                <span className="user-info">
                                                    {user.name || 'Unknown'} ({user.email || 'No email'})
                                                    <span className={`role-badge ${user.role || 'unknown'}`}>{user.role || 'unknown'}</span>
                                                </span>
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <div>No users available to assign</div>
                                )}
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
