const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { QueryCommand, ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdminUser() {
  try {
    console.log('\n=== Clipper 2.0 - Create Admin User ===\n');

    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password (min 8 characters): ');

    if (!username || !email || !password) {
      console.error('Error: All fields are required');
      process.exit(1);
    }
    if (password.length < 8) {
      console.error('Error: Password must be at least 8 characters');
      process.exit(1);
    }

    // Check username via GSI
    const usernameCheck = await docClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'username-index',
      KeyConditionExpression: 'username = :u',
      ExpressionAttributeValues: { ':u': username },
    }));
    if ((usernameCheck.Items || []).length > 0) {
      console.error('Error: Username already exists');
      process.exit(1);
    }

    // Check email via scan
    const emailCheck = await docClient.send(new ScanCommand({
      TableName: TABLES.USERS,
      FilterExpression: 'email = :e',
      ExpressionAttributeValues: { ':e': email },
    }));
    if ((emailCheck.Items || []).length > 0) {
      console.error('Error: Email already exists');
      process.exit(1);
    }

    console.log('\nHashing password...');
    const password_hash = await bcrypt.hash(password, 10);
    const user_id = uuidv4();
    const now = new Date().toISOString();

    console.log('Creating admin user...');
    await docClient.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: {
        user_id, username, password_hash, email,
        role: 'Administrator', status: 'Active', permissions: [],
        created_at: now, updated_at: now,
      },
    }));

    console.log('\n✓ Admin user created successfully!');
    console.log(`User ID: ${user_id}`);
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Role: Administrator\n`);
  } catch (error) {
    console.error('\n✗ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdminUser();
