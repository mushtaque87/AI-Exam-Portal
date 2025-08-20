# User Deletion Test Script

This comprehensive test script verifies the proper functionality of user deletion in the exam portal system.

## Features

- **Database Setup & Teardown**: Automatically sets up test environment and cleans up afterward
- **Comprehensive Testing**: Tests all aspects of user deletion including database constraints
- **Foreign Key Handling**: Verifies proper cascade deletion of related records
- **Frontend Integration**: Tests API endpoints used by the frontend
- **Error Scenarios**: Tests edge cases and error conditions
- **Orphaned Record Detection**: Ensures no orphaned records remain after deletion
- **Repeatable Execution**: Can be run multiple times safely

## Test Cases Covered

### 1. Successful User Deletion
- Creates test user with related data (exam assignments, results, responses)
- Performs deletion via API
- Verifies user and all related records are properly deleted
- Ensures no orphaned records remain

### 2. Error Scenarios
- **Non-existent User**: Tests deletion of user that doesn't exist
- **Self-deletion Prevention**: Verifies admin cannot delete their own account
- **Proper Error Messages**: Validates correct HTTP status codes and error messages

### 3. Frontend Integration
- Tests all API endpoints used by the frontend
- Verifies user appears/disappears from user lists correctly
- Simulates actual frontend deletion workflow

### 4. Database Integrity
- Verifies foreign key constraints work properly
- Ensures cascade deletion removes all related records:
  - User exam assignments
  - Exam results
  - Exam responses
  - Pipeline progress (if applicable)

## Prerequisites

1. **Database Connection**: Ensure your database is running and accessible
2. **Environment Variables**: Make sure your `.env` file is properly configured
3. **Admin User**: An admin user must exist in the database for authentication
4. **Server Running**: The API server should be running (for integration tests)

## Usage

### Option 1: Direct Execution
```bash
node test-user-deletion.js
```

### Option 2: Via NPM Script (if added to package.json)
```bash
npm run test:user-deletion
```

### Option 3: With Custom Configuration
```bash
# Set custom base URL
BASE_URL=http://localhost:3000 node test-user-deletion.js

# Run in production mode
NODE_ENV=production node test-user-deletion.js
```

## Configuration

The script uses the following configuration (can be modified in `TEST_CONFIG`):

```javascript
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
```

## Output

The script provides detailed output including:

- **Colored Logs**: Different colors for info, success, error, and warning messages
- **Timestamps**: All log entries include timestamps
- **Test Progress**: Real-time updates on test execution
- **Assertion Results**: Clear pass/fail indicators for each test
- **Summary Report**: Final summary with pass/fail counts and execution time

### Sample Output
```
[INFO] 2024-01-20T10:30:00.000Z - Starting comprehensive user deletion tests...
[INFO] 2024-01-20T10:30:00.100Z - Setting up database connection...
[SUCCESS] 2024-01-20T10:30:00.200Z - Database connection established successfully
[SUCCESS] 2024-01-20T10:30:00.300Z - ✓ Test user exists before deletion
[SUCCESS] 2024-01-20T10:30:00.400Z - ✓ User is deleted from database
[SUCCESS] 2024-01-20T10:30:00.500Z - ✓ User exam assignments are deleted (no orphaned records)

============================================================
TEST RESULTS SUMMARY
============================================================
Total Tests: 15
Passed: 15
Failed: 0
Duration: 2.5s

Test execution completed.
```

## Error Handling

- **Graceful Cleanup**: Always cleans up test data, even if tests fail
- **Database Rollback**: Removes all test data to prevent pollution
- **Error Reporting**: Detailed error messages with stack traces
- **Exit Codes**: Returns appropriate exit codes (0 for success, 1 for failure)

## Safety Features

1. **Test Data Isolation**: Uses specific naming patterns to avoid affecting real data
2. **Automatic Cleanup**: Removes all test data after execution
3. **Connection Management**: Properly closes database connections
4. **Exception Handling**: Catches and handles all types of errors

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your database is running
   - Verify connection string in `.env` file
   - Ensure database user has proper permissions

2. **Authentication Failed**
   - Verify admin user exists in database
   - Check admin credentials in `TEST_CONFIG`
   - Ensure password is correct

3. **API Server Not Running**
   - Start your API server before running tests
   - Check the `baseURL` in configuration
   - Verify server is accessible on specified port

4. **Foreign Key Constraint Errors**
   - This usually indicates a bug in the deletion logic
   - Check the deletion order in the API endpoint
   - Verify cascade delete settings in database schema

### Debug Mode

For more detailed debugging, you can modify the script to include additional logging:

```javascript
// Add this at the top of the script for more verbose output
process.env.DEBUG = 'true';
```

## Integration with CI/CD

This script can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Run User Deletion Tests
  run: |
    npm install
    node test-user-deletion.js
  env:
    NODE_ENV: test
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Extending the Tests

To add more test cases:

1. Add new methods to the `UserDeletionTests` class
2. Call them from the `runTests()` function
3. Use the `assert()` and `softAssert()` helper functions
4. Follow the existing pattern for setup and cleanup

## Support

If you encounter issues with this test script:

1. Check the troubleshooting section above
2. Review the detailed error messages in the output
3. Verify your database schema matches the expected structure
4. Ensure all dependencies are properly installed

The script is designed to be self-contained and should work out of the box with a properly configured exam portal environment.