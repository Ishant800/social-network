import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import {
  UserPlus,
  Send,
  History,
  Copy,
  Check,
  X,
  Clock,
  MessageCircle,
  Menu,
} from 'lucide-react';
import API from '../../api/axios';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL, { autoConnect: false });

const DiscussionRoom = () => {
  const { blogId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [blog, setBlog] = useState(null);
  const [loadingBlog, setLoadingBlog] = useState(true);

  const [chatHistory, setChatHistory] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get user color based on ID
  const getUserColor = (userId) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    if (!userId) return colors[0];
    const index = userId.toString().length % colors.length;
    return colors[index];
  };

  const userColor = getUserColor(user?._id);

  // Fetch blog details
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoadingBlog(true);
        const response = await API.get(`/blog/blog-details/${blogId}`);
        if (response.data.success) {
          setBlog(response.data.blog);
        }
      } catch (error) {
        console.error('Error fetching blog:', error.response?.data || error.message);
      } finally {
        setLoadingBlog(false);
      }
    };
    if (blogId) fetchBlog();
  }, [blogId]);

  const blogTitle = blog?.title || 'Discussion Room';
  const blogCategory = blog?.category?.name;
  const blogReadTime = blog?.readTime;

  // Get author info from blog
  const authorInfo = {
    name: blog?.author?.username || blog?.author?.name || 'Anonymous Author',
    role: blog?.author?.role || 'Author',
    bio: blog?.author?.bio || 'Passionate writer sharing insights with the community.',
    avatar: blog?.author?.avatar || blog?.author?.profileImage?.url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(blog?.author?.username || 'Author')}&background=3b82f6&color=ffffff`,
    id: blog?.author?._id,
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Socket connection
  useEffect(() => {
    if (!blogId || !user?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    setIsConnected(socket.connected);

    socket.emit('join_room', {
      blogId,
      user: {
        _id: user._id,
        username: user.username || user.name,
        avatar: user.avatar || user.profileImage?.url,
        role: user.role || 'Member',
      },
    });

    const handleLoadMessages = (messages) => {
      const formatted = messages.map((msg) => ({
        id: msg._id?.toString() || msg.id,
        author: msg.user?.username || msg.author || 'Anonymous',
        role: msg.user?.role || msg.role || 'Member',
        avatar: msg.user?.avatar || msg.avatar,
        text: msg.content || msg.text,
        time: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userId: msg.user?._id || msg.userId,
      }));
      setChatHistory(formatted);
    };

    const handleReceiveMessage = (newMessage) => {
      const formatted = {
        id: newMessage.id?.toString() || newMessage._id?.toString() || Date.now().toString(),
        author: newMessage.author || newMessage.user?.username || 'Unknown',
        role: newMessage.role || newMessage.user?.role || 'Member',
        avatar: newMessage.avatar || newMessage.user?.avatar,
        text: newMessage.text || newMessage.content,
        time: newMessage.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userId: newMessage.userId || newMessage.user?._id,
      };
      setChatHistory((prev) => [...prev, formatted]);
    };

    const handleUpdateActiveUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on('load_messages', handleLoadMessages);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('update_active_users', handleUpdateActiveUsers);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('load_messages', handleLoadMessages);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('update_active_users', handleUpdateActiveUsers);
      socket.emit('leave_room', { blogId });
    };
  }, [blogId, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket.connected || !user?._id) return;

    socket.emit('send_message', {
      blogId,
      message: messageInput.trim(),
      user: {
        _id: user._id,
        username: user.username || user.name,
        avatar: user.avatar || user.profileImage?.url,
        role: user.role || 'Member',
      },
    });
    setMessageInput('');
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleInvite = () => setShowInviteModal(true);
  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/discussionroom/${blogId}`;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayParticipants = onlineUsers.slice(0, 8);
  const onlineCount = onlineUsers.length;
  const isAuthorOnline = onlineUsers.some(u => u.userId === authorInfo.id);

  // Loading state
  if (loadingBlog || !blog) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!blogId || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">Unable to load discussion room</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 truncate">{blogTitle}</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {blogCategory && <span>{blogCategory}</span>}
            {blogReadTime && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {blogReadTime} min
                </span>
              </>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              Live
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInvite}
            className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
          >
            <UserPlus size={14} />
            Invite
          </button>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-4">
                <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                  <History size={12} className="inline mr-1" />
                  Discussion started
                </div>
              </div>

              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to start the discussion!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatHistory.map((msg) => {
                    const isSelf = msg.userId === user?._id;
                    
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        {!isSelf && (
                          <img
                            src={msg.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.author)}&background=ddd&color=333`}
                            alt={msg.author}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        )}
                        <div className={`max-w-[70%] ${isSelf ? 'items-end' : ''}`}>
                          <div className={`flex items-center gap-2 mb-1 ${isSelf ? 'justify-end' : ''}`}>
                            <span className="text-xs font-medium text-gray-700">{isSelf ? 'You' : msg.author}</span>
                            <span className="text-xs text-gray-400">{msg.time}</span>
                          </div>
                          <div className={`px-3 py-2 rounded-lg text-sm ${
                            isSelf
                              ? 'bg-gray-800 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                        {isSelf && (
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium bg-gray-600"
                          >
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
                  disabled={!isConnected}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !messageInput.trim()}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-72 bg-gray-50 border-l border-gray-200 flex-col overflow-y-auto shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase">About Author</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={authorInfo.avatar}
                  alt={authorInfo.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                {isAuthorOnline && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white"></div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-900">{authorInfo.name}</h4>
                <p className="text-xs text-gray-500">{authorInfo.role}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600">{authorInfo.bio}</p>
            <Link to={`/profile/${authorInfo.id}`} className="mt-2 block text-xs text-gray-500 hover:text-gray-700">
              View profile →
            </Link>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Active Members</h3>
              <span className="text-xs text-gray-500">{onlineCount} online</span>
            </div>
            <div className="space-y-2">
              {displayParticipants.map((participant, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={participant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.username)}&background=ddd&color=333`}
                      alt={participant.username}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white"></div>
                  </div>
                  <span className="text-sm text-gray-700">{participant.username}</span>
                </div>
              ))}
              {displayParticipants.length === 0 && (
                <p className="text-xs text-gray-400">No active members</p>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {showSidebar && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />
            <div className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-lg z-50 lg:hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Info</h3>
                <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Author</h4>
                <div className="flex items-center gap-3 mb-3">
                  <img src={authorInfo.avatar} alt={authorInfo.name} className="h-10 w-10 rounded-full" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{authorInfo.name}</p>
                    <p className="text-xs text-gray-500">{authorInfo.role}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-3">{authorInfo.bio}</p>
                <Link to={`/profile/${authorInfo.id}`} className="text-xs text-gray-500">View profile →</Link>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Active ({onlineCount})</h4>
                  <div className="space-y-2">
                    {displayParticipants.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                          {p.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700">{p.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200">
                <button onClick={handleInvite} className="w-full py-2 rounded-md bg-gray-800 text-white text-sm">
                  Invite
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-sm mx-4 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-gray-900">Invite</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Share this link:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${window.location.origin}/discussionroom/${blogId}`}
                readOnly
                className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none"
              />
              <button
                onClick={copyInviteLink}
                className="px-3 py-1.5 rounded-md bg-gray-800 text-white text-sm hover:bg-gray-700"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionRoom;