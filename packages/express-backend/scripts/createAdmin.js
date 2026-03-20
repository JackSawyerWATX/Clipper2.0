const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdminUser() {
  try {
    console.log('\n=== Clipper 2.0 - Create Admin User ===\n');

    // Get user input
    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password (min 8 characters): ');

    // Validate inputs
    if (!username || !email || !password) {
      console.error('Error: All fields are required');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('Error: Password must be at least 8 characters');
      process.exit(1);
    }

    // Check if user exists
    const [existing] = await pool.query(
      'SELECT user_id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      console.error('Error: Username or email already exists');
      process.exit(1);
    }

    // Hash password
    console.log('\nHashing password...');
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert admin user
    console.log('Creating admin user...');
    const [result] = await pool.query(
      `INSERT INTO users (username, password_hash, email, role, status, permissions)
       VALUES (?, ?, ?, 'Administrator', 'Active', '[]')`,
      [username, password_hash, email]
    );

    console.log('\n✓ Admin user created successfully!');
    console.log(`User ID: ${result.insertId}`);
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Role: Administrator`);
    console.log('\nYou can now login with these credentials.\n');

  } catch (error) {
    console.error('\n✗ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

// Run the script
createAdminUser();
