/**
 * Test script to reproduce the assignment data loading error
 */

const axios = require('axios');
require('dotenv').config();

// Configure axios
axios.defaults.baseURL = 'http://localhost:5000';

class AssignmentTester {
    constructor() {
        this.token = null;
    }

    async login() {
        try {
            console.log('Logging in as admin...');
            const response = await axios.post('/api/auth/login', {
                email: 'admin@examportal.com',
                password: 'admin123'
            });
            
            this.token = response.data.token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            console.log('✅ Login successful');
            return true;
        } catch (error) {
            console.error('❌ Login failed:', error.response?.data || error.message);
            return false;
        }
    }

    async testAssignmentDataLoading() {
        try {
            console.log('\n=== Testing Assignment Data Loading ===');
            
            // Step 1: Get all exams first
            console.log('1. Fetching exams...');
            const examsResponse = await axios.get('/api/exams');
            console.log(`✅ Found ${examsResponse.data.exams.length} exams`);
            
            if (examsResponse.data.exams.length === 0) {
                console.log('❌ No exams found to test assignment');
                return;
            }
            
            const testExam = examsResponse.data.exams[0];
            console.log(`Using exam: ${testExam.title} (ID: ${testExam.id})`);
            
            // Step 2: Simulate the assignment data loading process
            console.log('\n2. Testing assignment data loading (simulating frontend)...');
            
            // This is what the frontend does in handleAssignUsers
            console.log('2a. Fetching all users...');
            const usersResponse = await axios.get('/api/users');
            console.log(`✅ Users fetched: ${usersResponse.data.users.length} users`);
            
            console.log('2b. Fetching exam details with assigned users...');
            const examResponse = await axios.get(`/api/exams/${testExam.id}`);
            console.log('✅ Exam details fetched successfully');
            console.log('Assigned users:', examResponse.data.exam.assignedUsers?.length || 0);
            
            console.log('\n✅ Assignment data loading test completed successfully!');
            
        } catch (error) {
            console.error('\n❌ Assignment data loading failed:');
            console.error('Error message:', error.message);
            console.error('Status:', error.response?.status);
            console.error('Response data:', error.response?.data);
            console.error('Request URL:', error.config?.url);
            console.error('Request method:', error.config?.method);
            console.error('Request headers:', error.config?.headers);
        }
    }

    async run() {
        console.log('🚀 Starting Assignment Error Test\n');
        
        const loginSuccess = await this.login();
        if (!loginSuccess) {
            console.log('❌ Cannot proceed without login');
            return;
        }
        
        await this.testAssignmentDataLoading();
        
        console.log('\n🏁 Test completed');
    }
}

// Run the test
const tester = new AssignmentTester();
tester.run().catch(console.error);