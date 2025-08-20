// Create admin user using the same database connection as the server
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
    let connection;
    
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'exam_portal',
            port: process.env.DB_PORT || 3306
        });
        
        console.log('✅ Database connected successfully');
        
        // Check if admin user exists
        const [existingUsers] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['admin@example.com']
        );
        
        if (existingUsers.length > 0) {
            console.log('Admin user already exists. Updating password...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(
                'UPDATE users SET password = ? WHERE email = ?',
                [hashedPassword, 'admin@example.com']
            );
            
            console.log('✅ Admin password updated successfully!');
        } else {
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(
                'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
                ['Admin User', 'admin@example.com', hashedPassword, 'admin']
            );
            
            console.log('✅ Admin user created successfully!');
        }
        
        // List all users
        const [allUsers] = await connection.execute('SELECT id, name, email, role FROM users');
        console.log('\nCurrent users in database:');
        allUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nDatabase connection closed.');
        }
    }
}

createAdmin();