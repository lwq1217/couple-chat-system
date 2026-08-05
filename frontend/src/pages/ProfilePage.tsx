import { useEffect, useState } from 'react'
import { Heart, Calendar, MapPin, Phone, Mail, Quote, Edit2, LogOut, Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    try {
      const res = await api.get('/users/me')
      setProfile(res.data)
      setFormData(res.data)
    } catch (e) {
      console.error('加载资料失败', e)
    }
  }

  const handleSave = async () => {
    try {
      await api.put('/users/profile', formData)
      setIsEditing(false)
      loadProfile()
    } catch (e) {
      alert('保存失败')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!profile) {
    return (
      <div className="min-h-full flex items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-pink"></div>
      </div>
    )
  }

  const fields = [
    { key: 'nickname', label: '昵称', icon: Heart, placeholder: '设置一个甜蜜的昵称' },
    { key: 'bio', label: '个性签名', icon: Quote, placeholder: '写下你们的故事' },
    { key: 'birthday', label: '生日', icon: Calendar, type: 'date' },
    { key: 'location', label: '所在地', icon: MapPin, placeholder: '你们在哪里' },
    { key: 'phone', label: '电话', icon: Phone, placeholder: '联系方式' },
    { key: 'email', label: '邮箱', icon: Mail, placeholder: '邮箱地址' },
    { key: 'love_quote', label: '恋爱宣言', icon: Heart, placeholder: '一句甜蜜的话' },
    { key: 'anniversary', label: '纪念日', icon: Calendar, type: 'date' },
  ]

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="p-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">个人中心 👤</h1>
        <p className="text-sm text-gray-500">完善你们的恋爱档案</p>
      </div>

      <div className="px-4 pb-4 space-y-3">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-6 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-love-pink via-love-rose to-love-coral flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3 shadow-lg shadow-love-pink/30">
            {profile.nickname?.[0] || profile.username[0]}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{profile.nickname || profile.username}</h2>
          <p className="text-sm text-gray-500 mt-1">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-love-pink mt-2 italic">&ldquo;{profile.bio}&rdquo;</p>
          )}
        </motion.div>

        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
              >
                <X size={16} /> 取消
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 love-btn text-sm"
              >
                <Save size={16} /> 保存
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 love-btn-outline text-sm"
            >
              <Edit2 size={16} /> 编辑资料
            </button>
          )}
        </div>

        <div className="glass-card p-4 space-y-4">
          {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
            <div key={key} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-love-peach/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={16} className="text-love-pink" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                {isEditing ? (
                  <input
                    type={type || 'text'}
                    value={formData[key] || ''}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm outline-none focus:border-love-pink focus:ring-2 focus:ring-love-pink/20 transition-all"
                  />
                ) : (
                  <p className="text-sm text-gray-700">
                    {profile[key] || <span className="text-gray-300">未设置</span>}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl bg-red-50 text-red-500 font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> 退出登录
        </button>
      </div>
    </div>
  )
}
