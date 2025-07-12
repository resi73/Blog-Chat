import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  // Kết nối WebSocket khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated && user && !socketRef.current) {
      console.log('Connecting to WebSocket...');
      console.log('User:', user);
      console.log('Token:', localStorage.getItem('token'));
      
      const newSocket = io('ws://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('✅ Đã kết nối WebSocket');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Đã ngắt kết nối WebSocket');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('receive-message', (message) => {
        console.log('📨 Nhận tin nhắn:', message);
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('user-typing', (data) => {
        console.log('⌨️ User typing:', data);
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, data];
        });

        // Xóa typing indicator sau 3 giây
        setTimeout(() => {
          setTypingUsers(prev => 
            prev.filter(u => u.userId !== data.userId)
          );
        }, 3000);
      });

      newSocket.on('user-joined', (data) => {
        console.log('👤 User joined:', data);
      });

      newSocket.on('test-response', (data) => {
        console.log('📨 Test response received:', data);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        console.log('Cleaning up WebSocket connection...');
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
      };
    } else if (!isAuthenticated || !user) {
      console.log('User not authenticated, not connecting to WebSocket');
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user?.id]); // Chỉ phụ thuộc vào user.id thay vì toàn bộ user object

  const joinRoom = useCallback((roomId) => {
    if (socket && isConnected) {
      console.log('Joining room:', roomId);
      socket.emit('join-room', roomId);
      setCurrentRoom(roomId);
      setMessages([]); // Clear messages when joining new room
    } else {
      console.log('Cannot join room - socket not connected');
    }
  }, [socket, isConnected]);

  const leaveRoom = useCallback(() => {
    if (socket && currentRoom) {
      console.log('Leaving room:', currentRoom);
      socket.emit('leave-room', currentRoom);
      setCurrentRoom(null);
      setMessages([]);
      setTypingUsers([]);
    }
  }, [socket, currentRoom]);

  const sendMessage = useCallback((messageData) => {
    if (socket && isConnected && currentRoom && user) {
      console.log('Sending message:', messageData);
      socket.emit('send-message', {
        roomId: currentRoom,
        userId: user.id,
        username: user.username,
        message: messageData.message
      });
      
      // Add message to local state immediately
      const newMessage = {
        id: Date.now(),
        userId: user.id,
        username: user.username,
        message: messageData.message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
    } else {
      console.log('Cannot send message - not connected or missing data');
    }
  }, [socket, isConnected, currentRoom, user]);

  const startTyping = useCallback(() => {
    if (socket && isConnected && currentRoom && user) {
      socket.emit('typing', {
        roomId: currentRoom,
        userId: user.id,
        username: user.username
      });
    }
  }, [socket, isConnected, currentRoom, user]);

  const stopTyping = useCallback(() => {
    if (socket && isConnected && currentRoom && user) {
      socket.emit('stop-typing', {
        roomId: currentRoom,
        userId: user.id,
        username: user.username
      });
    }
  }, [socket, isConnected, currentRoom, user]);

  const value = {
    socket,
    messages,
    typingUsers,
    currentRoom,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    setMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 