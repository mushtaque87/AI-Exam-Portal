import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaUserGraduate, FaUserShield, FaSearch, FaFilter, FaSync, FaCheckSquare, FaSquare } from 'react-icons/fa';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        isActive: true
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(10);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        studentUsers: 0
    });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            // Build params object, only including parameters that have values
            const params = {};

            if (currentPage && currentPage > 1) {
                params.page = currentPage;
            }

            if (itemsPerPage && itemsPerPage !== 10) {
                params.limit = itemsPerPage;
            }

            if (searchTerm) {
                params.search = searchTerm;
            }

            if (roleFilter) {
                params.role = roleFilter;
            }

            // Only add isActive parameter if it has a value
            if (statusFilter === 'true') {
                params.isActive = true;
            } else if (statusFilter === 'false') {
                params.isActive = false;
            }

            const response = await axios.get('/api/users', { params });
            setUsers(response.data.users);
            setTotalPages(response.data.pagination.totalPages);
            setTotalItems(response.data.pagination.totalItems);
        } catch (error) {
            toast.error('Failed to fetch users: ' + (error.response?.data?.message || error.message));
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, searchTerm, roleFilter, statusFilter]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get('/api/users/stats/overview');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [fetchUsers, fetchStats]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Update existing user
                const response = await axios.put(`/api/users/${editingUser.id}`, formData);
                toast.success('User updated successfully');

                // Update user in state
                setUsers(users.map(user =>
                    user.id === editingUser.id ? response.data.user : user
                ));
            } else {
                // Create new user
                const response = await axios.post('/api/auth/register', formData);
                toast.success('User created successfully');

                // Add new user to state
                setUsers([...users, response.data.user]);
            }

            setShowModal(false);
            setEditingUser(null);
            resetForm();
            fetchStats(); // Refresh stats
        } catch (error) {
            const message = error.response?.data?.message || 'Operation failed';
            toast.error(message);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            password: '' // Don't prefill password
        });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await axios.delete(`/api/users/${userId}`);
                toast.success('User deleted successfully');
                fetchUsers(); // Refresh the list
                fetchStats(); // Refresh stats
            } catch (error) {
                const message = error.response?.data?.message || 'Failed to delete user';
                toast.error(message);
            }
        }
    };

    const handleBulkActivate = async () => {
        if (selectedUsers.length === 0) {
            toast.info('Please select users to activate');
            return;
        }

        if (window.confirm(`Are you sure you want to activate ${selectedUsers.length} users?`)) {
            try {
                const promises = selectedUsers.map(userId =>
                    axios.put(`/api/users/${userId}`, { isActive: true })
                );

                await Promise.all(promises);
                toast.success(`${selectedUsers.length} users activated successfully`);
                setSelectedUsers([]);
                setSelectAll(false);
                fetchUsers(); // Refresh the list
                fetchStats(); // Refresh stats
            } catch (error) {
                const message = error.response?.data?.message || 'Failed to activate users';
                toast.error(message);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) {
            toast.info('Please select users to delete');
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
            try {
                const promises = selectedUsers.map(userId =>
                    axios.delete(`/api/users/${userId}`)
                );

                await Promise.all(promises);
                toast.success(`${selectedUsers.length} users deleted successfully`);
                setSelectedUsers([]);
                setSelectAll(false);
                fetchUsers(); // Refresh the list
                fetchStats(); // Refresh stats
            } catch (error) {
                const message = error.response?.data?.message || 'Failed to delete users';
                toast.error(message);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'student',
            isActive: true
        });
    };

    const openModal = () => {
        setEditingUser(null);
        resetForm();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        resetForm();
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchUsers();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedUsers([]);
        } else {
            const allUserIds = users.map(user => user.id);
            setSelectedUsers(allUserIds);
        }
        setSelectAll(!selectAll);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span>Loading users...</span>
            </div>
        );
    }

    return (
        <div className="user-management">
            <div className="user-header">
                <h1>User Management</h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={openModal}>
                        <FaPlus /> Add New User
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>{stats.totalUsers}</h3>
                    <p>Total Users</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.activeUsers}</h3>
                    <p>Active Users</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.adminUsers}</h3>
                    <p>Admin Users</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.studentUsers}</h3>
                    <p>Student Users</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="filters-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-group">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <FaSearch /> Search
                    </button>
                </form>

                <div className="filters">
                    <div className="filter-group">
                        <FaFilter className="filter-icon" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="student">Student</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Statuses</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>

                    <button onClick={clearFilters} className="btn btn-outline">
                        <FaSync /> Clear Filters
                    </button>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <div className="bulk-actions">
                    <p>{selectedUsers.length} user(s) selected</p>
                    <div className="bulk-buttons">
                        <button className="btn btn-success" onClick={handleBulkActivate}>
                            Activate Selected
                        </button>
                        <button className="btn btn-danger" onClick={handleBulkDelete}>
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Results Info */}
            <div className="results-info">
                <p>Showing {users.length} of {totalItems} users</p>
            </div>

            {/* User Grid */}
            <div className="user-grid">
                {users.map((user) => (
                    <div key={user.id} className="user-card">
                        <div className="user-select">
                            <button
                                className="select-button"
                                onClick={() => handleSelectUser(user.id)}
                            >
                                {selectedUsers.includes(user.id) ? <FaCheckSquare /> : <FaSquare />}
                            </button>
                        </div>
                        <div className="user-header">
                            <div className="user-icon">
                                {user.role === 'admin' ? <FaUserShield /> : <FaUserGraduate />}
                            </div>
                            <div className="user-info">
                                <h3>{user.name}</h3>
                                <p className="user-email">{user.email}</p>
                                <div className="user-meta">
                                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                                    <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="user-details">
                            <div className="detail-item">
                                <span className="detail-label">Last Login:</span>
                                <span className="detail-value">{formatDate(user.lastLogin)}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Created:</span>
                                <span className="detail-value">{formatDate(user.createdAt)}</span>
                            </div>
                        </div>

                        <div className="user-actions">
                            <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handleEdit(user)}
                            >
                                <FaEdit /> Edit
                            </button>
                            {user.isActive && (
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(user.id)}
                                >
                                    <FaTrash /> Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Select All */}
            {users.length > 0 && (
                <div className="select-all">
                    <button
                        className="select-all-button"
                        onClick={handleSelectAll}
                    >
                        {selectAll ? <FaCheckSquare /> : <FaSquare />} Select All
                    </button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn btn-outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    <span className="page-info">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        className="btn btn-outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                            <button className="close-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="form-input"
                                />
                            </div>
                            {!editingUser && (
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="form-input"
                                        minLength="6"
                                    />
                                    <small>Password must be at least 6 characters</small>
                                </div>
                            )}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="form-select"
                                    >
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                        className="form-select"
                                    >
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;