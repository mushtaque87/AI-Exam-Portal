import React from 'react';
import { FaPlus, FaFileAlt } from 'react-icons/fa';

const ExamList = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#1e293b' }}>Exam Management</h1>
                <button className="btn btn-primary">
                    <FaPlus />
                    Create New Exam
                </button>
            </div>

            <div className="card">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <FaFileAlt size={64} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Exam Management</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                        This feature allows you to create, edit, and manage exams. You can:
                    </p>
                    <ul style={{
                        textAlign: 'left',
                        maxWidth: '500px',
                        margin: '0 auto',
                        color: '#64748b',
                        lineHeight: '2'
                    }}>
                        <li>• Create new exams with custom settings</li>
                        <li>• Add questions manually or import from Excel</li>
                        <li>• Assign exams to specific users</li>
                        <li>• View exam statistics and results</li>
                        <li>• Export exam questions and results</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ExamList; 