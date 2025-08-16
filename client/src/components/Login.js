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

        await login(email, password);
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0057a9'
        }}>
            <div className="card" style={{
                maxWidth: '400px',
                width: '100%',
                margin: '0',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        backgroundColor: '#005EB8',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 2px 8px rgba(0, 94, 184, 0.3)'
                    }}>
                        <FaBrain size={28} style={{ color: 'white' }} />
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '600',
                        color: '#003B71',
                        marginBottom: '0.25rem'
                    }}>
                        PMI Exam Portal
                    </h1>
                    <p style={{
                        color: '#4B5563',
                        marginTop: '0.25rem',
                        fontSize: '0.95rem'
                    }}>
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem',
                            fontSize: '0.95rem'
                        }}>
                            <FaUser style={{ marginRight: '0.5rem', color: '#005EB8' }} />
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
                                border: '1px solid #D1D5DB',
                                fontSize: '0.95rem',
                                transition: 'border-color 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#005EB8'}
                            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
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
                            <FaLock style={{ marginRight: '0.5rem', color: '#005EB8' }} />
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
                                border: '1px solid #D1D5DB',
                                fontSize: '0.95rem',
                                transition: 'border-color 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#005EB8'}
                            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
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
                            fontWeight: '500',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #005EB8 0%, #003B71 100%)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 2px 8px rgba(0, 94, 184, 0.3)'
                        }}
                        disabled={loading}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0, 94, 184, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 94, 184, 0.3)';
                        }}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '0.5rem' }}></div>
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