import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FaFileAlt,
    FaChartBar,
    FaClock,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';

const StudentDashboard = () => {
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [examsResponse, resultsResponse] = await Promise.all([
                axios.get('/api/results/my-exams'),
                axios.get('/api/results/my-results')
            ]);

            setExams(examsResponse.data.exams || []);
            setResults(resultsResponse.data.results || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span style={{ marginLeft: '1rem' }}>Loading dashboard...</span>
            </div>
        );
    }

    const availableExams = exams.filter(exam => exam.canTake);
    const completedExams = exams.filter(exam => exam.result);
    const recentResults = results.slice(0, 5);

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', color: '#1e293b' }}>Student Dashboard</h1>

            {/* Statistics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Available Exams
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                                {availableExams.length}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Ready to take
                            </p>
                        </div>
                        <FaFileAlt size={32} style={{ color: '#3b82f6' }} />
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Completed Exams
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                                {completedExams.length}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Total taken
                            </p>
                        </div>
                        <FaCheckCircle size={32} style={{ color: '#10b981' }} />
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Average Score
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                                {results.length > 0
                                    ? Math.round(results.reduce((sum, result) => sum + parseFloat(result.score), 0) / results.length)
                                    : 0}%
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Overall performance
                            </p>
                        </div>
                        <FaChartBar size={32} style={{ color: '#f59e0b' }} />
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Pass Rate
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                                {results.length > 0
                                    ? Math.round((results.filter(r => r.isPassed).length / results.length) * 100)
                                    : 0}%
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Success rate
                            </p>
                        </div>
                        <FaCheckCircle size={32} style={{ color: '#8b5cf6' }} />
                    </div>
                </div>
            </div>

            {/* Available Exams */}
            {availableExams.length > 0 && (
                <div className="card">
                    <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Available Exams</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1rem'
                    }}>
                        {availableExams.map(exam => (
                            <div key={exam.id} style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                backgroundColor: '#f9fafb'
                            }}>
                                <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>{exam.name}</h3>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                                    {exam.description}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        <FaClock style={{ marginRight: '0.25rem' }} />
                                        {exam.duration} minutes
                                    </div>
                                    <Link to={`/student/exam/${exam.id}`} className="btn btn-primary">
                                        Start Exam
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Results */}
            {recentResults.length > 0 && (
                <div className="card">
                    <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Recent Results</h2>
                    <div className="table">
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Exam</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentResults.map(result => (
                                    <tr key={result.id}>
                                        <td>{result.exam.name}</td>
                                        <td>
                                            <span style={{ fontWeight: 'bold' }}>
                                                {parseFloat(result.score).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td>
                                            {result.isPassed ? (
                                                <span className="badge badge-success">
                                                    <FaCheckCircle style={{ marginRight: '0.25rem' }} />
                                                    Passed
                                                </span>
                                            ) : (
                                                <span className="badge badge-danger">
                                                    <FaTimesCircle style={{ marginRight: '0.25rem' }} />
                                                    Failed
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {new Date(result.submittedAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <Link to={`/student/results/${result.examId}`} className="btn btn-outline" style={{ fontSize: '0.75rem' }}>
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card">
                <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Quick Actions</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <Link to="/student/exams" className="btn btn-primary" style={{ textAlign: 'center' }}>
                        <FaFileAlt />
                        View All Exams
                    </Link>
                    <Link to="/student/results" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        <FaChartBar />
                        View All Results
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard; 