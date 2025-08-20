/**
 * Comprehensive User Deletion Test Script
 * 
 * This script tests the complete user deletion functionality including:
 * - Database setup and teardown
 * - User creation and deletion
 * - Foreign key constraint handling
 * - Frontend API integration
 * - Orphaned record verification
 * - Error scenario handling
 * 
 * Usage: node test-user-deletion.js
 */

const axios = require('axios');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
require('dotenv').config();

// Import models and database connection
const sequelize = require('./config/database');
const {
    User,
    Exam,
    Question,
    UserExamAssignment,
    ExamResponse,
    ExamResult,
    Pipeline,
    UserPipelineProgress
} = require('./models');

// Test configuration
const TEST_CONFIG = {
    baseURL: process.env.NODE_ENV === 'production' ? 'https://your-app-url.com' : 'http://localhost:5000',
    adminCredentials: {
        email: 'admin@examportal.com',
        password: 'admin123'
    },
    testUser: {
        name: 'Test User for Deletion',
        email: 'testuser.deletion@example.com',
        password: 'testpass123',
        role: 'student'
    }
};

// Test results tracking
let testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
        info: '\x1b[36m[INFO]\x1b[0m',
        success: '\x1b[32m[SUCCESS]\x1b[0m',
        error: '\x1b[31m[ERROR]\x1b[0m',
        warning: '\x1b[33m[WARNING]\x1b[0m'
    };
    console.log(`${prefix[type]} ${timestamp} - ${message}`);
}

function assert(condition, message) {
    if (condition) {
        testResults.passed++;
        log(`✓ ${message}`, 'success');
    } else {
        testResults.failed++;
        testResults.errors.push(message);
        log(`✗ ${message}`, 'error');
        throw new Error(`Assertion failed: ${message}`);
    }
}

function softAssert(condition, message) {
    if (condition) {
        testResults.passed++;
        log(`✓ ${message}`, 'success');
        return true;
    } else {
        testResults.failed++;
        testResults.errors.push(message);
        log(`✗ ${message}`, 'error');
        return false;
    }
}

// Database setup and teardown
class DatabaseManager {
    static async setup() {
        try {
            log('Setting up database connection...');
            await sequelize.authenticate();
            log('Database connection established successfully');
            
            // Sync models (create tables if they don't exist)
            await sequelize.sync();
            log('Database models synchronized');
            
            return true;
        } catch (error) {
            log(`Database setup failed: ${error.message}`, 'error');
            throw error;
        }
    }
    
    static async cleanup() {
        try {
            log('Cleaning up test data...');
            
            // Clean up in reverse order of dependencies
            await ExamResponse.destroy({ where: { userId: { [Op.like]: '%test%' } }, force: true });
            await ExamResult.destroy({ where: { userId: { [Op.like]: '%test%' } }, force: true });
            await UserExamAssignment.destroy({ where: { userId: { [Op.like]: '%test%' } }, force: true });
            await UserPipelineProgress.destroy({ where: { userId: { [Op.like]: '%test%' } }, force: true });
            
            // Clean up test users
            await User.destroy({ 
                where: { 
                    email: { 
                        [Op.like]: '%test%' 
                    } 
                }, 
                force: true 
            });
            
            // Clean up test exams and questions
            const testExams = await Exam.findAll({ where: { title: { [Op.like]: '%test%' } } });
            for (const exam of testExams) {
                await Question.destroy({ where: { examId: exam.id }, force: true });
                await exam.destroy({ force: true });
            }
            
            log('Test data cleanup completed');
        } catch (error) {
            log(`Cleanup failed: ${error.message}`, 'warning');
        }
    }
    
    static async teardown() {
        try {
            await this.cleanup();
            await sequelize.close();
            log('Database connection closed');
        } catch (error) {
            log(`Database teardown failed: ${error.message}`, 'error');
        }
    }
}

// API Client for testing frontend integration
class APIClient {
    constructor() {
        this.client = axios.create({
            baseURL: TEST_CONFIG.baseURL + '/api',
            timeout: 10000
        });
        this.token = null;
    }
    
