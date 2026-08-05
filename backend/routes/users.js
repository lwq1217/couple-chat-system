const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const auth = require('../middleware/auth');
const router = express.Router();

// 注册
router.post('/register', (req, res) => {
  const { username, password, nickname } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码必填' });
  }
  const hashed = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
    [username, hashed, nickname || username],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ message: '用户名已存在' });
        }
        return res.status(500).json({ message: '注册失败' });
      }
      const token = jwt.sign({ userId: this.lastID, username }, process.env.JWT_SECRET);
      res.json({ token, userId: this.lastID, username, nickname: nickname || username });
    }
  );
});

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(400).json({ message: '用户名或密码错误' });
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET);
    res.json({
      token,
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar
    });
  });
});

// 获取当前用户信息
router.get('/me', auth, (req, res) => {
  db.get('SELECT id, username, nickname, avatar, bio, birthday, location, phone, email, love_quote, anniversary FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) return res.status(404).json({ message: '用户不存在' });
    res.json(user);
  });
});

// 更新用户信息
router.put('/profile', auth, (req, res) => {
  const { nickname, bio, birthday, location, phone, email, love_quote, anniversary } = req.body;
  db.run(
    `UPDATE users SET nickname = ?, bio = ?, birthday = ?, location = ?, phone = ?, email = ?, love_quote = ?, anniversary = ? WHERE id = ?`,
    [nickname, bio, birthday, location, phone, email, love_quote, anniversary, req.userId],
    function(err) {
      if (err) return res.status(500).json({ message: '更新失败' });
      res.json({ message: '更新成功' });
    }
  );
});

// 搜索用户
router.get('/search', auth, (req, res) => {
  const { q } = req.query;
  db.all(
    'SELECT id, username, nickname, avatar, bio FROM users WHERE (username LIKE ? OR nickname LIKE ?) AND id != ?',
    [`%${q}%`, `%${q}%`, req.userId],
    (err, users) => {
      if (err) return res.status(500).json({ message: '搜索失败' });
      res.json(users);
    }
  );
});

// 上传头像
router.post('/avatar', auth, (req, res) => {
  // 简化处理，实际使用multer
  res.json({ message: '头像上传功能需要在生产环境配置' });
});

module.exports = router;
