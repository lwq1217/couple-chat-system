import { useEffect, useState } from 'react'
import { Search, UserPlus, Check, X, UserCheck, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

interface Friend {
  id: number
  username: string
  nickname: string
  avatar: string
  bio: string
}

interface PendingRequest {
  id: number
  username: string
  nickname: string
  avatar: string
  created_at: string
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Friend[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends')
  const { user } = useAuth()

  useEffect(() => {
    loadFriends()
    loadPendingRequests()
  }, [])

  const loadFriends = async () => {
    try {
      const res = await api.get('/friends/list')
      setFriends(res.data)
    } catch (e) {}
  }

  const loadPendingRequests = async () => {
    try {
      const res = await api.get('/friends/pending')
      setPendingRequests(res.data)
    } catch (e) {}
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const res = await api.get(`/users/search?q=${searchQuery}`)
      setSearchResults(res.data)
    } catch (e) {}
  }

  const sendRequest = async (friendId: number) => {
    try {
      await api.post('/friends/request', { friendId })
      alert('好友请求已发送')
      setSearchResults(prev => prev.filter(f => f.id !== friendId))
    } catch (e: any) {
      alert(e.response?.data?.message || '发送失败')
    }
  }

  const acceptRequest = async (friendId: number) => {
    try {
      await api.post('/friends/accept', { friendId })
      loadFriends()
      loadPendingRequests()
    } catch (e) {}
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">好友 💑</h1>
            <p className="text-sm text-gray-500">{friends.length} 位好友</p>
          </div>
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-love-pink to-love-rose flex items-center justify-center text-white shadow-lg shadow-love-pink/30"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索框 */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="搜索用户名或昵称..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-gray-100 focus:border-love-pink focus:ring-2 focus:ring-love-pink/20 outline-none text-sm"
                  />
                </div>
                <button onClick={handleSearch} className="love-btn px-4">搜索</button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 space-y-2">
                  {searchResults.map(result => (
                    <div key={result.id} className="glass-card p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-love-peach to-love-pink flex items-center justify-center text-white font-bold">
                        {result.nickname?.[0] || result.username[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{result.nickname || result.username}</p>
                        <p className="text-xs text-gray-500">{result.bio || '暂无简介'}</p>
                      </div>
                      <button 
                        onClick={() => sendRequest(result.id)}
                        className="love-btn-outline px-3 py-1.5 text-sm"
                      >
                        添加
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 标签页 */}
        <div className="flex gap-1 bg-white/50 rounded-xl p-1 mb-3">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'friends' ? 'bg-white shadow-sm text-love-pink' : 'text-gray-500'}`}
          >
            我的好友
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-white shadow-sm text-love-pink' : 'text-gray-500'}`}
          >
            好友请求 {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto px-4 pb-2">
        {activeTab === 'friends' ? (
          friends.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>还没有好友，快去添加TA吧~</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend, index) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-3 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-love-peach to-love-pink flex items-center justify-center text-white font-bold text-lg">
                    {friend.nickname?.[0] || friend.username[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{friend.nickname || friend.username}</p>
                    <p className="text-sm text-gray-500">{friend.bio || '暂无简介'}</p>
                  </div>
                  <UserCheck className="w-5 h-5 text-love-pink" />
                </motion.div>
              ))}
            </div>
          )
        ) : (
          pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>没有待处理的好友请求</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-3 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-love-peach to-love-pink flex items-center justify-center text-white font-bold text-lg">
                    {req.nickname?.[0] || req.username[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{req.nickname || req.username}</p>
                    <p className="text-xs text-gray-500">请求添加你为好友</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => acceptRequest(req.id)}
                      className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
