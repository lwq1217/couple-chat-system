const express = require('express');
const db = require('../models/db');
const auth = require('../middleware/auth');
const router = express.Router();

// 发布朋友圈
router.post('/', auth, (req, res) => {
  const { content, images } = req.body;
  db.run(
    'INSERT INTO moments (user_id, content, images) VALUES (?, ?, ?)',
    [req.userId, content, images ? JSON.stringify(images) : null],
    function(err) {
      if (err) return res.status(500).json({ message: '发布失败' });
      res.json({ id: this.lastID, message: '发布成功' });
    }
  );
});

// 获取朋友圈（自己和好友的）
router.get('/', auth, (req, res) => {
  db.all(`
    SELECT m.*, u.nickname, u.avatar,
      (SELECT COUNT(*) FROM moment_likes WHERE moment_id = m.id) as like_count,
      (SELECT COUNT(*) FROM moment_comments WHERE moment_id = m.id) as comment_count
    FROM moments m
    JOIN users u ON m.user_id = u.id
    WHERE m.user_id = ? OR m.user_id IN (
      SELECT friend_id FROM friendships WHERE user_id = ? AND status = 'accepted'
    )
    ORDER BY m.created_at DESC
  `, [req.userId, req.userId], (err, moments) => {
    if (err) return res.status(500).json({ message: '获取失败' });
    res.json(moments);
  });
});

// 点赞
router.post('/:id/like', auth, (req, res) => {
  db.run(
    'INSERT OR IGNORE INTO moment_likes (moment_id, user_id) VALUES (?, ?)',
    [req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ message: '点赞失败' });
      res.json({ message: '点赞成功' });
    }
  );
});

// 取消点赞
router.delete('/:id/like', auth, (req, res) => {
  db.run(
    'DELETE FROM moment_likes WHERE moment_id = ? AND user_id = ?',
    [req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ message: '取消失败' });
      res.json({ message: '取消点赞' });
    }
  );
});

// 评论
router.post('/:id/comment', auth, (req, res) => {
  const { content } = req.body;
  db.run(
    'INSERT INTO moment_comments (moment_id, user_id, content) VALUES (?, ?, ?)',
    [req.params.id, req.userId, content],
    function(err) {
      if (err) return res.status(500).json({ message: '评论失败' });
      res.json({ id: this.lastID, message: '评论成功' });
    }
  );
});

// 获取评论
router.get('/:id/comments', auth, (req, res) => {
  db.all(`
    SELECT c.*, u.nickname, u.avatar
    FROM moment_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.moment_id = ?
    ORDER BY c.created_at ASC
  `, [req.params.id], (err, comments) => {
    if (err) return res.status(500).json({ message: '获取失败' });
    res.json(comments);
  });
});

module.exports = router;
