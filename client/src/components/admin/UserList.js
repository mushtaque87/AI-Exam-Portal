import React from 'react';
import { FaUsers, FaPlus } from 'react-icons/fa';

const UserList = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#1e293b' }}>User Management</h1>
                <button className="btn btn-primary">
                    <FaPlus />
                    Add New User
                </button>
            </div>

            <div className="card">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <FaUsers size={64} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>User Management</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                        This feature allows you to manage users and their exam assignments. You can:
                    </p>
                    <ul style={{
                        textAlign: 'left',
                        maxWidth: '500px',
                        margin: '0 auto',
                        color: '#64748b',
                        lineHeight: '2'
                    }}>
                        <li>• Add new users (admin or student)</li>
                        <li>• Edit user profiles and settings</li>
                        <li>• Assign exams to specific users</li>
                        <li>• View user statistics and performance</li>
                        <li>• Deactivate users when needed</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UserList; 