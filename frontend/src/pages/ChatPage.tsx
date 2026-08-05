import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MessageSquare, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { formatTime } from '../utils/api'

interface Friend {
  id: number
  username: string
  nickname: string
  avatar: string
  bio: string
}

interface LastMessage {
  content: string
  created_at: string
  type: string
  file_name?: string
}

export default function ChatPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [lastMessages, setLastMessages] = useState<Record<number, LastMessage>>({})
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    loadFriends()
    loadUnreadCounts()
    const interval = setInterval(loadUnreadCounts, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadFriends = async () => {
    try {
      const res = await api.get('/friends/list')
      setFriends(res.data)
      // 加载每个好友的最后一条消息
      res.data.forEach(async (friend: Friend) => {
        try {
          const msgRes = await api.get(`/messages/${friend.id}`)
          const msgs = msgRes.data
          if (msgs.length > 0) {
            setLastMessages(prev => ({ ...prev, [friend.id]: msgs[msgs.length - 1] }))
          }
        } catch (e) {}
      })
    } catch (e) {}
  }

  const loadUnreadCounts = async () => {
    try {
      const res = await api.get('/messages/unread/count')
      setUnreadCounts(res.data)
    } catch (e) {}
  }

  const filteredFriends = friends.filter(f => 
    f.nickname?.includes(searchQuery) || f.username?.includes(searchQuery)
  )

  const getMessagePreview = (msg: LastMessage | undefined) => {
    if (!msg) return '暂无消息'
    if (msg.type === 'image') return '[图片]'
    if (msg.type === 'file') return `[文件] ${msg.file_name || ''}`
    if (msg.type === 'voice') return '[语音]'
    return msg.content
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">消息 💌</h1>
            <p className="text-sm text-gray-500">和TA的甜蜜时光</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-love-pink to-love-rose flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* 搜索 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索好友..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-gray-100 focus:border-love-pink focus:ring-2 focus:ring-love-pink/20 outline-none text-sm"
          />
        </div>
      </div>

      {/* 好友列表 */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {filteredFriends.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>还没有好友，去添加一个吧~</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFriends.map((friend, index) => {
              const lastMsg = lastMessages[friend.id]
              const unread = unreadCounts[friend.id] || 0
              return (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/chat/${friend.id}`)}
                  className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-love-peach to-love-pink flex items-center justify-center text-white font-bold text-lg">
                      {friend.nickname?.[0] || friend.username[0]}
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-love-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-medium text-gray-800 truncate">{friend.nickname || friend.username}</h3>
                      {lastMsg && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTime(lastMsg.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {getMessagePreview(lastMsg)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
