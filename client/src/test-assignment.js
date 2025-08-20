// Simple test to check assignment functionality from frontend context
// This can be run in browser console

const testAssignment = async () => {
    try {
        console.log('Testing assignment functionality...');
        
        // Check if token exists
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        if (!token) {
            console.error('No token found in localStorage');
            return;
        }
        
        // Check axios default headers
        console.log('Axios default headers:', window.axios?.defaults?.headers?.common);
        
        // Test API calls
        console.log('Testing /api/users...');
        const usersResponse = await window.axios.get('/api/users');
        console.log('Users response:', usersResponse.data);
        
        console.log('Testing /api/exams...');
        const examsResponse = await window.axios.get('/api/exams');
        console.log('Exams response:', examsResponse.data);
        
        if (examsResponse.data.exams.length > 0) {
            const examId = examsResponse.data.exams[0].id;
            console.log(`Testing /api/exams/${examId}...`);
            const examResponse = await window.axios.get(`/api/exams/${examId}`);
            console.log('Exam details response:', examResponse.data);
        }
        
        console.log('All tests passed!');
        
    } catch (error) {
        console.error('Test failed:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });
    }
};

// Make function available globally
window.testAssignment = testAssignment;

console.log('Assignment test function loaded. Run testAssignment() in console to test.');