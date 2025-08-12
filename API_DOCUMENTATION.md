# Exam Portal API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/login

Login with email and password.

**Request Body:**

```json
{
  "email": "admin@examportal.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@examportal.com",
    "role": "admin",
    "isActive": true,
    "lastLogin": "2024-01-01T12:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### POST /auth/register (Admin Only)

Register a new user.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

#### GET /auth/me

Get current user profile.

**Response:**

```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@examportal.com",
    "role": "admin",
    "isActive": true,
    "lastLogin": "2024-01-01T12:00:00.000Z"
  }
}
```

#### PUT /auth/profile

Update user profile.

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword123"
}
```

### User Management (Admin Only)

#### GET /users

Get all users with pagination and filters.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by name or email
- `role` (optional): Filter by role (admin/student)
- `isActive` (optional): Filter by active status

**Response:**

```json
{
  "users": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@examportal.com",
      "role": "admin",
      "isActive": true,
      "lastLogin": "2024-01-01T12:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  }
}
```

#### GET /users/:id

Get user by ID with exam assignments and results.

#### PUT /users/:id

Update user.

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "student",
  "isActive": true
}
```

#### DELETE /users/:id

Deactivate user (soft delete).

#### POST /users/:id/assign-exams

Assign exams to user.

**Request Body:**

```json
{
  "examIds": [1, 2, 3]
}
```

#### DELETE /users/:id/unassign-exams

Unassign exams from user.

**Request Body:**

```json
{
  "examIds": [1, 2, 3]
}
```

#### GET /users/stats/overview

Get user statistics.

**Response:**

```json
{
  "totalUsers": 10,
  "activeUsers": 9,
  "adminUsers": 1,
  "studentUsers": 8,
  "usersWithExams": 5,
  "usersWithResults": 3,
  "inactiveUsers": 1
}
```

### Exam Management (Admin Only)

#### GET /exams

Get all exams with pagination and filters.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by name or description
- `isActive` (optional): Filter by active status

**Response:**

```json
{
  "exams": [
    {
      "id": 1,
      "name": "Mathematics Exam",
      "description": "Basic mathematics test",
      "duration": 60,
      "totalQuestions": 10,
      "passingScore": 70,
      "isActive": true,
      "questionCount": 10,
      "assignedUserCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  }
}
```

#### GET /exams/:id

Get exam by ID with questions and assignments.

#### POST /exams

Create new exam.

**Request Body:**

```json
{
  "name": "New Exam",
  "description": "Exam description",
  "duration": 60,
  "passingScore": 70,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "instructions": "Exam instructions"
}
```

#### PUT /exams/:id

Update exam.

#### DELETE /exams/:id

Deactivate exam.

#### POST /exams/:id/assign-users

Assign users to exam.

**Request Body:**

```json
{
  "userIds": [1, 2, 3]
}
```

#### DELETE /exams/:id/unassign-users

Unassign users from exam.

**Request Body:**

```json
{
  "userIds": [1, 2, 3]
}
```

#### POST /exams/:id/import-questions

Import questions from Excel file.

**Request:**

- Content-Type: multipart/form-data
- Body: file (Excel file with questions)

**Excel Format:**
| Column | Description |
|--------|-------------|
| Question | Question text |
| OptionA | First option |
| OptionB | Second option |
| OptionC | Third option |
| OptionD | Fourth option |
| CorrectAnswer | A, B, C, or D |
| Points | Points for question (optional) |
| Explanation | Explanation (optional) |

#### GET /exams/:id/export-questions

Export exam questions to Excel.

#### GET /exams/stats/overview

Get exam statistics.

### Question Management (Admin Only)

#### GET /questions/exam/:examId

Get all questions for a specific exam.

#### GET /questions/:id

Get question by ID.

#### POST /questions

Create new question.

**Request Body:**

```json
{
  "examId": 1,
  "questionText": "What is 2 + 2?",
  "optionA": "3",
  "optionB": "4",
  "optionC": "5",
  "optionD": "6",
  "correctOption": "B",
  "points": 1,
  "explanation": "Basic addition"
}
```

#### PUT /questions/:id

Update question.

#### DELETE /questions/:id

Delete question.

#### POST /questions/bulk

Create multiple questions.

**Request Body:**

```json
{
  "examId": 1,
  "questions": [
    {
      "questionText": "Question 1",
      "optionA": "A",
      "optionB": "B",
      "optionC": "C",
      "optionD": "D",
      "correctOption": "A"
    }
  ]
}
```

### Results & Exam Taking

#### GET /results/my-exams (Student)

Get user's assigned exams and results.

#### GET /results/exam/:examId/start (Student)

Start an exam (get questions without answers).

#### POST /results/exam/:examId/submit (Student)

Submit exam answers.

**Request Body:**

```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedOption": "A"
    }
  ],
  "timeTaken": 1800
}
```

#### GET /results/my-results (Student)

Get user's exam results.

#### GET /results/exam/:examId/result (Student)

Get detailed exam result with answers.

#### GET /results (Admin)

Get all exam results with filters.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `examId` (optional): Filter by exam ID
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by status (passed/failed/incomplete)

#### GET /results/exam/:examId (Admin)

Get all results for a specific exam.

#### GET /results/export/exam/:examId (Admin)

Export exam results to Excel.

#### GET /results/stats/overview (Admin)

Get overall results statistics.

## Error Responses

### 400 Bad Request

```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "message": "Access token required"
}
```

### 403 Forbidden

```json
{
  "message": "Admin access required"
}
```

### 404 Not Found

```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Server error"
}
```

## Data Models

### User

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "role": "student",
  "isActive": true,
  "lastLogin": "2024-01-01T12:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### Exam

```json
{
  "id": 1,
  "name": "Mathematics Exam",
  "description": "Basic mathematics test",
  "duration": 60,
  "totalQuestions": 10,
  "passingScore": 70,
  "isActive": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "instructions": "Exam instructions",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Question

```json
{
  "id": 1,
  "examId": 1,
  "questionText": "What is 2 + 2?",
  "optionA": "3",
  "optionB": "4",
  "optionC": "5",
  "optionD": "6",
  "correctOption": "B",
  "points": 1,
  "explanation": "Basic addition",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### ExamResult

```json
{
  "id": 1,
  "userId": 1,
  "examId": 1,
  "score": 85.5,
  "totalQuestions": 10,
  "correctAnswers": 8,
  "totalPoints": 10,
  "earnedPoints": 8,
  "timeTaken": 1800,
  "submittedAt": "2024-01-01T12:00:00.000Z",
  "status": "passed",
  "isPassed": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Applied to all endpoints

## File Upload Limits

- Maximum file size: 10MB
- Allowed formats: .xlsx, .xls (for Excel imports)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS configuration
- Helmet security headers
- Rate limiting
