import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import {
  Send,
  ArrowLeft,
  CheckCheck,
  Check,
  MessageCircle,
  Search,
  X,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────────
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAvatar = (u) =>
  u?.profile?.avatar?.url ||
  u?.profileImage?.url ||
  u?.profileImage ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    u?.username || u?.name || 'User'
  )}&background=e2e8f0&color=475569&bold=true`;

const getName = (u) => u?.username || u?.name || 'User';

const fmtTime = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ─── Empty state ─────────────────────────────────────────────────────────────────
function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <MessageCircle className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">Your messages</h3>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        Select a conversation on the left, or start a new one from the Friends page.
      </p>
    </div>
  );
}

// ─── Conversation row ─────────────────────────────────────────────────────────────
function ConversationRow({ chat, isActive, onClick }) {
  const u    = chat.user;
  const name = getName(u);
  const avatar = getAvatar(u);
  const lastMsg = chat.lastMessage?.content;
  const time    = fmtTime(chat.lastMessage?.createdAt);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
      }`}
    >
      <div className="relative shrink-0">
        <img src={avatar} alt={name} className="w-11 h-11 rounded-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-sm font-semibold text-gray-900 truncate">{name}</span>
          {time && <span className="text-[11px] text-gray-400 shrink-0 ml-2">{time}</span>}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 truncate">{lastMsg || 'No messages yet'}</p>
          {chat.unreadCount > 0 && (
            <span className="ml-2 shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-gray-900 text-white text-[10px] font-bold px-1">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────────
function MessageBubble({ msg, isSender }) {
  const time = fmtTime(msg.createdAt);

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isSender
            ? 'bg-gray-900 text-white rounded-br-sm'
            : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
        }`}
      >
        <p className="break-words">{msg.content}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
          isSender ? 'text-gray-400' : 'text-gray-400'
        }`}>
          <span>{time}</span>
          {isSender && (
            <>
              {msg.read
                ? <CheckCheck className="w-3 h-3 text-blue-400" />
                : msg.delivered
                ? <CheckCheck className="w-3 h-3 text-gray-400" />
                : <Check className="w-3 h-3 text-gray-500" />
              }
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────────
export default function MessageSystem() {
  const { user }   = useSelector((s) => s.auth);
  const navigate   = useNavigate();
  const location   = useLocation();

  const socketRef      = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimer    = useRef(null);
  const inputRef       = useRef(null);

  const [connected,     setConnected]     = useState(false);
  const [chatList,      setChatList]      = useState([]);
  const [selectedChat,  setSelectedChat]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [draft,         setDraft]         = useState('');
  const [isTyping,      setIsTyping]      = useState(false);
  const [search,        setSearch]        = useState('');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── Init socket ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Register + load chat list once connected ─────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected || !user?._id) return;

    socket.emit('register_private_user', { userId: user._id });
    socket.emit('get_chat_list', { userId: user._id });

    socket.on('chat_list_data', setChatList);

    socket.on('receive_private_message', (msg) => {
      // If the message is from the currently open conversation, append it
      setSelectedChat((sc) => {
        if (sc && msg.from?._id === sc.user._id) {
          setMessages((prev) => [...prev, msg]);
          socket.emit('mark_private_messages_read', {
            userId: user._id,
            otherUserId: msg.from._id,
          });
        }
        return sc;
      });
      // Always refresh the list
      socket.emit('get_chat_list', { userId: user._id });
    });

    socket.on('private_message_sent', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(scrollToBottom, 80);
      socket.emit('get_chat_list', { userId: user._id });
    });

    socket.on('private_chat_history', (history) => {
      setMessages(history);
      setTimeout(scrollToBottom, 80);
    });

    socket.on('message_delivered', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, delivered: true } : m))
      );
    });

    socket.on('messages_read', ({ readBy }) => {
      setSelectedChat((sc) => {
        if (sc && readBy === sc.user._id) {
          setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
        }
        return sc;
      });
    });

    socket.on('user_typing', ({ userId, isTyping: typing }) => {
      setSelectedChat((sc) => {
        if (sc && userId === sc.user._id) setIsTyping(typing);
        return sc;
      });
    });

    return () => {
      socket.off('chat_list_data');
      socket.off('receive_private_message');
      socket.off('private_message_sent');
      socket.off('private_chat_history');
      socket.off('message_delivered');
      socket.off('messages_read');
      socket.off('user_typing');
    };
  }, [connected, user, scrollToBottom]);

  // ── Handle incoming navigation from UserSuggestions ─────────────────────────
  useEffect(() => {
    const target = location.state?.startChatWith;
    const socket = socketRef.current;
    if (!target || !socket || !user?._id) return;

    const chatUser = {
      user: {
        _id:          target._id,
        username:     target.name || target.username,
        profileImage: target.profileImage,
      },
      lastMessage: null,
      unreadCount: 0,
    };

    setSelectedChat(chatUser);
    setMessages([]);

    navigate('/chats', { replace: true, state: {} });
  }, [location.state, user, navigate]);

  // ── Load history when conversation selected ──────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!selectedChat || !socket || !user?._id || !connected) return;

    socket.emit('get_private_chat_history', {
      userId:      user._id,
      otherUserId: selectedChat.user._id,
    });
    socket.emit('mark_private_messages_read', {
      userId:      user._id,
      otherUserId: selectedChat.user._id,
    });
    setIsTyping(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [selectedChat, connected, user]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const selectConversation = (chat) => {
    setSelectedChat(chat);
    setMessages([]);
    setChatList((prev) =>
      prev.map((c) =>
        c.user._id === chat.user._id ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const socket = socketRef.current;
    if (!draft.trim() || !selectedChat || !socket) return;

    socket.emit('send_private_message', {
      from:    user._id,
      to:      selectedChat.user._id,
      message: draft.trim(),
    });
    setDraft('');
  };

  const handleTyping = () => {
    const socket = socketRef.current;
    if (!selectedChat || !socket) return;

    socket.emit('private_typing', { from: user._id, to: selectedChat.user._id, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('private_typing', { from: user._id, to: selectedChat.user._id, isTyping: false });
    }, 1500);
  };

  // ── Filtered chat list ───────────────────────────────────────────────────────
  const visibleChats = chatList.filter((c) => {
    if (!search.trim()) return true;
    return getName(c.user).toLowerCase().includes(search.toLowerCase());
  });

  const recipientName   = selectedChat ? getName(selectedChat.user)   : '';
  const recipientAvatar = selectedChat ? getAvatar(selectedChat.user) : '';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    /* Full height minus the navbar (h-16 = 4rem → top-16/pt-16 in layout) */
    <div className="flex h-[calc(100dvh-4rem)] bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">

      {/* ── Left panel: conversation list ───────────────────────────────────── */}
      <div className={`flex flex-col border-r border-gray-100 w-full lg:w-80 shrink-0 ${
        selectedChat ? 'hidden lg:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-8 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {!connected ? (
            <div className="p-6 text-center">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-400">Connecting…</p>
            </div>
          ) : visibleChats.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">
                {search ? 'No results found' : 'Start chatting from the Friends page'}
              </p>
            </div>
          ) : (
            visibleChats.map((chat) => (
              <ConversationRow
                key={chat.user._id}
                chat={chat}
                isActive={selectedChat?.user._id === chat.user._id}
                onClick={() => selectConversation(chat)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: active conversation ────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 ${
        selectedChat ? 'flex' : 'hidden lg:flex'
      }`}>
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
              {/* Back arrow — mobile */}
              <button
                onClick={() => setSelectedChat(null)}
                className="lg:hidden p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <img
                src={recipientAvatar}
                alt={recipientName}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                  {recipientName}
                </p>
                <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                  {isTyping ? (
                    <span className="text-gray-700 font-medium animate-pulse">typing…</span>
                  ) : connected ? (
                    'Online'
                  ) : (
                    'Connecting…'
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Say hello! 👋</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const fromId  = msg.from?._id || msg.from;
                  const isSender = String(fromId) === String(user._id);
                  return (
                    <MessageBubble key={msg.id || msg._id || idx} msg={msg} isSender={isSender} />
                  );
                })
              )}

              {/* Typing indicator */}
              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => { setDraft(e.target.value); handleTyping(); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(e); }}
                placeholder="Write a message…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
              />
              <button
                type="submit"
                disabled={!draft.trim() || !connected}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}