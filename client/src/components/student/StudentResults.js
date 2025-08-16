import React from 'react';
import { FaChartBar } from 'react-icons/fa';

const StudentResults = () => {
    return (
        <div>
            <h1 style={{ marginBottom: '2rem', color: '#1e293b' }}>My Results</h1>

            <div className="card">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <FaChartBar size={64} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>My Results</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                        This page shows all your exam results and performance analytics. You can:
                    </p>
                    <ul style={{
                        textAlign: 'left',
                        maxWidth: '500px',
                        margin: '0 auto',
                        color: '#64748b',
                        lineHeight: '2'
                    }}>
                        <li>• View detailed results for each exam</li>
                        <li>• See correct answers and explanations</li>
                        <li>• Track your performance over time</li>
                        <li>• View pass/fail status</li>
                        <li>• Analyze your strengths and weaknesses</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StudentResults; 