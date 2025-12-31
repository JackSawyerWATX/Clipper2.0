const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all users
router.get('/', async (req, res) => {
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

// POST create user
router.post('/', async (req, res) => {
  try {
    const { username, password_hash, email, role, status, permissions } = req.body;

    const [result] = await pool.query(
      `INSERT INTO users (username, password_hash, email, role, status, permissions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, password_hash, email, role, status, JSON.stringify(permissions)]
    );

    res.status(201).json({ 
      message: 'User created successfully',
      user_id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
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

// DELETE user
router.delete('/:id', async (req, res) => {
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
