import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '../utils/api';

export const useSocket = (userId: number | undefined) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const socket = io(getSocketUrl());
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('user_online', { userId });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const sendMessage = useCallback((data: any) => {
    socketRef.current?.emit('send_message', data);
  }, []);

  const sendTyping = useCallback((data: any) => {
    socketRef.current?.emit('typing', data);
  }, []);

  const stopTyping = useCallback((data: any) => {
    socketRef.current?.emit('stop_typing', data);
  }, []);

  const sendCallOffer = useCallback((data: any) => {
    socketRef.current?.emit('call_offer', data);
  }, []);

  const sendCallAnswer = useCallback((data: any) => {
    socketRef.current?.emit('call_answer', data);
  }, []);

  const sendIceCandidate = useCallback((data: any) => {
    socketRef.current?.emit('call_ice_candidate', data);
  }, []);

  const endCall = useCallback((data: any) => {
    socketRef.current?.emit('call_end', data);
  }, []);

  const rejectCall = useCallback((data: any) => {
    socketRef.current?.emit('call_reject', data);
  }, []);

  return {
    socket: socketRef.current,
    connected,
    sendMessage,
    sendTyping,
    stopTyping,
    sendCallOffer,
    sendCallAnswer,
    sendIceCandidate,
    endCall,
    rejectCall,
  };
};
