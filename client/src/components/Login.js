import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaBrain } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const success = await login(email, password);
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div className="card" style={{
                maxWidth: '400px',
                width: '100%',
                margin: '1rem',
                padding: '2rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <FaBrain size={48} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                        Exam Portal
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <FaUser style={{ marginRight: '0.5rem' }} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FaLock style={{ marginRight: '0.5rem' }} />
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#64748b'
                }}>
                    <strong>Demo Credentials:</strong>
                    <br />
                    Email: admin@examportal.com
                    <br />
                    Password: admin123
                </div>
            </div>
        </div>
    );
};

export default Login; 