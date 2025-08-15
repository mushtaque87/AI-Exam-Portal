import React, { useState } from 'react';
import axios from 'axios';

const AddUser = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/users', form);
            alert(`User added: ${form.name} (${form.role})`);
            // Optionally, redirect or clear form here
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add user';
            alert(message);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Add New User</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Name:</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Email:</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Password:</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Role:</label>
                    <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }}>
                        <option value="admin">Admin</option>
                        <option value="student">Student</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add User</button>
            </form>
        </div>
    );
};

export default AddUser;
