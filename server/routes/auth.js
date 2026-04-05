const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { generateToken, verifyToken } = require('../middleware/auth');
const {
  PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

// POST /api/auth/signup - Register new user
router.post('/signup', async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check username uniqueness
    const usernameCheck = await docClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'username-index',
      KeyConditionExpression: 'username = :u',
      ExpressionAttributeValues: { ':u': username },
    }));
    if (usernameCheck.Items.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Check email uniqueness (scan — small table)
    const emailCheck = await docClient.send(new ScanCommand({
      TableName: TABLES.USERS,
      FilterExpression: 'email = :e',
      ExpressionAttributeValues: { ':e': email },
    }));
    if (emailCheck.Items.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const userRole = role && ['Manager', 'Employee', 'Viewer'].includes(role) ? role : 'Employee';
    const now = new Date().toISOString();
    const user_id = uuidv4();

    const newUser = {
      user_id,
      username,
      password_hash,
      email,
      role: userRole,
      status: 'Active',
      permissions: [],
      created_at: now,
      updated_at: now,
    };

    await docClient.send(new PutCommand({ TableName: TABLES.USERS, Item: newUser }));

    const { password_hash: _ph, ...userWithoutPassword } = newUser;
    const token = generateToken(userWithoutPassword);

    res.status(201).json({ message: 'User created successfully', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST /api/auth/login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'username-index',
      KeyConditionExpression: 'username = :u',
      ExpressionAttributeValues: { ':u': username },
    }));

    if (result.Items.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.Items[0];

    if (user.status !== 'Active') {
      return res.status(403).json({ error: `Account is ${user.status.toLowerCase()}. Please contact an administrator.` });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Update last login time
    await docClient.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { user_id: user.user_id },
      UpdateExpression: 'SET last_login = :t',
      ExpressionAttributeValues: { ':t': new Date().toISOString() },
    }));

    const token = generateToken(user);
    const { password_hash, ...userWithoutPassword } = user;

    res.json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// GET /api/auth/verify - Verify token and get current user
router.get('/verify', verifyToken, async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { user_id: req.user.user_id },
    }));

    if (!result.Item) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.Item;
    if (user.status !== 'Active') {
      return res.status(403).json({ error: `Account is ${user.status.toLowerCase()}` });
    }

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ valid: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

// POST /api/auth/logout
router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logout successful', note: 'Please delete the token on the client side' });
});

// POST /api/auth/change-password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Get current user's password hash
    const userResult = await docClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { user_id: req.user.user_id },
    }));

    if (!userResult.Item) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, userResult.Item.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await docClient.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { user_id: req.user.user_id },
      UpdateExpression: 'SET password_hash = :ph, updated_at = :t',
      ExpressionAttributeValues: {
        ':ph': newPasswordHash,
        ':t': new Date().toISOString(),
      },
    }));

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
