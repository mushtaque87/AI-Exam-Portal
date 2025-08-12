import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FaUsers,
    FaFileAlt,
    FaChartBar,
    FaPlus,
    FaDownload,
    FaEye
} from 'react-icons/fa';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [userStats, examStats, resultStats] = await Promise.all([
                axios.get('/api/users/stats/overview'),
                axios.get('/api/exams/stats/overview'),
                axios.get('/api/results/stats/overview')
            ]);

            setStats({
                users: userStats.data,
                exams: examStats.data,
                results: resultStats.data
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load dashboard statistics');
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

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', color: '#1e293b' }}>Admin Dashboard</h1>

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
                                Total Users
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                                {stats?.users?.totalUsers || 0}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                {stats?.users?.activeUsers || 0} active
                            </p>
                        </div>
                        <FaUsers size={32} style={{ color: '#3b82f6' }} />
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Total Exams
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                                {stats?.exams?.totalExams || 0}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                {stats?.exams?.activeExams || 0} active
                            </p>
                        </div>
                        <FaFileAlt size={32} style={{ color: '#10b981' }} />
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Total Results
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                                {stats?.results?.totalResults || 0}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                {stats?.results?.passRate || 0}% pass rate
                            </p>
                        </div>
                        <FaChartBar size={32} style={{ color: '#f59e0b' }} />
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Average Score
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                                {stats?.results?.averageScore || 0}%
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Recent: {stats?.results?.recentResults || 0}
                            </p>
                        </div>
                        <FaChartBar size={32} style={{ color: '#8b5cf6' }} />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Quick Actions</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <Link to="/admin/users" className="btn btn-primary" style={{ textAlign: 'center' }}>
                        <FaUsers />
                        Manage Users
                    </Link>
                    <Link to="/admin/exams" className="btn btn-success" style={{ textAlign: 'center' }}>
                        <FaFileAlt />
                        Manage Exams
                    </Link>
                    <Link to="/admin/results" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        <FaChartBar />
                        View Results
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>System Overview</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1rem'
                }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#374151' }}>User Statistics</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                                <span style={{ color: '#64748b' }}>Admin Users:</span>
                                <span style={{ float: 'right', fontWeight: 'bold' }}>{stats?.users?.adminUsers || 0}</span>
                            </li>
                            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                                <span style={{ color: '#64748b' }}>Student Users:</span>
                                <span style={{ float: 'right', fontWeight: 'bold' }}>{stats?.users?.studentUsers || 0}</span>
                            </li>
                            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                                <span style={{ color: '#64748b' }}>Users with Exams:</span>
                                <span style={{ float: 'right', fontWeight: 'bold' }}>{stats?.users?.usersWithExams || 0}</span>
                            </li>
                            <li style={{ padding: '0.5rem 0' }}>
                                <span style={{ color: '#64748b' }}>Users with Results:</span>
                                <span style={{ float: 'right', fontWeight: 'bold' }}>{stats?.users?.usersWithResults || 0}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#374151' }}>Exam Statistics</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                                <span style={{ color: '#64748b' }}>Total Questions:</span>
                                <span style={{ float: 'right', fontWeight: 'bold' }}>{stats?.exams?.totalQuestions || 0}</span>
                            </li>
                            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                                <span style={{ color: '#64748b' }}>Total Assignments:</span>
                                <span style={{ float: 'right', fontWeight: 'bold' }}>{stats?.exams?.totalAssignments || 0}</span>
                            </li>
                            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                                <span style={{ color: '#64748b' }}>Total Results:</span>
                                <span style={{ float: 'right', fontWeight: 'bold' }}>{stats?.exams?.totalResults || 0}</span>
                            </li>
                            <li style={{ padding: '0.5rem 0' }}>
                                <span style={{ color: '#64748b' }}>Average Score:</span>
                                <span style={{ float: 'right', fontWeight: 'bold' }}>{stats?.exams?.averageScore || 0}%</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 