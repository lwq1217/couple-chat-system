import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MessageCircle, Users, Image, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const navItems = [
    { path: '/chat', icon: MessageCircle, label: '聊天' },
    { path: '/friends', icon: Users, label: '好友' },
    { path: '/moments', icon: Image, label: '朋友圈' },
    { path: '/profile', icon: User, label: '我的' },
  ]

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white/50 backdrop-blur-sm shadow-2xl">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      <nav className="glass-card mx-4 mb-4 px-2 py-2 flex justify-around items-center z-50">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? 'active' : ''} px-3 py-1.5 rounded-xl transition-all ${isActive ? 'bg-love-peach/50' : ''}`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
