# 🧠 Exam Portal

A comprehensive exam portal with admin and student panels, built with Node.js, Express.js, MySQL, and React.js.

## ✨ Features

### 🔐 Admin Panel

- **User Management**: Add, edit, delete users and assign them to exams
- **Exam Management**: Create, edit, delete exams with MCQ questions
- **Question Management**: Add questions manually or import via Excel
- **Results & Reports**: View detailed results, export to Excel/PDF
- **Statistics Dashboard**: Overview of users, exams, and performance metrics

### 🧑‍🎓 Student Panel

- **Secure Login**: JWT-based authentication
- **Exam Dashboard**: View assigned exams and results
- **Take Exams**: MCQ-based exams with timer
- **View Results**: Detailed results with correct answers and explanations

### 🛠️ Technical Features

- **Excel Import/Export**: Bulk question import and result export
- **Real-time Timer**: Countdown timer for exams
- **Responsive Design**: Modern UI with mobile support
- **Security**: JWT authentication, rate limiting, input validation
- **Database**: MySQL with Sequelize ORM

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd exam-portal
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your database credentials:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=exam_portal
   DB_PORT=3306
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   PORT=5000
   NODE_ENV=development
   ```

4. **Create MySQL Database**

   ```sql
   CREATE DATABASE exam_portal;
   ```

5. **Start the server**

   ```bash
   npm run dev
   ```

6. **Access the application**
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

### Default Login Credentials

- **Email**: admin@examportal.com
- **Password**: admin123

⚠️ **Important**: Change the default password after first login!

## 📁 Project Structure

```
exam-portal/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Exam.js              # Exam model
│   ├── Question.js          # Question model
│   ├── UserExamAssignment.js # User-Exam assignment model
│   ├── ExamResponse.js      # Individual question responses
│   ├── ExamResult.js        # Overall exam results
│   └── index.js             # Model associations
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── exams.js             # Exam management routes
│   ├── questions.js         # Question management routes
│   └── results.js           # Results and exam taking routes
├── seeders/
│   └── initialData.js       # Initial data seeder
├── uploads/                 # File upload directory
├── server.js                # Main server file
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### User Management (Admin Only)

- `GET /api/users` - Get all users with pagination
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `POST /api/users/:id/assign-exams` - Assign exams to user
- `DELETE /api/users/:id/unassign-exams` - Unassign exams from user
- `GET /api/users/stats/overview` - User statistics

### Exam Management (Admin Only)

- `GET /api/exams` - Get all exams with pagination
- `GET /api/exams/:id` - Get exam by ID
- `POST /api/exams` - Create new exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Deactivate exam
- `POST /api/exams/:id/assign-users` - Assign users to exam
- `DELETE /api/exams/:id/unassign-users` - Unassign users from exam
- `POST /api/exams/:id/import-questions` - Import questions from Excel
- `GET /api/exams/:id/export-questions` - Export questions to Excel
- `GET /api/exams/stats/overview` - Exam statistics

### Question Management (Admin Only)

