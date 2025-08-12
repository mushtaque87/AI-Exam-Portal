const { User, Exam, Question } = require('../models');
const bcrypt = require('bcryptjs');

const seedInitialData = async () => {
    try {
        console.log('🌱 Seeding initial data...');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({
            where: { email: 'admin@examportal.com' }
        });

        if (!existingAdmin) {
            // Create admin user
            const adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@examportal.com',
                password: 'admin123',
                role: 'admin',
                isActive: true
            });

            console.log('✅ Admin user created:', adminUser.email);
        } else {
            console.log('ℹ️ Admin user already exists');
        }

        // Create sample exam if none exists
        const existingExam = await Exam.findOne();
        if (!existingExam) {
            const sampleExam = await Exam.create({
                title: 'Sample Mathematics Exam',
                description: 'A sample exam to test the system functionality',
                date: new Date()
            });

            console.log('✅ Sample exam created:', sampleExam.title);

            // Create sample questions
            const sampleQuestions = [
                {
                    examId: sampleExam.id,
                    questionText: 'What is 2 + 2?',
                    optionA: '3',
                    optionB: '4',
                    optionC: '5',
                    optionD: '6',
                    correctOption: 'B',
                    points: 1,
                    explanation: 'Basic addition: 2 + 2 = 4'
                },
                {
                    examId: sampleExam.id,
                    questionText: 'What is the square root of 16?',
                    optionA: '2',
                    optionB: '3',
                    optionC: '4',
                    optionD: '5',
                    correctOption: 'C',
                    points: 1,
                    explanation: '4 × 4 = 16, so √16 = 4'
                },
                {
                    examId: sampleExam.id,
                    questionText: 'What is 10 × 5?',
                    optionA: '40',
                    optionB: '45',
                    optionC: '50',
                    optionD: '55',
                    correctOption: 'C',
                    points: 1,
                    explanation: '10 × 5 = 50'
                },
                {
                    examId: sampleExam.id,
                    questionText: 'What is 100 ÷ 4?',
                    optionA: '20',
                    optionB: '25',
                    optionC: '30',
                    optionD: '35',
                    correctOption: 'B',
                    points: 1,
                    explanation: '100 ÷ 4 = 25'
                },
                {
                    examId: sampleExam.id,
                    questionText: 'What is the value of π (pi) to two decimal places?',
                    optionA: '3.12',
                    optionB: '3.14',
                    optionC: '3.16',
                    optionD: '3.18',
                    correctOption: 'B',
                    points: 1,
                    explanation: 'π ≈ 3.14159...'
                }
            ];

            await Question.bulkCreate(sampleQuestions);
            console.log('✅ Sample questions created');

            // Update exam question count
            // await sampleExam.update({ totalQuestions: sampleQuestions.length });
        } else {
            console.log('ℹ️ Sample exam already exists');
        }

        console.log('🎉 Initial data seeding completed!');
        console.log('\n📋 Default Login Credentials:');
        console.log('Email: admin@examportal.com');
        console.log('Password: admin123');
        console.log('\n⚠️ Please change the default password after first login!');

    } catch (error) {
        console.error('❌ Error seeding initial data:', error);
    }
};

module.exports = seedInitialData; 