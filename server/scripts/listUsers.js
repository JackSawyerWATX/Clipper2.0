const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { pool } = require('../config/database');

async function listUsers() {
  try {
    console.log('\n=== Users in Database ===\n');

    const [users] = await pool.query(
      'SELECT user_id, username, email, role, status, created_at FROM users ORDER BY user_id'
    );

    if (users.length === 0) {
      console.log('❌ No users found in database.\n');
      console.log('Create a user with: npm run create-admin\n');
    } else {
      console.log('Found', users.length, 'user(s):\n');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: "${user.username}"`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

listUsers();
