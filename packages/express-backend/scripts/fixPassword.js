const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { pool } = require('../config/database');

async function fixPassword() {
  try {
    const username = 'Jack Sawyer';
    const newPassword = '12345678';

    console.log(`\nResetting password for user: "${username}"`);
    console.log('New password:', newPassword);

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [password_hash, username]
    );

    if (result.affectedRows === 0) {
      console.log('❌ User not found');
    } else {
      console.log('✅ Password reset successfully!');
      console.log('\nLogin with:');
      console.log('  Username: Jack Sawyer');
      console.log('  Password: 12345678\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixPassword();
