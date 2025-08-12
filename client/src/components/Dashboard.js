import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBrain } from 'react-icons/fa';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect based on user role
        if (user?.role === 'admin') {
            navigate('/admin');
        } else if (user?.role === 'student') {
            navigate('/student');
        }
    }, [user, navigate]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            flexDirection: 'column'
        }}>
            <FaBrain size={64} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: '#64748b' }}>Redirecting...</p>
        </div>
    );
};

export default Dashboard; 