const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'couple_chat.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 用户表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    nickname TEXT,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT '/default-avatar.png',
    bio TEXT DEFAULT '',
    birthday TEXT DEFAULT '',
    location TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    love_quote TEXT DEFAULT '',
    anniversary TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 好友关系表
  db.run(`CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
  )`);

  // 消息表
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'text',
    file_url TEXT,
    file_name TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 朋友圈表
  db.run(`CREATE TABLE IF NOT EXISTS moments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT,
    images TEXT,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 朋友圈点赞表
  db.run(`CREATE TABLE IF NOT EXISTS moment_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(moment_id, user_id)
  )`);

  // 朋友圈评论表
  db.run(`CREATE TABLE IF NOT EXISTS moment_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 通话记录表
  db.run(`CREATE TABLE IF NOT EXISTS calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caller_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    type TEXT DEFAULT 'voice',
    status TEXT DEFAULT 'missed',
    duration INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('✅ 数据库初始化完成');
});

module.exports = db;
