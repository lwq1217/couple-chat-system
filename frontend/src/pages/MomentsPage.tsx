import { useEffect, useState } from 'react'
import { Heart, MessageCircle, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, formatTime } from '../utils/api'
import { useAuth } from '../context/AuthContext'

interface Moment {
  id: number
  user_id: number
  content: string
  images: string
  nickname: string
  avatar: string
  like_count: number
  comment_count: number
  created_at: string
}

interface Comment {
  id: number
  nickname: string
  content: string
  created_at: string
}

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>([])
  const [newContent, setNewContent] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [showComments, setShowComments] = useState<number | null>(null)
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => { loadMoments() }, [])

  const loadMoments = async () => {
    try {
      const res = await api.get('/moments')
      setMoments(res.data)
    } catch (e) {
      console.error('加载朋友圈失败', e)
    }
  }

  const handlePost = async () => {
    if (!newContent.trim()) return
    try {
      await api.post('/moments', { content: newContent })
      setNewContent('')
      setShowInput(false)
      loadMoments()
    } catch (e) {
      alert('发布失败')
    }
  }

  const toggleLike = async (momentId: number) => {
    try {
      await api.post(`/moments/${momentId}/like`)
      loadMoments()
    } catch (e) {}
  }

  const loadComments = async (momentId: number) => {
    try {
      const res = await api.get(`/moments/${momentId}/comments`)
      setComments(res.data)
      setShowComments(momentId)
    } catch (e) {}
  }

  const postComment = async (momentId: number) => {
    const content = commentInputs[momentId]
    if (!content?.trim()) return
    try {
      await api.post(`/moments/${momentId}/comment`, { content })
      setCommentInputs(prev => ({ ...prev, [momentId]: '' }))
      loadComments(momentId)
      loadMoments()
    } catch (e) {}
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">朋友圈 🌸</h1>
            <p className="text-sm text-gray-500">分享你们的甜蜜瞬间</p>
          </div>
          <button
            onClick={() => setShowInput(!showInput)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-love-pink to-love-rose flex items-center justify-center text-white shadow-lg shadow-love-pink/30 hover:scale-105 transition-transform"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3"
            >
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="分享今天的甜蜜..."
                className="w-full p-3 rounded-xl bg-white/70 border border-gray-100 focus:border-love-pink focus:ring-2 focus:ring-love-pink/20 outline-none text-sm resize-none h-24"
              />
              <div className="flex justify-end mt-2">
                <button onClick={handlePost} className="love-btn px-4 py-2 text-sm">
                  发布
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
        {moments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>还没有动态，发布第一条朋友圈吧~</p>
          </div>
        ) : (
          moments.map((moment, index) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-love-peach to-love-pink flex items-center justify-center text-white font-bold">
                  {moment.nickname?.[0] || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{moment.nickname}</p>
                  <p className="text-xs text-gray-400">{formatTime(moment.created_at)}</p>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-3 leading-relaxed">{moment.content}</p>

              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <button
                  onClick={() => toggleLike(moment.id)}
                  className="flex items-center gap-1 hover:text-love-pink transition-colors"
                >
                  <Heart size={16} /> {moment.like_count}
                </button>
                <button
                  onClick={() => loadComments(moment.id)}
                  className="flex items-center gap-1 hover:text-love-pink transition-colors"
                >
                  <MessageCircle size={16} /> {moment.comment_count}
                </button>
              </div>

              <AnimatePresence>
                {showComments === moment.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-gray-100"
                  >
                    <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                      {comments.length === 0 ? (
                        <p className="text-sm text-gray-400">暂无评论</p>
                      ) : (
                        comments.map((c: Comment) => (
                          <div key={c.id} className="text-sm">
                            <span className="font-medium text-love-pink">{c.nickname}:</span>
                            <span className="text-gray-600 ml-1">{c.content}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInputs[moment.id] || ''}
                        onChange={(e) =>
                          setCommentInputs(prev => ({ ...prev, [moment.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === 'Enter' && postComment(moment.id)}
                        placeholder="评论..."
                        className="flex-1 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-sm outline-none focus:border-love-pink"
                      />
                      <button
                        onClick={() => postComment(moment.id)}
                        className="text-love-pink text-sm font-medium px-2"
                      >
                        发送
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
