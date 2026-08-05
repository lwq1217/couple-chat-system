require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('./models/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

// 路由
app.use('/api/users', require('./routes/users'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/moments', require('./routes/moments'));
app.use('/api/calls', require('./routes/calls'));

// 文件上传接口
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: '没有文件' });
  res.json({ 
    url: `/uploads/${req.file.filename}`, 
    name: req.file.originalname,
    size: req.file.size 
  });
});

// 在线用户映射
const onlineUsers = new Map();

// Socket.io 实时通信
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 用户上线
  socket.on('user_online', ({ userId }) => {
    onlineUsers.set(String(userId), socket.id);
    socket.userId = userId;
    console.log(`用户 ${userId} 上线`);
    // 通知好友上线状态
    io.emit('user_status', { userId: String(userId), status: 'online' });
  });

  // 发送消息
  socket.on('send_message', (data) => {
    const { senderId, receiverId, content, type, fileUrl, fileName } = data;
    db.run(
      'INSERT INTO messages (sender_id, receiver_id, content, type, file_url, file_name) VALUES (?, ?, ?, ?, ?, ?)',
      [senderId, receiverId, content, type || 'text', fileUrl || null, fileName || null],
      function(err) {
        if (err) {
          socket.emit('message_error', { message: '发送失败' });
          return;
        }
        const messageData = {
          id: this.lastID,
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          type: type || 'text',
          file_url: fileUrl,
          file_name: fileName,
          created_at: new Date().toISOString(),
          is_read: 0
        };
        // 发送给接收者
        const receiverSocket = onlineUsers.get(String(receiverId));
        if (receiverSocket) {
          io.to(receiverSocket).emit('receive_message', messageData);
        }
        // 确认发送成功
        socket.emit('message_sent', messageData);
      }
    );
  });

  // 正在输入
  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(String(receiverId));
    if (receiverSocket) {
      io.to(receiverSocket).emit('typing', { senderId });
    }
  });

  socket.on('stop_typing', ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(String(receiverId));
    if (receiverSocket) {
      io.to(receiverSocket).emit('stop_typing', { senderId });
    }
  });

  // 语音/视频通话信令
  socket.on('call_offer', ({ callerId, receiverId, type, offer }) => {
    const receiverSocket = onlineUsers.get(String(receiverId));
    if (receiverSocket) {
      io.to(receiverSocket).emit('call_offer', { callerId, type, offer });
    } else {
      socket.emit('call_failed', { message: '对方不在线' });
    }
  });

  socket.on('call_answer', ({ callerId, answer }) => {
    const callerSocket = onlineUsers.get(String(callerId));
    if (callerSocket) {
      io.to(callerSocket).emit('call_answer', { answer });
    }
  });

  socket.on('call_ice_candidate', ({ targetId, candidate }) => {
    const targetSocket = onlineUsers.get(String(targetId));
    if (targetSocket) {
      io.to(targetSocket).emit('call_ice_candidate', { candidate });
    }
  });

  socket.on('call_end', ({ targetId }) => {
    const targetSocket = onlineUsers.get(String(targetId));
    if (targetSocket) {
      io.to(targetSocket).emit('call_end');
    }
  });

  socket.on('call_reject', ({ callerId }) => {
    const callerSocket = onlineUsers.get(String(callerId));
    if (callerSocket) {
      io.to(callerSocket).emit('call_rejected');
    }
  });

  // 断开连接
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(String(socket.userId));
      io.emit('user_status', { userId: String(socket.userId), status: 'offline' });
      console.log(`用户 ${socket.userId} 下线`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ 恋爱聊天服务器运行在端口 ${PORT}`);
  console.log(`📡 WebSocket 服务已启动`);
});
