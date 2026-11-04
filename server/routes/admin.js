const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
};

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const users = await db.all('SELECT id, username, role, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single user details
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.get('SELECT id, username, role, created_at FROM users WHERE id = ?', [req.params.id]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Also fetch user data (level, etc.)
    const userData = await db.get('SELECT data FROM user_data WHERE user_id = ?', [req.params.id]);
    const parsedData = userData ? JSON.parse(userData.data) : {};

    res.json({ ...user, ...parsedData });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (Super Admin)
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { username, password, role, proficiencyLevel } = req.body;
  const userId = req.params.id;

  try {
    const db = getDb();
    
    // Update basic info
    if (username) {
      await db.run('UPDATE users SET username = ? WHERE id = ?', [username, userId]);
    }

    if (role) {
      await db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, userId]);
    }

    // Update user_data (proficiency level)
    if (proficiencyLevel) {
      const userData = await db.get('SELECT data FROM user_data WHERE user_id = ?', [userId]);
      let data = userData ? JSON.parse(userData.data) : {};
      
      data.proficiencyLevel = proficiencyLevel;
      
      if (userData) {
        await db.run('UPDATE user_data SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [JSON.stringify(data), userId]);
      } else {
        await db.run('INSERT INTO user_data (user_id, data) VALUES (?, ?)', [userId, JSON.stringify(data)]);
      }
    }

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    await db.run('DELETE FROM user_data WHERE user_id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
