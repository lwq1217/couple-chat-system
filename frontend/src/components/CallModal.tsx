import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../hooks/useSocket'

interface CallModalProps {
  isOpen: boolean
  onClose: () => void
  callType: 'voice' | 'video'
  friendId: number
  friendName: string
  incomingCall?: { callerId: number, type: string, offer: any } | null
}

export default function CallModal({ isOpen, onClose, callType, friendId, friendName, incomingCall }: CallModalProps) {
  const { user } = useAuth()
  const { socket, sendCallOffer, sendCallAnswer, sendIceCandidate, endCall, rejectCall } = useSocket(user?.id)
  const [callState, setCallState] = useState<'calling' | 'connected' | 'ended'>('calling')
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:global.relay.metered.ca:80',
        username: 'e3e8c5d4e4f8c5d4e4f8c5d4',
        credential: 'e3e8c5d4e4f8c5d4'
      },
      {
        urls: 'turn:global.relay.metered.ca:80?transport=tcp',
        username: 'e3e8c5d4e4f8c5d4e4f8c5d4',
        credential: 'e3e8c5d4e4f8c5d4'
      },
      {
        urls: 'turn:global.relay.metered.ca:443',
        username: 'e3e8c5d4e4f8c5d4e4f8c5d4',
        credential: 'e3e8c5d4e4f8c5d4'
      },
      {
        urls: 'turns:global.relay.metered.ca:443?transport=tcp',
        username: 'e3e8c5d4e4f8c5d4e4f8c5d4',
        credential: 'e3e8c5d4e4f8c5d4'
      }
    ]
  }

  useEffect(() => {
    if (!isOpen || !socket) return

    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video'
        })
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        const pc = new RTCPeerConnection(config)
        peerConnectionRef.current = pc

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream)
        })

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0]
          }
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendIceCandidate({ targetId: friendId, candidate: event.candidate })
          }
        }

        // 如果是被动接听（收到对方呼叫）
        if (incomingCall && incomingCall.offer) {
          setCallState('calling')
          await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          sendCallAnswer({ callerId: incomingCall.callerId, answer })
        } else {
          // 主动呼叫
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          sendCallOffer({ callerId: user?.id, receiverId: friendId, type: callType, offer })
        }
      } catch (err) {
        console.error('获取媒体失败:', err)
        alert('无法访问摄像头/麦克风')
        onClose()
      }
    }

    initCall()

    const handleAnswer = async ({ answer }: any) => {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer))
      setCallState('connected')
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
    }

    const handleIceCandidate = async ({ candidate }: any) => {
      await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate))
    }

    const handleEnd = () => {
      endCurrentCall()
    }

    const handleReject = () => {
      alert('对方拒绝了通话')
      endCurrentCall()
    }

    socket.on('call_answer', handleAnswer)
    socket.on('call_ice_candidate', handleIceCandidate)
    socket.on('call_end', handleEnd)
    socket.on('call_rejected', handleReject)

    return () => {
      endCurrentCall()
      socket.off('call_answer', handleAnswer)
      socket.off('call_ice_candidate', handleIceCandidate)
      socket.off('call_end', handleEnd)
      socket.off('call_rejected', handleReject)
    }
  }, [isOpen, socket, callType, friendId, incomingCall])

  const endCurrentCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    localStreamRef.current?.getTracks().forEach(track => track.stop())
    peerConnectionRef.current?.close()
    setCallState('ended')
    setTimeout(onClose, 1500)
  }, [onClose])

  const handleEndCall = () => {
    endCall({ targetId: friendId })
    endCurrentCall()
  }

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled
    })
    setIsVideoOff(!isVideoOff)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center"
      >
        {callType === 'video' && callState === 'connected' && (
          <div className="absolute inset-0">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-24 right-4 w-32 h-40 rounded-xl overflow-hidden border-2 border-white/30">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {callType === 'video' && callState !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-50" />
          </div>
        )}

        <div className="relative z-10 text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-love-pink to-love-rose flex items-center justify-center mx-auto mb-6"
          >
            {callType === 'voice' ? (
              <Phone className="w-10 h-10 text-white" />
            ) : (
              <Video className="w-10 h-10 text-white" />
            )}
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">{friendName}</h2>
          
          {callState === 'calling' && !incomingCall && (
            <p className="text-white/70 mb-8">正在呼叫...</p>
          )}
          
          {callState === 'calling' && incomingCall && (
            <p className="text-white/70 mb-8">来电中...</p>
          )}

          {callState === 'connected' && (
            <p className="text-white/70 mb-8 text-xl font-mono">{formatDuration(duration)}</p>
          )}

          {callState === 'ended' && (
            <p className="text-white/70 mb-8">通话结束</p>
          )}
        </div>

        <div className="relative z-10 flex items-center gap-6 mt-auto mb-12">
          {callState === 'connected' && (
            <>
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500' : 'bg-white/20'}`}
              >
                {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
              </button>
              
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500' : 'bg-white/20'}`}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
                </button>
              )}
            </>
          )}

          {incomingCall && callState === 'calling' && (
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setCallState('connected')
                  timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
                }}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
              >
                <Phone className="w-8 h-8 text-white" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  rejectCall({ callerId: incomingCall.callerId })
                  endCurrentCall()
                }}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </motion.button>
            </>
          )}

          {!incomingCall && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/50"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
