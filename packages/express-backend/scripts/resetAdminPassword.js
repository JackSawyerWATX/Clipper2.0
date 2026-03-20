const { pool } = require('../config/database');

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password to admin123...');
    
    const correctHash = '$2b$10$Oxcs3Sty9kqNw5P.gHZXu.9eB2.rH6rEm.kNGvIITwGJ0e/5ayqKa';
    
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [correctHash, 'admin']
    );

    if (result.affectedRows > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('You can now login with:');
      console.log('  Username: admin');
      console.log('  Password: admin123');
    } else {
      console.log('❌ Admin user not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
