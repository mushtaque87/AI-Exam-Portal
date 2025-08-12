import React from 'react';
import { FaChartBar, FaDownload } from 'react-icons/fa';

const ResultsList = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#1e293b' }}>Results Management</h1>
                <button className="btn btn-secondary">
                    <FaDownload />
                    Export Results
                </button>
            </div>

            <div className="card">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <FaChartBar size={64} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Results Management</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                        This feature allows you to view and analyze exam results. You can:
                    </p>
                    <ul style={{
                        textAlign: 'left',
                        maxWidth: '500px',
                        margin: '0 auto',
                        color: '#64748b',
                        lineHeight: '2'
                    }}>
                        <li>• View all exam results with detailed analytics</li>
                        <li>• Filter results by exam, user, or date range</li>
                        <li>• Export results to Excel for further analysis</li>
                        <li>• View performance statistics and trends</li>
                        <li>• Generate reports for individual users or exams</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ResultsList; 