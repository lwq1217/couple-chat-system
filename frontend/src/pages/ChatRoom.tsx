import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Video, Image, Send, Smile, Paperclip, Mic, X, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker from 'emoji-picker-react'
import { api, formatTime } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../hooks/useSocket'
import CallModal from '../components/CallModal'

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  type: string
  file_url?: string
  file_name?: string
  created_at: string
  is_read: number
}

interface FriendInfo {
  id: number
  nickname: string
  username: string
  avatar: string
}

export default function ChatRoom() {
  const { friendId } = useParams<{ friendId: string }>
  const navigate = useNavigate()
  const { user } = useAuth()
  const friendIdNum = parseInt(friendId || '0')

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [friend, setFriend] = useState<FriendInfo | null>(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showCallModal, setShowCallModal] = useState(false)
  const [callType, setCallType] = useState<'voice' | 'video'>('voice')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { socket, sendMessage, sendTyping, stopTyping } = useSocket(user?.id)

  useEffect(() => {
    loadFriend()
    loadMessages()
  }, [friendId])

  useEffect(() => {
    if (!socket) return

    socket.on('receive_message', (msg: Message) => {
      if (msg.sender_id === friendIdNum || msg.receiver_id === friendIdNum) {
        setMessages(prev => [...prev, msg])
      }
    })

    socket.on('typing', ({ senderId }: { senderId: number }) => {
      if (senderId === friendIdNum) setIsTyping(true)
    })

    socket.on('stop_typing', ({ senderId }: { senderId: number }) => {
      if (senderId === friendIdNum) setIsTyping(false)
    })

    return () => {
      socket.off('receive_message')
      socket.off('typing')
      socket.off('stop_typing')
    }
  }, [socket, friendIdNum])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const loadFriend = async () => {
    try {
      const res = await api.get(`/users/search?q=${friendIdNum}`)
      if (res.data.length > 0) setFriend(res.data[0])
    } catch (e) {}
  }

  const loadMessages = async () => {
    try {
      const res = await api.get(`/messages/${friendIdNum}`)
      setMessages(res.data)
    } catch (e) {}
  }

  const handleSend = () => {
    if (!input.trim() || !user) return
    const msgData = {
      senderId: user.id,
      receiverId: friendIdNum,
      content: input.trim(),
      type: 'text'
    }
    sendMessage(msgData)
    setInput('')
    setShowEmoji(false)
    if (typingTimeout) clearTimeout(typingTimeout)
    stopTyping({ senderId: user.id, receiverId: friendIdNum })
  }

  const handleTyping = (value: string) => {
    setInput(value)
    if (!user) return
    sendTyping({ senderId: user.id, receiverId: friendIdNum })
    if (typingTimeout) clearTimeout(typingTimeout)
    const timeout = setTimeout(() => {
      stopTyping({ senderId: user.id, receiverId: friendIdNum })
    }, 2000)
    setTypingTimeout(timeout)
  }

  const handleEmojiSelect = (emojiData: any) => {
    setInput(prev => prev + emojiData.emoji)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const isImage = file.type.startsWith('image/')
      sendMessage({
        senderId: user.id,
        receiverId: friendIdNum,
        content: isImage ? '' : file.name,
        type: isImage ? 'image' : 'file',
        fileUrl: res.data.url,
        fileName: file.name
      })
    } catch (e) {
      alert('上传失败')
    }
  }

  const startCall = (type: 'voice' | 'video') => {
    setCallType(type)
    setShowCallModal(true)
  }

  const isMyMessage = (msg: Message) => msg.sender_id === user?.id

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-love-cream to-white">
      {/* 头部 */}
      <div className="glass-card mx-4 mt-4 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate('/chat')} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={22} className="text-gray-600" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-love-peach to-love-pink flex items-center justify-center text-white font-bold">
          {friend?.nickname?.[0] || friend?.username?.[0] || '?'}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-800">{friend?.nickname || friend?.username || '聊天中'}</h2>
          <AnimatePresence>
            {isTyping && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-love-pink"
              >
                正在输入...
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <button onClick={() => startCall('voice')} className="p-2 hover:bg-love-peach/30 rounded-full transition-colors">
          <Phone size={20} className="text-love-pink" />
        </button>
        <button onClick={() => startCall('video')} className="p-2 hover:bg-love-peach/30 rounded-full transition-colors">
          <Video size={20} className="text-love-pink" />
        </button>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, index) => {
          const myMsg = isMyMessage(msg)
          const showTime = index === 0 || 
            new Date(msg.created_at).getTime() - new Date(messages[index-1].created_at).getTime() > 300000

          return (
            <div key={msg.id}>
              {showTime && (
                <p className="text-center text-xs text-gray-400 my-3">{formatTime(msg.created_at)}</p>
              )}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${myMsg ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${myMsg ? 'chat-bubble-right' : 'chat-bubble-left'}`}>
                  {msg.type === 'image' && msg.file_url && (
                    <img 
                      src={msg.file_url} 
                      alt="图片" 
                      className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(msg.file_url, '_blank')}
                    />
                  )}
                  {msg.type === 'file' && (
                    <a 
                      href={msg.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm underline"
                    >
                      <Paperclip size={16} />
                      {msg.file_name || '文件'}
                    </a>
                  )}
                  {msg.type === 'text' && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="glass-card mx-4 mb-2 p-3">
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-2"
            >
              <EmojiPicker onEmojiClick={handleEmojiSelect} width="100%" height={300} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <button 
            onClick={() => setShowEmoji(!showEmoji)}
            className={`p-2 rounded-full transition-colors ${showEmoji ? 'bg-love-peach text-love-pink' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <Smile size={22} />
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <Image size={22} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入消息..."
              className="w-full px-4 py-2.5 rounded-full bg-gray-50 border border-gray-100 focus:border-love-pink focus:ring-2 focus:ring-love-pink/20 outline-none text-sm"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 bg-gradient-to-r from-love-pink to-love-rose text-white rounded-full shadow-lg shadow-love-pink/30 disabled:opacity-40 disabled:shadow-none"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>

      {/* 通话弹窗 */}
      <CallModal 
        isOpen={showCallModal} 
        onClose={() => setShowCallModal(false)}
        callType={callType}
        friendId={friendIdNum}
        friendName={friend?.nickname || friend?.username || ''}
      />
    </div>
  )
}
