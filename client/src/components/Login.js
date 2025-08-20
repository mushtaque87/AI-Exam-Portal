import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaBrain } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
        } catch (err) {
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc'
        }}>
            <div className="card" style={{
                maxWidth: '400px',
                width: '100%',
                margin: '0',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb'
            }}>
                <style>
                    {`
                    ::placeholder { 
                        color: #9ca3af !important;
                        opacity: 1;
                    }
                    `}
                </style>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <img 
                            src="/pmi-logo.png" 
                            alt="PMI Logo" 
                            style={{ 
                                height: '80px',
                                objectFit: 'contain'
                            }} 
                        />
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '0.25rem'
                    }}>
                        PMI Exam Portal
                    </h1>
                    <p style={{
                        color: '#64748b',
                        marginTop: '0.25rem',
                        fontSize: '0.95rem'
                    }}>
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{ 
                            color: '#ef4444', 
                            marginTop: '1rem', 
                            fontSize: '0.9rem',
                            backgroundColor: '#fee2e2',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #fecaca',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem',
                            fontSize: '0.95rem'
                        }}>
                            <FaUser style={{ marginRight: '0.5rem', color: '#3b82f6' }} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            style={{
                                width: '100%',
                                padding: '0.6rem 0.8rem',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                backgroundColor: 'white',
                                color: '#1e293b',
                                fontSize: '0.95rem',
                                transition: 'border-color 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem',
                            fontSize: '0.95rem'
                        }}>
                            <FaLock style={{ marginRight: '0.5rem', color: '#3b82f6' }} />
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            style={{
                                width: '100%',
                                padding: '0.6rem 0.8rem',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                backgroundColor: 'white',
                                color: '#1e293b',
                                fontSize: '0.95rem',
                                transition: 'border-color 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '0.75rem',
                            padding: '0.7rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderRadius: '6px',
                            backgroundColor: '#3b82f6',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                        }}
                        disabled={loading}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#2563eb';
                            e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#3b82f6';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="spinner" style={{ 
                                    marginRight: '0.5rem'
                                }}></div>
                                Signing in...
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;