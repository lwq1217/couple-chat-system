const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');
const router = express.Router();

// 记录通话
router.post('/', auth, (req, res) => {
  const { receiverId, type, status, duration } = req.body;
  db.run(
    'INSERT INTO calls (caller_id, receiver_id, type, status, duration) VALUES (?, ?, ?, ?, ?)',
    [req.userId, receiverId, type, status, duration || 0],
    function(err) {
      if (err) return res.status(500).json({ message: '记录失败' });
      res.json({ id: this.lastID, message: '记录成功' });
    }
  );
});

// 获取通话记录
router.get('/', auth, (req, res) => {
  db.all(`
    SELECT c.*, 
      u1.nickname as caller_nickname, u1.avatar as caller_avatar,
      u2.nickname as receiver_nickname, u2.avatar as receiver_avatar
    FROM calls c
    JOIN users u1 ON c.caller_id = u1.id
    JOIN users u2 ON c.receiver_id = u2.id
    WHERE c.caller_id = ? OR c.receiver_id = ?
    ORDER BY c.created_at DESC
    LIMIT 50
  `, [req.userId, req.userId], (err, calls) => {
    if (err) return res.status(500).json({ message: '获取失败' });
    res.json(calls);
  });
});

module.exports = router;
