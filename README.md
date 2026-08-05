# 💕 恋爱聊天系统 (Couple Chat System)

一个专为情侣打造的私密聊天系统，支持实时消息、语音/视频通话、朋友圈、文件传输等功能。界面温馨浪漫，属于两个人的小世界。

## ✨ 功能特性

| 功能 | 状态 | 说明 |
|------|------|------|
| 用户注册/登录 | ✅ | JWT Token 认证 |
| 添加好友 | ✅ | 发送/接受好友请求 |
| 实时文字聊天 | ✅ | Socket.io 实时推送 |
| 表情包 | ✅ | emoji-picker-react |
| 图片发送 | ✅ | 支持预览 |
| 文件传输 | ✅ | 任意文件类型 |
| 语音通话 | ✅ | WebRTC P2P |
| 视频通话 | ✅ | WebRTC P2P |
| 朋友圈 | ✅ | 发布/点赞/评论 |
| 个人资料 | ✅ | 8个字段可编辑 |
| 未读消息提醒 | ✅ | 实时红点提示 |
| 温馨主题 UI | ✅ | 粉色恋爱风格 |

## 🛠 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Socket.io-client + Framer Motion
- **后端**: Node.js + Express + Socket.io + SQLite3 + Multer
- **实时通信**: Socket.io (文字) + WebRTC (音视频)
- **部署**: Railway (后端) + Vercel (前端)

## 📁 项目结构

```
couple-chat-system/
├── backend/                    # 后端服务
│   ├── server.js              # 主服务器 + Socket.io + WebRTC 信令
│   ├── package.json           # 后端依赖
│   ├── .env                   # 环境变量
│   ├── models/
│   │   └── db.js              # SQLite 数据库初始化 (8张表)
│   ├── middleware/
│   │   └── auth.js            # JWT 认证中间件
│   ├── routes/
│   │   ├── users.js           # 登录/注册/搜索/资料
│   │   ├── friends.js         # 好友系统
│   │   ├── messages.js        # 消息记录
│   │   ├── moments.js         # 朋友圈
│   │   └── calls.js           # 通话记录
│   └── uploads/               # 文件上传目录
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── main.tsx           # 入口
│   │   ├── App.tsx            # 路由配置
│   │   ├── index.css          # 全局样式 + Tailwind
│   │   ├── utils/
│   │   │   └── api.ts         # Axios 封装 + 工具函数
│   │   ├── context/
│   │   │   └── AuthContext.tsx # 用户认证上下文
│   │   ├── hooks/
│   │   │   └── useSocket.ts   # Socket.io Hook
│   │   ├── components/
│   │   │   └── CallModal.tsx  # 通话弹窗组件
│   │   └── pages/
│   │       ├── LoginPage.tsx      # 登录页
│   │       ├── RegisterPage.tsx   # 注册页
│   │       ├── MainLayout.tsx     # 主布局 (底部导航)
│   │       ├── ChatPage.tsx       # 消息列表
│   │       ├── ChatRoom.tsx       # 聊天室
│   │       ├── FriendsPage.tsx    # 好友页
│   │       ├── MomentsPage.tsx    # 朋友圈
│   │       └── ProfilePage.tsx    # 个人中心
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## 🚀 本地开发

### 环境要求
- Node.js >= 18
- npm >= 9

### 1. 克隆项目
```bash
git clone https://github.com/你的用户名/couple-chat-system.git
cd couple-chat-system
```

### 2. 启动后端
```bash
cd backend
npm install
npm start
```
后端运行在 `http://localhost:3001`

### 3. 启动前端
```bash
cd frontend
npm install
npm run dev
```
前端运行在 `http://localhost:5173`

打开浏览器访问 `http://localhost:5173` 即可使用！

## 🌐 部署到线上

### 第一步：上传到 GitHub

