import React from 'react';
import { FaFileAlt, FaClock, FaCheckCircle } from 'react-icons/fa';

const TakeExam = () => {
    return (
        <div>
            <h1 style={{ marginBottom: '2rem', color: '#1e293b' }}>Take Exam</h1>

            <div className="card">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <FaFileAlt size={64} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Exam Interface</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                        This is where you take your assigned exams. Features include:
                    </p>
                    <ul style={{
                        textAlign: 'left',
                        maxWidth: '500px',
                        margin: '0 auto',
                        color: '#64748b',
                        lineHeight: '2'
                    }}>
                        <li>• Real-time countdown timer</li>
                        <li>• Multiple choice questions (A, B, C, D)</li>
                        <li>• Auto-save progress</li>
                        <li>• Question navigation</li>
                        <li>• Submit exam when complete</li>
                        <li>• View results immediately after submission</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TakeExam; 