const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createOrUpdateStudent() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'exam_portal'
        });
        
        console.log('✅ Connected to database');
        
        // Check if student user exists
        const [existingUsers] = await connection.execute(
            'SELECT id, email, role, is_active FROM users WHERE email = ?',
            ['amaan@pmiindia.org']
        );
        
        const hashedPassword = await bcrypt.hash('student123', 10);
        
        if (existingUsers.length > 0) {
            console.log('📝 Student user exists, updating password...');
            await connection.execute(
                'UPDATE users SET password = ?, is_active = 1 WHERE email = ?',
                [hashedPassword, 'amaan@pmiindia.org']
            );
            console.log('✅ Student user password updated');
        } else {
            console.log('👤 Creating new student user...');
            await connection.execute(
                'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
                ['Amaan Student', 'amaan@pmiindia.org', hashedPassword, 'student', 1]
            );
            console.log('✅ Student user created');
        }
        
        // List all users
        const [allUsers] = await connection.execute(
            'SELECT id, name, email, role, is_active FROM users ORDER BY id'
        );
        
        console.log('\n📋 All users in database:');
        allUsers.forEach(user => {
            console.log(`  ${user.id}: ${user.name} (${user.email}) - ${user.role} - ${user.is_active ? 'Active' : 'Inactive'}`);
        });
        
        // Check table structure first
        console.log('\n🔍 Checking user_exam_assignments table structure...');
        const [columns] = await connection.execute('DESCRIBE user_exam_assignments');
        console.log('Table columns:', columns.map(col => col.Field));
        
        // Check if student has any exam assignments
        const studentUser = allUsers.find(u => u.email === 'amaan@pmiindia.org');
        if (studentUser) {
            const [assignments] = await connection.execute(
                'SELECT COUNT(*) as count FROM user_exam_assignments WHERE user_id = ?',
                [studentUser.id]
            );
            console.log(`\n📚 Student has ${assignments[0].count} exam assignments`);
            
            // If no assignments, let's assign the student to an available exam
            if (assignments[0].count === 0) {
                const [exams] = await connection.execute(
                    'SELECT id, title, isActive FROM exams WHERE isActive = 1 LIMIT 1'
                );
                
                if (exams.length > 0) {
                    console.log(`📝 Assigning student to exam: ${exams[0].title}`);
                    await connection.execute(
                        'INSERT INTO user_exam_assignments (user_id, exam_id, assigned_at) VALUES (?, ?, NOW())',
                        [studentUser.id, exams[0].id]
                    );
                    console.log('✅ Student assigned to exam');
                } else {
                    console.log('⚠️ No active exams found to assign');
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

createOrUpdateStudent();