- `GET /api/questions/exam/:examId` - Get questions for exam
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/bulk` - Create multiple questions
- `PUT /api/questions/reorder` - Reorder questions

### Results & Exam Taking

- `GET /api/results/my-exams` - Get user's assigned exams (student)
- `GET /api/results/exam/:examId/start` - Start exam (student)
- `POST /api/results/exam/:examId/submit` - Submit exam (student)
- `GET /api/results/my-results` - Get user's results (student)
- `GET /api/results/exam/:examId/result` - Get detailed result (student)
- `GET /api/results` - Get all results (admin)
- `GET /api/results/exam/:examId` - Get exam results (admin)
- `GET /api/results/export/exam/:examId` - Export results to Excel (admin)
- `GET /api/results/stats/overview` - Results statistics (admin)

## 📊 Database Schema

### Users Table

- `id` (Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `role` (ENUM: 'admin', 'student')
- `isActive` (BOOLEAN)
- `lastLogin` (DATETIME)
- `createdAt`, `updatedAt` (TIMESTAMPS)

### Exams Table

- `id` (Primary Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `duration` (INTEGER, minutes)
- `totalQuestions` (INTEGER)
- `passingScore` (INTEGER, percentage)
- `isActive` (BOOLEAN)
- `startDate`, `endDate` (DATETIME)
- `instructions` (TEXT)
- `createdAt`, `updatedAt` (TIMESTAMPS)

### Questions Table

- `id` (Primary Key)
- `examId` (Foreign Key)
- `questionText` (TEXT)
- `optionA`, `optionB`, `optionC`, `optionD` (TEXT)
- `correctOption` (ENUM: 'A', 'B', 'C', 'D')
- `points` (INTEGER)
- `explanation` (TEXT)
- `createdAt`, `updatedAt` (TIMESTAMPS)

### User Exam Assignments Table

- `id` (Primary Key)
- `userId` (Foreign Key)
- `examId` (Foreign Key)
- `assignedAt` (DATETIME)
- `assignedBy` (Foreign Key)
- `isActive` (BOOLEAN)
- `createdAt`, `updatedAt` (TIMESTAMPS)

### Exam Responses Table

- `id` (Primary Key)
- `userId` (Foreign Key)
- `examId` (Foreign Key)
- `questionId` (Foreign Key)
- `selectedOption` (ENUM: 'A', 'B', 'C', 'D')
- `isCorrect` (BOOLEAN)
- `pointsEarned` (INTEGER)
- `timeSpent` (INTEGER, seconds)
- `createdAt`, `updatedAt` (TIMESTAMPS)

### Exam Results Table

- `id` (Primary Key)
- `userId` (Foreign Key)
- `examId` (Foreign Key)
- `score` (DECIMAL, percentage)
- `totalQuestions` (INTEGER)
- `correctAnswers` (INTEGER)
- `totalPoints` (INTEGER)
- `earnedPoints` (INTEGER)
- `timeTaken` (INTEGER, seconds)
- `submittedAt` (DATETIME)
- `status` (ENUM: 'passed', 'failed', 'incomplete')
- `isPassed` (BOOLEAN)
- `createdAt`, `updatedAt` (TIMESTAMPS)

## 📋 Excel Import Format

For importing questions via Excel, use the following column structure:

| Column        | Description                | Required        |
| ------------- | -------------------------- | --------------- |
| Question      | Question text              | Yes             |
| OptionA       | First option               | Yes             |
| OptionB       | Second option              | Yes             |
| OptionC       | Third option               | Yes             |
| OptionD       | Fourth option              | Yes             |
| CorrectAnswer | A, B, C, or D              | Yes             |
| Points        | Points for this question   | No (default: 1) |
| Explanation   | Explanation for the answer | No              |

## 🔧 Configuration

### Environment Variables

- `DB_HOST`: MySQL host (default: localhost)
- `DB_USER`: MySQL username (default: root)
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name (default: exam_portal)
- `DB_PORT`: MySQL port (default: 3306)
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration (default: 24h)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `MAX_FILE_SIZE`: Maximum file upload size (default: 10MB)
- `UPLOAD_PATH`: File upload directory (default: ./uploads)

### Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation with express-validator
- CORS configuration
- Helmet security headers

## 🚀 Deployment

### Production Setup

1. Set `NODE_ENV=production` in environment variables
2. Configure production database
3. Set strong JWT secret
4. Configure CORS origins for production domain
5. Set up reverse proxy (nginx recommended)
6. Use PM2 or similar process manager

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the database schema

## 🔄 Updates

### Version 1.0.0

- Initial release with full admin and student functionality
- Excel import/export support
- Comprehensive API endpoints
- Security features implemented
- Sample data included

---

**Happy Coding! 🎉**
