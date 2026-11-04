const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.get('SELECT id, username, role FROM users WHERE id = ?', [req.user.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const db = getDb();
    
    // Check if user exists
    const existingUser = await db.get('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [username]);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await db.run(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hash]
    );

    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.lastID 
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login request received for:', username);

  if (!username || !password) {
    console.log('Missing credentials');
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const db = getDb();
    console.log('Querying user...');
    const user = await db.get('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username]);
    console.log('User found:', !!user);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Comparing password...');
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token (expires in 24h)
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful, sending response');
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change Username
router.post('/change-username', authenticateToken, async (req, res) => {
  const { newUsername } = req.body;

  if (!newUsername) {
    return res.status(400).json({ error: 'New username is required' });
  }

  try {
    const db = getDb();
    
    // Check if username exists
    const existingUser = await db.get('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?', [newUsername, req.user.userId]);
    if (existingUser) {
      return res.status(409).json({ error: 'Username in use, please try another one!' });
    }

    // Update username
    await db.run('UPDATE users SET username = ? WHERE id = ?', [newUsername, req.user.userId]);

    // Fetch updated user to get role
    const updatedUser = await db.get('SELECT role FROM users WHERE id = ?', [req.user.userId]);

    // Generate new token with updated username
    const token = jwt.sign(
      { userId: req.user.userId, username: newUsername, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      token,
      user: {
        id: req.user.userId,
        username: newUsername,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('Change username error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change Password
router.post('/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old and new passwords are required' });
  }

  try {
    const db = getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.userId]);

    res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
