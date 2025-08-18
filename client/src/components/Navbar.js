import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaCog, FaBrain } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            backgroundColor: 'white',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '1rem 0',
            marginBottom: '2rem'
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: '#1e293b',
                    fontWeight: 'bold',
                    fontSize: '1.25rem'
                }}>
                    <img 
                        src="/pmi-logo.png" 
                        alt="PMI Logo" 
                        style={{ 
                            height: '30px',
                            marginRight: '0.5rem',
                            objectFit: 'contain'
                        }} 
                    />
                    Exam Portal
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user?.role === 'admin' && (
                        <>
                            <Link to="/admin" className="btn btn-outline">Dashboard</Link>
                            <Link to="/admin/users" className="btn btn-outline">Users</Link>
                            <Link to="/admin/exams" className="btn btn-outline">Exams</Link>
                            <Link to="/admin/results" className="btn btn-outline">Results</Link>
                        </>
                    )}

                    {user?.role === 'student' && (
                        <>
                            <Link to="/student" className="btn btn-outline">Dashboard</Link>
                            <Link to="/student/exams" className="btn btn-outline">My Exams</Link>
                            <Link to="/student/results" className="btn btn-outline">My Results</Link>
                        </>
                    )}

                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="btn btn-outline"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <FaUser />
                            {user?.name}
                        </button>

                        {showMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                minWidth: '200px',
                                zIndex: 1000,
                                marginTop: '0.5rem'
                            }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{user?.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{user?.email}</div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#64748b',
                                        textTransform: 'capitalize'
                                    }}>
                                        {user?.role}
                                    </div>
                                </div>

                                <div style={{ padding: '0.5rem' }}>
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-outline"
                                        style={{
                                            width: '100%',
                                            justifyContent: 'flex-start',
                                            marginBottom: '0.5rem'
                                        }}
                                    >
                                        <FaSignOutAlt />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {showMenu && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                    onClick={() => setShowMenu(false)}
                />
            )}
        </nav>
    );
};

export default Navbar;