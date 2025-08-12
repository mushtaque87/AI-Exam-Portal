import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import ExamList from './components/admin/ExamList';
import UserList from './components/admin/UserList';
import ResultsList from './components/admin/ResultsList';
import StudentExams from './components/student/StudentExams';
import TakeExam from './components/student/TakeExam';
import StudentResults from './components/student/StudentResults';
import Navbar from './components/Navbar';

// Context
import { AuthContext } from './context/AuthContext';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            setUser(response.data.user);
        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);

            toast.success('Login successful!');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        toast.success('Logged out successfully');
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <span style={{ marginLeft: '1rem' }}>Loading...</span>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            <div className="App">
                {user && <Navbar />}
                <div className="container">
                    <Routes>
                        <Route
                            path="/login"
                            element={user ? <Navigate to="/" /> : <Login />}
                        />
                        <Route
                            path="/"
                            element={user ? <Dashboard /> : <Navigate to="/login" />}
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin"
                            element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
                        />
                        <Route
                            path="/admin/exams"
                            element={user?.role === 'admin' ? <ExamList /> : <Navigate to="/" />}
                        />
                        <Route
                            path="/admin/users"
                            element={user?.role === 'admin' ? <UserList /> : <Navigate to="/" />}
                        />
                        <Route
                            path="/admin/results"
                            element={user?.role === 'admin' ? <ResultsList /> : <Navigate to="/" />}
                        />

                        {/* Student Routes */}
                        <Route
                            path="/student"
                            element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/" />}
                        />
                        <Route
                            path="/student/exams"
                            element={user?.role === 'student' ? <StudentExams /> : <Navigate to="/" />}
                        />
                        <Route
                            path="/student/exam/:examId"
                            element={user?.role === 'student' ? <TakeExam /> : <Navigate to="/" />}
                        />
                        <Route
                            path="/student/results"
                            element={user?.role === 'student' ? <StudentResults /> : <Navigate to="/" />}
                        />

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </div>
        </AuthContext.Provider>
    );
}

export default App; 