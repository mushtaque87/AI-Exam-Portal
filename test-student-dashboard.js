const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Test student dashboard functionality
async function testStudentDashboard() {
    try {
        console.log('Testing student dashboard functionality...');
        
        // First, let's login as the student user
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'amaan@pmiindia.org',
            password: 'student123' // Assuming default password
        });
        
        if (!loginResponse.data.token) {
            console.log('❌ Student login failed:', loginResponse.data);
            return;
        }
        
        console.log('✅ Student login successful');
        const token = loginResponse.data.token;
        
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Test /api/results/my-exams endpoint
        console.log('\n--- Testing /api/results/my-exams ---');
        try {
            const examsResponse = await axios.get('http://localhost:5000/api/results/my-exams');
            console.log('✅ My exams API call successful');
            console.log('Response structure:', {
                hasExams: !!examsResponse.data.exams,
                examCount: examsResponse.data.exams?.length || 0,
                exams: examsResponse.data.exams
            });
        } catch (error) {
            console.log('❌ My exams API call failed:', {
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            });
        }
        
        // Test /api/results/my-results endpoint
        console.log('\n--- Testing /api/results/my-results ---');
        try {
            const resultsResponse = await axios.get('http://localhost:5000/api/results/my-results');
            console.log('✅ My results API call successful');
            console.log('Response structure:', {
                hasResults: !!resultsResponse.data.results,
                resultCount: resultsResponse.data.results?.length || 0,
                results: resultsResponse.data.results
            });
        } catch (error) {
            console.log('❌ My results API call failed:', {
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            });
        }
        
        // Check database for user exam assignments
        console.log('\n--- Checking database for exam assignments ---');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'exam_portal'
        });
        
        // Get student user ID
        const [users] = await connection.execute(
            'SELECT id, email, role FROM users WHERE email = ?',
            ['amaan@pmiindia.org']
        );
        
        if (users.length === 0) {
            console.log('❌ Student user not found in database');
            await connection.end();
            return;
        }
        
        const studentId = users[0].id;
        console.log('✅ Student user found:', users[0]);
        
        // Check exam assignments
        const [assignments] = await connection.execute(`
            SELECT 
                uea.id as assignment_id,
                uea.userId,
                uea.examId,
                uea.assignedAt,
                e.title,
                e.isActive,
                e.description
            FROM user_exam_assignments uea
            JOIN exams e ON uea.examId = e.id
            WHERE uea.userId = ?
        `, [studentId]);
        
        console.log('📋 Exam assignments for student:', assignments);
        
        // Check exam results
        const [results] = await connection.execute(`
            SELECT 
                er.id,
                er.examId,
                er.score,
                er.isPassed,
                er.submittedAt,
                e.title
            FROM exam_results er
            JOIN exams e ON er.examId = e.id
            WHERE er.userId = ?
        `, [studentId]);
        
        console.log('📊 Exam results for student:', results);
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testStudentDashboard();