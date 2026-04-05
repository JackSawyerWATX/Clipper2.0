const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

async function verifyAdminCredentials() {
  try {
    console.log('Checking admin user in database...\n');
    
    // Get the admin user
    const [users] = await pool.query(
      'SELECT user_id, username, email, role, status, password_hash FROM users WHERE username = ?',
      ['admin']
    );

    if (users.length === 0) {
      console.log('❌ Admin user not found in database');
      process.exit(1);
    }

    const user = users[0];
    console.log('✅ Admin user found:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Password Hash: ${user.password_hash}\n`);

    // Test bcrypt.compare
    const testPassword = 'admin123';
    console.log(`Testing bcrypt.compare with password: "${testPassword}"\n`);
    
    const isMatch = await bcrypt.compare(testPassword, user.password_hash);
    
    if (isMatch) {
      console.log('✅ Password matches! bcrypt verification successful');
      console.log('Login should work.');
    } else {
      console.log('❌ Password does NOT match. Hash mismatch detected.');
      console.log('\nGenerating correct hash for "admin123"...');
      
      const correctHash = await bcrypt.hash('admin123', 10);
      console.log(`New hash: ${correctHash}`);
      
      // Update with new hash
      await pool.query(
        'UPDATE users SET password_hash = ? WHERE username = ?',
        [correctHash, 'admin']
      );
      console.log('\n✅ Updated database with new hash. Try logging in again.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAdminCredentials();
