import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('两次密码不一致')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/users/register', { username, password, nickname })
      login(res.data.token, {
        id: res.data.userId,
        username: res.data.username,
        nickname: res.data.nickname,
        avatar: '/default-avatar.png'
      })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败')
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
        <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-love-pink mb-4">
          <ArrowLeft size={18} className="mr-1" /> 返回登录
        </Link>

        <div className="text-center mb-8">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-block"
          >
            <Heart className="w-16 h-16 text-love-rose mx-auto mb-4" fill="#FF8FAB" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">加入我们 💕</h1>
          <p className="text-gray-500">创建属于你们的小世界</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-love-pink focus:ring-2 focus:ring-love-pink/20 outline-none transition-all"
              placeholder="设置用户名"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-love-pink focus:ring-2 focus:ring-love-pink/20 outline-none transition-all"
              placeholder="设置昵称"
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
                placeholder="设置密码"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-love-pink focus:ring-2 focus:ring-love-pink/20 outline-none transition-all"
              placeholder="再次输入密码"
              required
            />
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
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500">
          已有账号？{' '}
          <Link to="/login" className="text-love-pink font-medium hover:underline">
            立即登录
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
