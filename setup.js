#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Exam Portal Setup Script');
console.log('============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    const envExample = fs.readFileSync(path.join(__dirname, 'env.example'), 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ .env file created from env.example');
    console.log('⚠️  Please edit .env file with your database credentials before starting the server\n');
} else {
    console.log('✅ .env file already exists\n');
}

// Check if uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    console.log('📁 Creating uploads directory...');
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Uploads directory created\n');
} else {
    console.log('✅ Uploads directory already exists\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing backend dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Backend dependencies installed\n');
    } catch (error) {
        console.error('❌ Failed to install backend dependencies');
        process.exit(1);
    }
} else {
    console.log('✅ Backend dependencies already installed\n');
}

// Check if client/node_modules exists
const clientNodeModulesPath = path.join(__dirname, 'client', 'node_modules');
if (!fs.existsSync(clientNodeModulesPath)) {
    console.log('📦 Installing frontend dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'client') });
        console.log('✅ Frontend dependencies installed\n');
    } catch (error) {
        console.error('❌ Failed to install frontend dependencies');
        process.exit(1);
    }
} else {
    console.log('✅ Frontend dependencies already installed\n');
}

console.log('🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env file with your MySQL database credentials');
console.log('2. Create a MySQL database named "exam_portal"');
console.log('3. Start the backend server: npm run dev');
console.log('4. Start the frontend: cd client && npm start');
console.log('\n🔗 Default login credentials:');
console.log('Email: admin@examportal.com');
console.log('Password: admin123');
console.log('\n⚠️  Remember to change the default password after first login!'); 