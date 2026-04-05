const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { docClient } = require('../config/dynamodb');
const TABLES = require('../config/tables');
const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);

// GET all users (Admin and Manager only)
router.get('/', checkRole('Administrator', 'Manager'), async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: TABLES.USERS }));
    const users = (result.Items || []).map(({ password_hash, ...u }) => u);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { user_id: req.params.id },
    }));
    if (!result.Item) return res.status(404).json({ error: 'User not found' });
    const { password_hash, ...user } = result.Item;
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST create user (Admin only)
router.post('/', checkRole('Administrator'), async (req, res) => {
  try {
    const { username, password, email, role, status, permissions } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check username uniqueness via GSI
    const usernameCheck = await docClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'username-index',
      KeyConditionExpression: 'username = :u',
      ExpressionAttributeValues: { ':u': username },
    }));
    if ((usernameCheck.Items || []).length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Check email uniqueness
    const emailCheck = await docClient.send(new ScanCommand({
      TableName: TABLES.USERS,
      FilterExpression: 'email = :e',
      ExpressionAttributeValues: { ':e': email },
    }));
    if ((emailCheck.Items || []).length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user_id = uuidv4();
    const now = new Date().toISOString();

    await docClient.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: {
        user_id, username, password_hash, email,
        role: role || 'Employee',
        status: status || 'Active',
        permissions: permissions || [],
        created_at: now, updated_at: now,
      },
    }));

    res.status(201).json({ message: 'User created successfully', user_id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user (Admin and Manager only)
router.put('/:id', checkRole('Administrator', 'Manager'), async (req, res) => {
  try {
    const { username, email, role, status, permissions } = req.body;
    await docClient.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { user_id: req.params.id },
      UpdateExpression: 'SET username=:u, email=:e, #r=:r, #s=:s, permissions=:p, updated_at=:ua',
      ExpressionAttributeNames: { '#r': 'role', '#s': 'status' },
      ExpressionAttributeValues: {
        ':u': username, ':e': email, ':r': role, ':s': status,
        ':p': permissions || [], ':ua': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(user_id)',
    }));
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'User not found' });
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user (Admin only)
router.delete('/:id', checkRole('Administrator'), async (req, res) => {
  try {
    await docClient.send(new DeleteCommand({
      TableName: TABLES.USERS,
      Key: { user_id: req.params.id },
      ConditionExpression: 'attribute_exists(user_id)',
    }));
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') return res.status(404).json({ error: 'User not found' });
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
