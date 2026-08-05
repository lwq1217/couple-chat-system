const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');
const router = express.Router();

// 获取与某好友的聊天记录
router.get('/:friendId', auth, (req, res) => {
  const { friendId } = req.params;
  db.all(`
    SELECT m.*, 
      s.nickname as sender_nickname, s.avatar as sender_avatar,
      r.nickname as receiver_nickname, r.avatar as receiver_avatar
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.receiver_id = r.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC
  `, [req.userId, friendId, friendId, req.userId], (err, messages) => {
    if (err) return res.status(500).json({ message: '获取失败' });
    // 标记为已读
    db.run('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0', [friendId, req.userId]);
    res.json(messages);
  });
});

// 获取未读消息数
router.get('/unread/count', auth, (req, res) => {
  db.all(`
    SELECT sender_id, COUNT(*) as count 
    FROM messages 
    WHERE receiver_id = ? AND is_read = 0 
    GROUP BY sender_id
  `, [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ message: '获取失败' });
    const counts = {};
    rows.forEach(r => counts[r.sender_id] = r.count);
    res.json(counts);
  });
});

// 发送消息 (HTTP备用)
router.post('/', auth, (req, res) => {
  const { receiverId, content, type, fileUrl, fileName } = req.body;
  db.run(
    'INSERT INTO messages (sender_id, receiver_id, content, type, file_url, file_name) VALUES (?, ?, ?, ?, ?, ?)',
    [req.userId, receiverId, content, type || 'text', fileUrl || null, fileName || null],
    function(err) {
      if (err) return res.status(500).json({ message: '发送失败' });
      res.json({ id: this.lastID, message: '发送成功' });
    }
  );
});

module.exports = router;