    async login(credentials = TEST_CONFIG.adminCredentials) {
        try {
            const response = await this.client.post('/auth/login', credentials);
            this.token = response.data.token;
            this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            log('API client authenticated successfully');
            return response.data;
        } catch (error) {
            log(`API login failed: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async createUser(userData) {
        try {
            const response = await this.client.post('/users', userData);
            return response.data;
        } catch (error) {
            log(`API user creation failed: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async deleteUser(userId) {
        try {
            const response = await this.client.delete(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    
    async getUser(userId) {
        try {
            const response = await this.client.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    
    async getUsers() {
        try {
            const response = await this.client.get('/users');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

// Test suite classes
class UserDeletionTests {
    constructor(apiClient) {
        this.api = apiClient;
        this.testUserId = null;
        this.testExamId = null;
    }
    
    async createTestData() {
        log('Creating test data for deletion tests...');
        
        try {
            // Create test user directly in database
            const hashedPassword = await bcrypt.hash(TEST_CONFIG.testUser.password, 12);
            const testUser = await User.create({
                ...TEST_CONFIG.testUser,
                password: hashedPassword
            });
            this.testUserId = testUser.id;
            log(`Test user created with ID: ${this.testUserId}`);
            
            // Create test exam
            const testExam = await Exam.create({
                title: 'Test Exam for Deletion',
                description: 'Test exam to verify deletion constraints',
                duration: 60,
                totalQuestions: 2,
                passingScore: 70,
                isActive: true
            });
            this.testExamId = testExam.id;
            
            // Create test questions
            await Question.bulkCreate([
                {
                    examId: this.testExamId,
                    questionText: 'Test question 1?',
                    optionA: 'Option A',
                    optionB: 'Option B',
                    optionC: 'Option C',
                    optionD: 'Option D',
                    correctOption: 'A',
                    points: 1
                },
                {
                    examId: this.testExamId,
                    questionText: 'Test question 2?',
                    optionA: 'Option A',
                    optionB: 'Option B',
                    optionC: 'Option C',
                    optionD: 'Option D',
                    correctOption: 'B',
                    points: 1
                }
            ]);
            
            // Create user exam assignment
            await UserExamAssignment.create({
                userId: this.testUserId,
                examId: this.testExamId,
                assignedBy: 1 // Assuming admin user ID is 1
            });
            
            // Create exam result
            await ExamResult.create({
                userId: this.testUserId,
                examId: this.testExamId,
                score: 85.50,
                totalQuestions: 2,
                correctAnswers: 1,
                totalPoints: 2,
                earnedPoints: 1,
                timeTaken: 300,
                status: 'passed',
                isPassed: true
            });
            
            // Create exam responses
            const questions = await Question.findAll({ where: { examId: this.testExamId } });
            await ExamResponse.bulkCreate([
                {
                    userId: this.testUserId,
                    examId: this.testExamId,
                    questionId: questions[0].id,
                    selectedOption: 'A',
                    isCorrect: true,
                    pointsEarned: 1,
                    timeSpent: 150
                },
                {
                    userId: this.testUserId,
                    examId: this.testExamId,
                    questionId: questions[1].id,
                    selectedOption: 'A',
                    isCorrect: false,
                    pointsEarned: 0,
                    timeSpent: 150
                }
            ]);
            
            log('Test data created successfully');
            return true;
        } catch (error) {
            log(`Failed to create test data: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async testSuccessfulDeletion() {
        log('Testing successful user deletion...');
        
        try {
            // Verify user exists before deletion
            const userBefore = await User.findByPk(this.testUserId);
            assert(userBefore !== null, 'Test user exists before deletion');
            
            // Verify related records exist before deletion
            const assignmentsBefore = await UserExamAssignment.count({ where: { userId: this.testUserId } });
            const resultsBefore = await ExamResult.count({ where: { userId: this.testUserId } });
            const responsesBefore = await ExamResponse.count({ where: { userId: this.testUserId } });
            
            assert(assignmentsBefore > 0, 'User has exam assignments before deletion');
            assert(resultsBefore > 0, 'User has exam results before deletion');
            assert(responsesBefore > 0, 'User has exam responses before deletion');
            
            // Perform deletion via API
            const deleteResponse = await this.api.deleteUser(this.testUserId);
            assert(deleteResponse.message === 'User deleted successfully', 'API returns success message');
            
            // Verify user is deleted
            const userAfter = await User.findByPk(this.testUserId);
            assert(userAfter === null, 'User is deleted from database');
            
            // Verify related records are also deleted (cascade)
            const assignmentsAfter = await UserExamAssignment.count({ where: { userId: this.testUserId } });
            const resultsAfter = await ExamResult.count({ where: { userId: this.testUserId } });
            const responsesAfter = await ExamResponse.count({ where: { userId: this.testUserId } });
            
            assert(assignmentsAfter === 0, 'User exam assignments are deleted (no orphaned records)');
            assert(resultsAfter === 0, 'User exam results are deleted (no orphaned records)');
            assert(responsesAfter === 0, 'User exam responses are deleted (no orphaned records)');
            
            log('Successful deletion test completed');
            return true;
        } catch (error) {
            log(`Successful deletion test failed: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async testErrorScenarios() {
        log('Testing error scenarios...');
        
        try {
            // Test 1: Delete non-existent user
            try {
                await this.api.deleteUser(99999);
                assert(false, 'Should throw error for non-existent user');
            } catch (error) {
                assert(error.response?.status === 404, 'Returns 404 for non-existent user');
                assert(error.response?.data?.message === 'User not found', 'Returns correct error message for non-existent user');
            }
            
            // Test 2: Self-deletion prevention (requires admin user)
            const adminUser = await User.findOne({ where: { role: 'admin' } });
            if (adminUser) {
                try {
                    // Login as admin and try to delete self
                    const adminClient = new APIClient();
                    await adminClient.login({ email: adminUser.email, password: 'admin123' });
                    await adminClient.deleteUser(adminUser.id);
                    assert(false, 'Should prevent admin from deleting themselves');
                } catch (error) {
                    assert(error.response?.status === 400, 'Returns 400 for self-deletion attempt');
                    assert(error.response?.data?.message === 'Cannot delete your own account', 'Returns correct error message for self-deletion');
                }
            }
            
            log('Error scenario tests completed');
            return true;
        } catch (error) {
            log(`Error scenario test failed: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async testFrontendIntegration() {
        log('Testing frontend API integration...');
        
        try {
            // Create another test user for frontend testing
            const frontendTestUser = await User.create({
                name: 'Frontend Test User',
                email: 'frontend.test@example.com',
                password: await bcrypt.hash('testpass123', 12),
                role: 'student'
            });
            
            // Test API endpoints that frontend uses
            const usersResponse = await this.api.getUsers();
            assert(Array.isArray(usersResponse.users), 'Get users API returns array');
            
            const userExists = usersResponse.users.some(user => user.id === frontendTestUser.id);
            assert(userExists, 'Newly created user appears in users list');
            
            // Test individual user retrieval
            const userResponse = await this.api.getUser(frontendTestUser.id);
            assert(userResponse.user.id === frontendTestUser.id, 'Get user by ID returns correct user');
            
            // Test deletion via API (simulating frontend call)
            try {
                await this.api.deleteUser(frontendTestUser.id);
            } catch (error) {
                log(`Delete API error details: ${JSON.stringify(error.response?.data || error.message)}`, 'error');
                throw error;
            }
            
            // Verify user is removed from API responses
            try {
                await this.api.getUser(frontendTestUser.id);
                assert(false, 'Should not find deleted user');
            } catch (error) {
                assert(error.response?.status === 404, 'Deleted user returns 404');
            }
            
            const usersAfterDelete = await this.api.getUsers();
            const userStillExists = usersAfterDelete.users.some(user => user.id === frontendTestUser.id);
            assert(!userStillExists, 'Deleted user does not appear in users list');
            
            log('Frontend integration tests completed');
            return true;
        } catch (error) {
            log(`Frontend integration test failed: ${error.message}`, 'error');
            throw error;
        }
    }
}

// Main test runner
async function runTests() {
    const startTime = Date.now();
    log('Starting comprehensive user deletion tests...');
    
    try {
        // Setup
        await DatabaseManager.setup();
        const apiClient = new APIClient();
        await apiClient.login();
        
        const testSuite = new UserDeletionTests(apiClient);
        
        // Run test cases
        log('\n=== Test Case 1: Create Test Data ===');
        await testSuite.createTestData();
        
        log('\n=== Test Case 2: Successful User Deletion ===');
        await testSuite.testSuccessfulDeletion();
        
        log('\n=== Test Case 3: Error Scenarios ===');
        await testSuite.testErrorScenarios();
        
        log('\n=== Test Case 4: Frontend Integration ===');
        await testSuite.testFrontendIntegration();
        
    } catch (error) {
        log(`Test execution failed: ${error.message}`, 'error');
        testResults.failed++;
        testResults.errors.push(error.message);
    } finally {
        // Cleanup
        await DatabaseManager.teardown();
        
        // Print results
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        log('\n' + '='.repeat(60));
        log('TEST RESULTS SUMMARY');
        log('='.repeat(60));
        log(`Total Tests: ${testResults.passed + testResults.failed}`);
        log(`Passed: ${testResults.passed}`, 'success');
        log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'info');
        log(`Duration: ${duration}s`);
        
        if (testResults.errors.length > 0) {
            log('\nFAILED TESTS:', 'error');
            testResults.errors.forEach((error, index) => {
                log(`${index + 1}. ${error}`, 'error');
            });
        }
        
        log('\nTest execution completed.');
        
        // Exit with appropriate code
        process.exit(testResults.failed > 0 ? 1 : 0);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    log(`Uncaught exception: ${error.message}`, 'error');
    await DatabaseManager.teardown();
    process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
    log(`Unhandled rejection at: ${promise}, reason: ${reason}`, 'error');
    await DatabaseManager.teardown();
    process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = {
    runTests,
    DatabaseManager,
    APIClient,
    UserDeletionTests,
    TEST_CONFIG
};