const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function checkAndCreateAdmin() {
    try {
        console.log('Checking users in database...');
        const users = await User.findAll();
        
        console.log(`Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
        });
        
        // Check if admin exists
        const admin = users.find(user => user.email === 'admin@example.com');
        
        if (!admin) {
            console.log('\nAdmin user not found. Creating admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin'
            });
            
            console.log('✅ Admin user created successfully!');
        } else {
            console.log('\n✅ Admin user exists');
            
            // Check if password is correct by trying to compare
            const isValidPassword = await bcrypt.compare('admin123', admin.password);
            console.log(`Password valid: ${isValidPassword}`);
            
            if (!isValidPassword) {
                console.log('Updating admin password...');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                await admin.update({ password: hashedPassword });
                console.log('✅ Admin password updated!');
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

checkAndCreateAdmin();