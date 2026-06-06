import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  MessageCircle,
  ThumbsUp,
  MoreHorizontal,
  Send,
  Smile,
  Image as ImageIcon,
  Paperclip,
  Bell,
} from 'lucide-react';
import API from '@/api/axios';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const appendUniqueDiscussionMessage = (prev, formatted) => {
  const id = String(formatted.id || '');
  if (id && prev.some((m) => String(m.id) === id)) return prev;
  return [...prev, formatted];
};

const DiscussionRoom = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [blog, setBlog] = useState(null);
  const [loadingBlog, setLoadingBlog] = useState(true);

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [activities, setActivities] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPingToast, setShowPingToast] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const userIdRef = useRef(null);
  const blogAuthorIdRef = useRef(null);

  useEffect(() => {
    userIdRef.current = user?._id || user?.id;
  }, [user?._id, user?.id]);

  useEffect(() => {
    blogAuthorIdRef.current = blog?.author?._id;
  }, [blog?.author?._id]);

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

  const blogTitle = blog?.title || 'Discussion';
  const blogCategory = blog?.category?.name || 'Politics';
  const blogReadTime = blog?.readTime || '2';

  // Get author info
  const authorInfo = {
    name: blog?.author?.username || blog?.author?.name || 'Author',
    avatar: blog?.author?.avatar || blog?.author?.profileImage?.url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(blog?.author?.username || 'Author')}&background=6366f1&color=ffffff`,
    id: blog?.author?._id,
  };

  const isAuthorOnline = onlineUsers.some(
    (u) => String(u.userId) === String(authorInfo.id),
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add activity helper
  const addActivity = (type, username, detail = '') => {
    const activity = {
      id: Date.now(),
      type,
      username,
      detail,
      time: 'Just now',
      timestamp: Date.now(),
    };
    setActivities(prev => [activity, ...prev].slice(0, 10));
  };

  // Socket connection
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!blogId || !userId) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleLoadMessages = (msgs) => {
      const authorId = blogAuthorIdRef.current;
      const formatted = msgs.map((msg) => ({
        id: msg._id?.toString() || msg.id,
        author: msg.user?.username || msg.author || 'Anonymous',
        avatar: msg.user?.avatar || msg.avatar,
        text: msg.content || msg.text,
        time: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          : msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        userId: msg.user?._id || msg.userId,
        likes: msg.likes || (msg.likedBy || []).length || 0,
        likedBy: msg.likedBy || [],
        replyTo: msg.replyTo,
        isAuthor: String(msg.user?._id || msg.userId) === String(authorId),
      }));
      setMessages(formatted);
    };

    const handleReceiveMessage = (newMessage) => {
      const authorId = blogAuthorIdRef.current;
      const formatted = {
        id: newMessage.id?.toString() || newMessage._id?.toString() || '',
        author: newMessage.author || newMessage.user?.username || 'Unknown',
        avatar: newMessage.avatar || newMessage.user?.avatar,
        text: newMessage.text || newMessage.content,
        time: newMessage.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        userId: newMessage.userId || newMessage.user?._id,
        likes: 0,
        likedBy: [],
        replyTo: newMessage.replyTo,
        isAuthor: String(newMessage.userId || newMessage.user?._id) === String(authorId),
      };
      if (!formatted.id) return;

      setMessages((prev) => appendUniqueDiscussionMessage(prev, formatted));

      if (String(formatted.userId) !== String(userIdRef.current)) {
        addActivity('message', formatted.author, 'sent a message');
      }
    };

    const handleUpdateActiveUsers = (users) => {
      setOnlineUsers(users);
    };

    const handleMessageLiked = (data) => {
      const { messageId, userId: likerId, action } = data;
      setMessages((prev) => prev.map((msg) => {
        if (msg.id === messageId) {
          const likedBy = action === 'like'
            ? [...(msg.likedBy || []), likerId]
            : (msg.likedBy || []).filter((id) => id !== likerId);
          return {
            ...msg,
            likes: likedBy.length,
            likedBy,
          };
        }
        return msg;
      }));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('load_messages', handleLoadMessages);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('update_active_users', handleUpdateActiveUsers);
    socket.on('message_liked', handleMessageLiked);

    socket.connect();
    socket.emit('join_room', {
      blogId,
      user: {
        _id: userId,
        username: user.username || user.name,
        avatar: user.avatar || user.profileImage?.url || user.profile?.avatar?.url,
      },
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('load_messages', handleLoadMessages);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('update_active_users', handleUpdateActiveUsers);
      socket.off('message_liked', handleMessageLiked);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [blogId, user?._id, user?.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    const socket = socketRef.current;
    if (!messageInput.trim() || !socket?.connected || !user?._id) return;

    socket.emit('send_message', {
      blogId,
      message: messageInput.trim(),
      replyTo: replyingTo?.id || null,
      user: {
        _id: user._id,
        username: user.username || user.name,
        avatar: user.avatar || user.profileImage?.url,
      },
    });
    
    setMessageInput('');
    setReplyingTo(null);
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleLikeMessage = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const hasLiked = message.likedBy.includes(user._id);
    
    // Update local state immediately for responsiveness
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          likes: hasLiked ? msg.likes - 1 : msg.likes + 1,
          likedBy: hasLiked 
            ? msg.likedBy.filter(id => id !== user._id)
            : [...msg.likedBy, user._id]
        };
      }
      return msg;
    }));

    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('like_message', {
      blogId,
      messageId,
      userId: user._id,
      action: hasLiked ? 'unlike' : 'like'
    });

    // Add to activity
    if (!hasLiked) {
      addActivity('like', user.username || user.name, 'liked a message');
    }
  };

  const handleReply = (messageId, author) => {
    setReplyingTo({ id: messageId, author });
    inputRef.current?.focus();
  };

  const handlePingAuthor = async () => {
    try {
      await API.post('/notifications/ping-author', {
        authorId: authorInfo.id,
        blogId: blogId,
        blogTitle: blogTitle
      });
      
      setShowPingToast(true);
      setTimeout(() => setShowPingToast(false), 1000);
    } catch (error) {
      console.error('Error pinging author:', error);
    }
  };

  // Loading state
  if (loadingBlog || !blog) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (!blogId || !user) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Unable to load discussion</p>
      </div>
    );
  }

  const peopleHere = onlineUsers.length || 1;
  const totalReplies = messages.length || 2;
  const totalReactions = messages.reduce((sum, msg) => sum + msg.likes, 0) || 8;

  return (
    <div className="h-full flex bg-gray-50">
      {/* Ping Toast Notification */}
      {showPingToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Invitation sent successfully!</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-100 rounded transition shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 truncate">{blogTitle}</h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">{blogCategory}</span>
                <span>•</span>
                <span>{blogReadTime} min read</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Live discussion
                </span>
                <span>•</span>
                <span>Started by {authorInfo.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {!isAuthorOnline && (
              <button
                onClick={handlePingAuthor}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                <Bell className="w-3 h-3" />
                Ping Author
              </button>
            )}
            <button className="p-1 hover:bg-gray-100 rounded transition">
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Users className="w-3 h-3" />
            <span className="font-medium">{peopleHere}</span>
            <span>People here</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <MessageCircle className="w-3 h-3" />
            <span className="font-medium">{totalReplies}</span>
            <span>Replies</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <ThumbsUp className="w-3 h-3" />
            <span className="font-medium">{totalReactions}</span>
            <span>Reactions</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="max-w-3xl mx-auto space-y-2">
            {messages.map((msg) => {
              const isSelf = msg.userId === user?._id;
              const hasLiked = msg.likedBy.includes(user._id);
              const replyToMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
              
              return (
                <div key={msg.id} className="bg-white rounded border border-gray-200 p-2">
                  <div className="flex items-start gap-2">
                    <img
                      src={msg.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.author)}&background=e5e7eb&color=374151`}
                      alt={msg.author}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-semibold text-gray-900">{isSelf ? 'You' : msg.author}</span>
                        {msg.isAuthor && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">Author</span>
                        )}
                        <span className="text-[10px] text-gray-500">• {msg.time}</span>
                      </div>
                      
                      {/* Reply indicator */}
                      {replyToMsg && (
                        <div className="mb-1.5 pl-2 border-l-2 border-gray-300 bg-gray-50 rounded py-1 px-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            <MessageCircle className="w-2.5 h-2.5 text-gray-500" />
                            <span className="text-[10px] text-gray-600">
                              Replied to <span className="font-semibold">{replyToMsg.author}</span>
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{replyToMsg.text}</p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-700 leading-relaxed mb-2">{msg.text}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLikeMessage(msg.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition ${
                            hasLiked 
                              ? 'bg-blue-50 text-blue-600 font-medium' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${hasLiked ? 'fill-blue-600' : ''}`} />
                          {msg.likes > 0 && <span>{msg.likes}</span>}
                        </button>
                        <button
                          onClick={() => handleReply(msg.id, msg.author)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-600 font-medium">No messages yet</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Be the first to share your thoughts!</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-3 py-2 shrink-0">
          {!isConnected && (
            <div className="mb-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Connecting to discussion room...</span>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
            {replyingTo && (
              <div className="mb-2 px-2.5 py-1.5 bg-blue-50 border-l-2 border-blue-500 rounded flex items-center justify-between">
                <span className="text-[11px] text-gray-700">
                  Replying to <span className="font-semibold text-blue-700">{replyingTo.author}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-500 hover:text-gray-700 ml-3"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex items-start gap-2">
              <img
                src={user?.avatar || user?.profileImage?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=6366f1&color=ffffff`}
                alt="You"
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 relative">
                <div className="relative border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white">
                  <textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type your message..."
                    disabled={!isConnected}
                    rows={1}
                    className="w-full px-3 py-2 pr-28 text-xs resize-none focus:outline-none bg-transparent"
                    style={{ minHeight: '36px', maxHeight: '80px' }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1 hover:bg-gray-100 rounded transition"
                      title="Emoji"
                    >
                      <Smile className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-100 rounded transition"
                      title="Attach image"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-100 rounded transition"
                      title="Attach file"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1">
                    {['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setMessageInput(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-lg hover:bg-gray-100 rounded p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!isConnected || !messageInput.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-l border-gray-200 flex-col shrink-0">
        {/* About Author */}
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase mb-2">About the Author</h3>
          <div className="flex items-start gap-2 mb-2">
            <div className="relative">
              <img
                src={authorInfo.avatar}
                alt={authorInfo.name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              {isAuthorOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-gray-900">{authorInfo.name}</h4>
              <p className="text-[10px] text-gray-600">Author</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-2">Passionate writer sharing insights with the community.</p>
          <Link
            to={`/profile/${authorInfo.id}`}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
          >
            View profile →
          </Link>
        </div>

        {/* Active Members */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase">Active Members</h3>
            <span className="text-[10px] text-gray-500">{onlineUsers.length} online</span>
          </div>
          <div className="space-y-1.5">
            {onlineUsers.slice(0, 6).map((participant, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="relative">
                  <img
                    src={participant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.username)}&background=e5e7eb&color=374151`}
                    alt={participant.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border border-white"></div>
                </div>
                <span className="text-xs text-gray-700">{participant.username}</span>
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <p className="text-[11px] text-gray-400">No active members yet</p>
            )}
          </div>
        </div>

        {/* Live Activity */}
        <div className="p-3 border-b border-gray-200 flex-1 overflow-y-auto">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Live Activity</h3>
          <div className="space-y-1.5">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-1.5 text-[11px]">
                  <div className={`w-1 h-1 rounded-full mt-1 shrink-0 ${
                    activity.type === 'message' ? 'bg-blue-500' :
                    activity.type === 'like' ? 'bg-green-500' :
                    'bg-purple-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-700">{activity.username}</span>
                    <span className="text-gray-500"> {activity.detail}</span>
                    <span className="text-gray-400 ml-1">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-gray-400">No recent activity</p>
            )}
          </div>
        </div>

        {/* Unanswered Questions */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase">Unanswered Questions</h3>
            <span className="px-1 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded">3</span>
          </div>
          <div className="space-y-1.5">
            <div className="p-1.5 bg-gray-50 rounded">
              <p className="text-[11px] text-gray-700 mb-1">How will the new leadership address corruption?</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <ThumbsUp className="w-2.5 h-2.5" />
                <span>5 votes</span>
              </div>
            </div>
            <div className="p-1.5 bg-gray-50 rounded">
              <p className="text-[11px] text-gray-700 mb-1">What role do you see for independent candidates?</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <ThumbsUp className="w-2.5 h-2.5" />
                <span>3 votes</span>
              </div>
            </div>
            <div className="p-1.5 bg-gray-50 rounded">
              <p className="text-[11px] text-gray-700 mb-1">How can youth influence policy making?</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <ThumbsUp className="w-2.5 h-2.5" />
                <span>2 votes</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default DiscussionRoom;
