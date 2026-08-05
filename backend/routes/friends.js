const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');
const router = express.Router();

// 发送好友请求
router.post('/request', auth, (req, res) => {
  const { friendId } = req.body;
  db.run(
    'INSERT OR IGNORE INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)',
    [req.userId, friendId, 'pending'],
    function(err) {
      if (err) return res.status(500).json({ message: '发送失败' });
      res.json({ message: '好友请求已发送' });
    }
  );
});

// 接受好友请求
router.post('/accept', auth, (req, res) => {
  const { friendId } = req.body;
  db.run(
    'UPDATE friendships SET status = ? WHERE user_id = ? AND friend_id = ?',
    ['accepted', friendId, req.userId],
    function(err) {
      if (err) return res.status(500).json({ message: '操作失败' });
      // 双向添加
      db.run(
        'INSERT OR IGNORE INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)',
        [req.userId, friendId, 'accepted'],
        function(err2) {
          res.json({ message: '已成为好友' });
        }
      );
    }
  );
});

// 获取好友列表
router.get('/list', auth, (req, res) => {
  db.all(`
    SELECT u.id, u.username, u.nickname, u.avatar, u.bio, f.status
    FROM friendships f
    JOIN users u ON f.friend_id = u.id
    WHERE f.user_id = ? AND f.status = 'accepted'
  `, [req.userId], (err, friends) => {
    if (err) return res.status(500).json({ message: '获取失败' });
    res.json(friends);
  });
});

// 获取待处理请求
router.get('/pending', auth, (req, res) => {
  db.all(`
    SELECT u.id, u.username, u.nickname, u.avatar, f.created_at
    FROM friendships f
    JOIN users u ON f.user_id = u.id
    WHERE f.friend_id = ? AND f.status = 'pending'
  `, [req.userId], (err, requests) => {
    if (err) return res.status(500).json({ message: '获取失败' });
    res.json(requests);
  });
});

module.exports = router;
