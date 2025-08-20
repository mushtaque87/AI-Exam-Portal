const axios = require('axios');

// Test the exact workflow that causes the "failed to load assignment data" error
class AssignmentWorkflowTest {
    constructor() {
        this.baseURL = 'http://localhost:5000';
        this.token = null;
        axios.defaults.baseURL = this.baseURL;
    }

    async login() {
        try {
            console.log('🔐 Logging in as admin...');
            const response = await axios.post('/api/auth/login', {
                email: 'admin@example.com',
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

    async testAssignmentWorkflow() {
        try {
            console.log('\n📋 Testing assignment workflow...');
            
            // Step 1: Get all exams (like ExamList component does)
            console.log('\n1️⃣ Fetching all exams...');
            const examsResponse = await axios.get('/api/exams');
            console.log(`✅ Found ${examsResponse.data.exams.length} exams`);
            
            if (examsResponse.data.exams.length === 0) {
                console.log('⚠️ No exams found to test assignment');
                return;
            }

            // Step 2: Select first exam and simulate assignment click
            const testExam = examsResponse.data.exams[0];
            console.log(`\n2️⃣ Testing assignment for exam: "${testExam.title}" (ID: ${testExam.id})`);
            
            // Step 3: Fetch users (first API call in handleAssignUsers)
            console.log('\n3️⃣ Fetching all users...');
            const usersResponse = await axios.get('/api/users');
            console.log(`✅ Users response structure:`, {
                hasData: !!usersResponse.data,
                hasUsers: !!usersResponse.data?.users,
                userCount: usersResponse.data?.users?.length || 0,
                firstUser: usersResponse.data?.users?.[0]?.name || 'N/A'
            });
            
            // Step 4: Fetch exam details with assigned users (second API call)
            console.log(`\n4️⃣ Fetching exam details for ID ${testExam.id}...`);
            const examResponse = await axios.get(`/api/exams/${testExam.id}`);
            console.log(`✅ Exam response structure:`, {
                hasData: !!examResponse.data,
                hasExam: !!examResponse.data?.exam,
                examTitle: examResponse.data?.exam?.title || 'N/A',
                hasAssignedUsers: !!examResponse.data?.exam?.assignedUsers,
                assignedUserCount: examResponse.data?.exam?.assignedUsers?.length || 0
            });
            
            // Step 5: Test with different exam IDs to see if issue is exam-specific
            if (examsResponse.data.exams.length > 1) {
                console.log('\n5️⃣ Testing with second exam...');
                const secondExam = examsResponse.data.exams[1];
                const secondExamResponse = await axios.get(`/api/exams/${secondExam.id}`);
                console.log(`✅ Second exam (${secondExam.title}) loaded successfully`);
            }
            
            console.log('\n🎉 Assignment workflow test completed successfully!');
            console.log('\n📊 Summary:');
            console.log(`   - Exams available: ${examsResponse.data.exams.length}`);
            console.log(`   - Users available: ${usersResponse.data?.users?.length || 0}`);
            console.log(`   - Test exam assigned users: ${examResponse.data?.exam?.assignedUsers?.length || 0}`);
            
        } catch (error) {
            console.error('\n❌ Assignment workflow failed:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                method: error.config?.method
            });
            
            // Additional debugging for specific errors
            if (error.response?.status === 500) {
                console.error('\n🔍 Server Error Details:', error.response.data);
            } else if (error.response?.status === 401) {
                console.error('\n🔍 Authentication Error - Token might be invalid');
            } else if (error.response?.status === 404) {
                console.error('\n🔍 Not Found Error - Resource might not exist');
            }
        }
    }

    async run() {
        console.log('🚀 Starting Assignment Workflow Test\n');
        
        const loginSuccess = await this.login();
        if (!loginSuccess) {
            console.log('❌ Cannot proceed without login');
            return;
        }
        
        await this.testAssignmentWorkflow();
        console.log('\n✅ Test completed');
    }
}

// Run the test
const test = new AssignmentWorkflowTest();
test.run().catch(console.error);