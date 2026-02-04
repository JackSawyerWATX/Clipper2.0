const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { generateToken, verifyToken } = require('../middleware/auth');

// POST /api/auth/signup - Register new user
router.post('/signup', async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

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

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT user_id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Set default role if not provided (or if user tries to set admin)
    // Only existing admins should be able to create admin users
    const userRole = role && ['Manager', 'Employee', 'Viewer'].includes(role) 
      ? role 
      : 'Employee';

    // Create user
    const [result] = await pool.query(
      `INSERT INTO users (username, password_hash, email, role, status, permissions)
       VALUES (?, ?, ?, ?, 'Active', '[]')`,
      [username, password_hash, email, userRole]
    );

    // Get the created user (without password)
    const [newUser] = await pool.query(
      'SELECT user_id, username, email, role, status, permissions, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );

    // Generate token
    const token = generateToken(newUser[0]);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: newUser[0]
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST /api/auth/login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Find user by username
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(403).json({ 
        error: `Account is ${user.status.toLowerCase()}. Please contact an administrator.` 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid username or password' 
      });
    }

    // Update last login time
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
      [user.user_id]
    );

    // Generate token
    const token = generateToken(user);

    // Return user info (without password) and token
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// GET /api/auth/verify - Verify token and get current user
router.get('/verify', verifyToken, async (req, res) => {
  try {
    // Get fresh user data from database
    const [users] = await pool.query(
      'SELECT user_id, username, email, role, status, permissions, last_login, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Check if user is still active
    if (user.status !== 'Active') {
      return res.status(403).json({ 
        error: `Account is ${user.status.toLowerCase()}` 
      });
    }

    res.json({
      valid: true,
      user
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

// POST /api/auth/logout - Logout (client should delete token)
router.post('/logout', verifyToken, (req, res) => {
  // In a JWT implementation, logout is primarily handled client-side
  // by removing the token. This endpoint exists for logging purposes
  // or if you want to implement token blacklisting in the future.
  
  res.json({ 
    message: 'Logout successful',
    note: 'Please delete the token on the client side'
  });
});

// POST /api/auth/change-password - Change password for authenticated user
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters long' 
      });
    }

    // Get current user's password hash
    const [users] = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [newPasswordHash, req.user.user_id]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
