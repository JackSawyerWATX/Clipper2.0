const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET all users (Admin and Manager only)
router.get('/', checkRole('Administrator', 'Manager'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, username, email, role, status, permissions, created_at FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, username, email, role, status, permissions, created_at FROM users WHERE user_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST create user (Admin only)
router.post('/', checkRole('Administrator'), async (req, res) => {
  try {
    const { username, password, email, role, status, permissions } = req.body;

    // Validate required fields
    if (!username || !password || !email) {
      return res.status(400).json({ 
        error: 'Username, password, and email are required' 
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      `INSERT INTO users (username, password_hash, email, role, status, permissions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, password_hash, email, role || 'Employee', status || 'Active', JSON.stringify(permissions || [])]
    );

    res.status(201).json({ 
      message: 'User created successfully',
      user_id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user (Admin and Manager only)
router.put('/:id', checkRole('Administrator', 'Manager'), async (req, res) => {
  try {
    const { username, email, role, status, permissions } = req.body;

    const [result] = await pool.query(
      `UPDATE users SET username = ?, email = ?, role = ?, status = ?, permissions = ?
       WHERE user_id = ?`,
      [username, email, role, status, JSON.stringify(permissions), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user (Admin only)
router.delete('/:id', checkRole('Administrator'), async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
