const bcrypt = require('bcrypt');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { pool } = require('../config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function resetPassword() {
  try {
    console.log('\n=== Reset User Password ===\n');

    // Show existing users
    const [users] = await pool.query(
      'SELECT user_id, username, email, role, status FROM users ORDER BY user_id'
    );

    if (users.length === 0) {
      console.log('No users found in database.');
      process.exit(0);
    }

    console.log('Existing users:\n');
    users.forEach(user => {
      console.log(`  ID: ${user.user_id} | Username: ${user.username} | Email: ${user.email} | Role: ${user.role}`);
    });

    console.log('\n');
    const username = await question('Enter username to reset password for: ');
    
    if (!username) {
      console.error('Username is required');
      process.exit(1);
    }

    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT user_id, username, role FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length === 0) {
      console.error(`\n❌ User '${username}' not found`);
      process.exit(1);
    }

    const user = existingUsers[0];
    console.log(`\nResetting password for: ${user.username} (${user.role})`);

    const newPassword = await question('New password (min 8 characters): ');
    
    if (!newPassword || newPassword.length < 8) {
      console.error('Password must be at least 8 characters');
      process.exit(1);
    }

    // Hash new password
    console.log('\nHashing password...');
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [password_hash, user.user_id]
    );

    console.log('\n✅ Password reset successfully!');
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}\n`);
    console.log('You can now login with the new password.\n');

  } catch (error) {
    console.error('\n❌ Error resetting password:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

resetPassword();