```bash
# 在项目根目录执行
git init
git add .
git commit -m "init: couple chat system"

# 在 GitHub 创建新仓库 (不要初始化 README)
# 然后执行：
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

### 第二步：部署后端到 Railway

1. 访问 [railway.app](https://railway.app) 用 GitHub 账号登录
2. 点击 **"New Project"** → **"Deploy from GitHub repo"**
3. 选择你的仓库，Railway 会自动识别 `backend/package.json`
4. 点击项目 → **"Settings"** → **"Environment"** 添加变量：
   - `JWT_SECRET` = `your-super-secret-love-key-2024-change-me`
   - `NODE_ENV` = `production`
5. 点击 **"Settings"** → **"Networking"** → 打开 **"Public Networking"**
6. 你会得到一个类似 `https://couple-chat.up.railway.app` 的域名
7. **复制这个域名，下一步要用！**

### 第三步：修改前端 API 地址

修改 `frontend/src/utils/api.ts`：
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'https://你的railway域名';
```

修改 `frontend/src/hooks/useSocket.ts`：
```typescript
export const getSocketUrl = () => {
  return import.meta.env.VITE_SOCKET_URL || 'https://你的railway域名';
};
```

提交修改：
```bash
git add .
git commit -m "update: production api url"
git push
```

### 第四步：部署前端到 Vercel

1. 访问 [vercel.com](https://vercel.com) 用 GitHub 登录
2. **"Add New Project"** → 导入你的仓库
3. 配置：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. 在 **Environment Variables** 添加：
   - `VITE_API_URL` = `https://你的railway域名`
   - `VITE_SOCKET_URL` = `https://你的railway域名`
5. 点击 **Deploy**，等待完成即可获得前端域名！

### 第五步：配置 CORS（重要！）

如果前端访问后端出现跨域错误，修改 `backend/server.js` 中的 CORS 配置：
```javascript
app.use(cors({
  origin: ['https://你的vercel域名', 'http://localhost:5173'],
  credentials: true
}));
```

重新提交并部署后端。

## ⚠️ 注意事项

### 1. WebRTC 通话
- **本地测试**：同一局域网内可直接通话
- **公网部署**：需要 TURN 服务器。免费方案：
  - [Twilio Network Traversal](https://www.twilio.com/stun-turn)
  - [Metered TURN](https://www.metered.ca/tools/openrelay/)
  - 自建 Coturn 服务器
- 在 `CallModal.tsx` 的 `config` 中添加 TURN 配置即可

### 2. 文件存储
- Railway 的文件系统是**临时**的，重启后上传的文件会丢失
- **解决方案**：
  - 使用 AWS S3 / 阿里云 OSS / Cloudinary
  - 或使用 Railway Volume（付费）
  - 或使用 Supabase Storage（免费额度足够）

### 3. 数据库
- 当前使用 SQLite，适合小项目（< 10万用户）
- 用户量大时迁移到 PostgreSQL：
  ```bash
  # Railway 支持一键添加 PostgreSQL
  # 修改 backend/models/db.js 使用 pg 模块即可
  ```

### 4. HTTPS 要求
- WebRTC 要求页面必须通过 HTTPS 访问
- Vercel 和 Railway 都自动提供 HTTPS，无需额外配置

### 5. 环境变量安全
- **永远不要**把 `.env` 提交到 GitHub
- 生产环境的 `JWT_SECRET` 必须是随机长字符串
- 定期更换 JWT_SECRET 并重新登录

### 6. 移动端适配
- 当前设计为移动端优先（max-width: 512px）
- 在 PC 浏览器中按 F12 → 切换到手机模式体验最佳
- 如需 PC 版，修改 `MainLayout.tsx` 中的 `max-w-lg` 为更大值

### 7. 消息持久化
- 消息存储在 SQLite 中，重启不会丢失
- 建议定期备份数据库文件

## 🔧 常见问题

**Q: 注册时提示 "用户名已存在"？**
A: 用户名全局唯一，换一个试试。

**Q: 消息发送了但对方收不到？**
A: 检查 Socket.io 连接状态，确保两人都在线。刷新页面重试。

**Q: 视频通话黑屏？**
A: 确保使用 HTTPS，且浏览器允许摄像头权限。

**Q: Railway 部署后数据库数据丢失？**
A: Railway 每次部署会重新构建容器。需要配置 Volume 或迁移到 PostgreSQL。

## 📄 License

MIT License - 自由使用，欢迎 Star ⭐

---

Made with 💕 for couples
