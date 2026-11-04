const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Get user data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const row = await db.get('SELECT data FROM user_data WHERE user_id = ?', [req.user.userId]);
    
    if (!row) {
      return res.json({ data: null }); // No data yet
    }

    res.json({ data: JSON.parse(row.data) });
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save user data
router.post('/', authenticateToken, async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ error: 'Data is required' });
  }

  try {
    const db = getDb();
    const dataStr = JSON.stringify(data);

    // Upsert (Insert or Replace)
    await db.run(`
      INSERT INTO user_data (user_id, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET 
        data = excluded.data,
        updated_at = CURRENT_TIMESTAMP
    `, [req.user.userId, dataStr]);

    res.json({ success: true });
  } catch (error) {
    console.error('Save data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
