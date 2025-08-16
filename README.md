# Exam Portal Application

A comprehensive exam portal with admin and student panels for creating and taking online exams.

## Features

### Admin Panel

- Create and manage exams
- Add questions manually or import from Excel/CSV files
- Assign exams to students
- View exam results and statistics

### Student Panel

- View assigned exams
- Take exams with timer
- View exam results

## Setup Instructions

1. Make sure you have Node.js installed
2. Install backend dependencies:
   ```
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd client
   npm install
   cd ..
   ```
4. Create a MySQL database named `exam_portal`
5. Update the `.env` file with your database credentials
6. Run the setup script:
   ```
   node setup.js
   ```

## Running the Application

### Start the backend server:

```
npm run dev
```

### Start the frontend development server:

```
cd client
npm start
```

## Default Login Credentials

### Admin

- Email: admin@examportal.com
- Password: admin123

### Student

- Email: student@examportal.com
- Password: student123

## Importing Questions

To import questions from Excel/CSV:

1. Create an Excel file with the following columns:
   - Question
   - OptionA
   - OptionB
   - OptionC
   - OptionD
   - CorrectAnswer (A, B, C, or D)
   - Points (optional)
   - Explanation (optional)
2. Go to Admin Panel -> Exams
3. Click on "Questions" button for the exam you want to add questions to
4. Click "Import from Excel" and select your file

## Taking Exams

Students can take exams by:

1. Logging in to the student panel
2. Going to "My Exams"
3. Clicking "Start Exam" on an assigned exam
4. Answering questions and submitting when finished

## Technologies Used

- Backend: Node.js, Express, MySQL, Sequelize
- Frontend: React, React Router, Axios
- Authentication: JWT
- File Uploads: Multer, XLSX
