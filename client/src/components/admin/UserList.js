import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaUser, FaUserGraduate, FaUserShield } from 'react-icons/fa';

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

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data.users);
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

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
        if (window.confirm('Are you sure you want to deactivate this user?')) {
            try {
                await axios.delete(`/api/users/${userId}`);
                toast.success('User deactivated successfully');
                fetchUsers(); // Refresh the list
            } catch (error) {
                const message = error.response?.data?.message || 'Failed to deactivate user';
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

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span>Loading users...</span>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#1e293b' }}>User Management</h1>
                <button className="btn btn-primary" onClick={openModal}>
                    <FaPlus />
                    Add New User
                </button>
            </div>

            <div className="user-grid">
                {users.map((user) => (
                    <div key={user.id} className="user-card">
                        <div className="user-header">
                            <div className="user-icon">
                                {user.role === 'admin' ? <FaUserShield /> : <FaUserGraduate />}
                            </div>
                            <div>
                                <h3>{user.name}</h3>
                                <p className="user-email">{user.email}</p>
                                <span className={`role-badge ${user.role}`}>{user.role}</span>
                                <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
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
                                    <FaTrash /> Deactivate
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

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
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
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
                                    />
                                </div>
                            )}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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