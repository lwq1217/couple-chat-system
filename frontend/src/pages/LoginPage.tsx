import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/users/login', { username, password })
      login(res.data.token, {
        id: res.data.userId,
        username: res.data.username,
        nickname: res.data.nickname,
        avatar: res.data.avatar
      })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block"
          >
            <Heart className="w-16 h-16 text-love-pink mx-auto mb-4" fill="#FF6B9D" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">欢迎回来 💕</h1>
          <p className="text-gray-500">登录进入你们的小世界</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-love-pink focus:ring-2 focus:ring-love-pink/20 outline-none transition-all"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-love-pink focus:ring-2 focus:ring-love-pink/20 outline-none transition-all pr-12"
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-love-pink"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full love-btn py-3.5 text-lg disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500">
          还没有账号？{' '}
          <Link to="/register" className="text-love-pink font-medium hover:underline">
            立即注册
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
