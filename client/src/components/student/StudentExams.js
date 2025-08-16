import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const StudentExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignedExams();
    }, []);

    const fetchAssignedExams = async () => {
        try {
            const response = await axios.get('/api/results/my-exams');
            setExams(response.data.exams);
        } catch (error) {
            console.error('Error fetching assigned exams:', error);
            toast.error('Failed to load assigned exams');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span>Loading assigned exams...</span>
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', color: '#1e293b' }}>My Exams</h1>

            {exams.length === 0 ? (
                <div className="card">
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <FaFileAlt size={64} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
                        <h2 style={{ marginBottom: '1rem', color: '#64748b' }}>No Assigned Exams</h2>
                        <p style={{ color: '#94a3b8' }}>
                            You don't have any exams assigned to you yet.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="exam-grid">
                    {exams.map((exam) => (
                        <div key={exam.id} className="exam-card">
                            <div className="exam-header">
                                <h3>{exam.title}</h3>
                                <span className={`status ${exam.isActive ? 'active' : 'inactive'}`}>
                                    {exam.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <p className="description">{exam.description}</p>

                            <div className="exam-details">
                                <div className="detail">
                                    <strong>Duration:</strong> {exam.duration} minutes
                                </div>
                                <div className="detail">
                                    <strong>Questions:</strong> {exam.questionCount}
                                </div>
                                <div className="detail">
                                    <strong>Passing Score:</strong> {exam.passingScore}%
                                </div>
                            </div>

                            {exam.result ? (
                                <div className="exam-result">
                                    <div className={`result-status ${exam.result.isPassed ? 'passed' : 'failed'}`}>
                                        {exam.result.isPassed ? (
                                            <><FaCheckCircle /> Passed</>
                                        ) : (
                                            <><FaTimesCircle /> Failed</>
                                        )}
                                    </div>
                                    <div className="result-score">
                                        Score: {parseFloat(exam.result.score).toFixed(2)}%
                                    </div>
                                </div>
                            ) : (
                                <div className="exam-actions">
                                    {exam.canTake ? (
                                        <Link
                                            to={`/student/exam/${exam.id}`}
                                            className="btn btn-primary"
                                        >
                                            <FaClock /> Start Exam
                                        </Link>
                                    ) : (
                                        <button className="btn btn-secondary" disabled>
                                            <FaClock /> Not Available
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentExams;