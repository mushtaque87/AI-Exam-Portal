import React from 'react';
import { FaFileAlt, FaClock } from 'react-icons/fa';

const StudentExams = () => {
    return (
        <div>
            <h1 style={{ marginBottom: '2rem', color: '#1e293b' }}>My Exams</h1>

            <div className="card">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <FaFileAlt size={64} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>My Exams</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                        This page shows all exams assigned to you. You can:
                    </p>
                    <ul style={{
                        textAlign: 'left',
                        maxWidth: '500px',
                        margin: '0 auto',
                        color: '#64748b',
                        lineHeight: '2'
                    }}>
                        <li>• View all exams assigned to you</li>
                        <li>• Start exams that are available</li>
                        <li>• View exam details and instructions</li>
                        <li>• See your previous exam results</li>
                        <li>• Track your progress and performance</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StudentExams; 