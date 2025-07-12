import React, { useState, useEffect, useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

const Chat = () => {
  const { messages, sendMessage, joinRoom, isConnected, typingUsers, startTyping, stopTyping, socket } = useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('general');
  const [isTyping, setIsTyping] = useState(false);

  const handleJoinRoom = useCallback(() => {
    if (isConnected) {
      console.log('Chat component - joining room:', roomId);
      joinRoom(roomId);
    }
  }, [isConnected, roomId, joinRoom]);

  useEffect(() => {
    handleJoinRoom();
  }, [handleJoinRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;

    sendMessage({
      roomId,
      message: message.trim(),
      userId: user?.id,
      username: user?.username
    });
    setMessage('');
    setIsTyping(false);
    stopTyping();
  }, [message, isConnected, sendMessage, roomId, user, stopTyping]);

  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value);
    
    // Typing indicator
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      startTyping();
    } else if (isTyping && !e.target.value.trim()) {
      setIsTyping(false);
      stopTyping();
    }
  }, [isTyping, startTyping, stopTyping]);

  const handleRoomChange = useCallback((e) => {
    const newRoomId = e.target.value;
    setRoomId(newRoomId);
  }, []);

  const testWebSocket = useCallback(() => {
    console.log('Testing WebSocket connection...');
    console.log('Socket:', socket);
    console.log('Is connected:', isConnected);
    console.log('User:', user);
    
    if (socket) {
      socket.emit('test', { message: 'Hello from client!' });
    }
  }, [socket, isConnected, user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Chat Room</h1>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? '✅ Đã kết nối' : '⏳ Đang kết nối...'}
            </span>
            <select
              value={roomId}
              onChange={handleRoomChange}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              disabled={!isConnected}
            >
              <option value="general">General</option>
              <option value="random">Random</option>
              <option value="tech">Tech</option>
            </select>
            <button
              onClick={testWebSocket}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Test WS
            </button>
          </div>
        </div>

        <div 
          id="chat-messages"
          className="h-96 overflow-y-auto p-6 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>Chưa có tin nhắn nào</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.userId === user?.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {msg.username || 'Ẩn danh'}
                    {msg.timestamp && (
                      <span className="ml-2">
                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  <div>{msg.message}</div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
                {typingUsers.map(user => user.username).join(', ')} đang nhập...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200">
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected || !message.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              Gửi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat; 