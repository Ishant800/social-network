import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  UserPlus,
  Send,
  History,
  CircleFadingPlusIcon,
  User,
} from 'lucide-react';

// Initialize socket once outside component
const socket = io('http://localhost:5000', { autoConnect: false });

const DiscussionRoom = () => {
  const { blogId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [chatHistory, setChatHistory] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

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
        avatar: user.avatar,
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
        likes: msg.likes || 0,
        isSelf: msg.user?._id === user._id || msg.userId === user._id,
      }));

      setChatHistory(formatted);
    };

    const handleReceiveMessage = (newMessage) => {
      const isSelf = newMessage.user?._id === user._id || newMessage.userId === user._id;
      const formatted = {
        id: newMessage.id?.toString() || newMessage._id?.toString() || Date.now().toString(),
        author: newMessage.author || newMessage.user?.username || 'Unknown',
        role: newMessage.role || newMessage.user?.role || 'Member',
        avatar: newMessage.avatar || newMessage.user?.avatar,
        text: newMessage.text || newMessage.content,
        time: newMessage.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        likes: newMessage.likes || 0,
        isSelf,
      };

      setChatHistory((prev) => [...prev, formatted]);
    };

    const handleUpdateActiveUsers = (users) => {
      setOnlineUsers(users);
    };

    const handleConnectError = (err) => {
      console.error('Socket connection error:', err.message);
    };

    socket.on('load_messages', handleLoadMessages);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('update_active_users', handleUpdateActiveUsers);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('load_messages', handleLoadMessages);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('update_active_users', handleUpdateActiveUsers);
      socket.off('connect_error', handleConnectError);
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
        avatar: user.avatar,
        role: user.role || 'Member',
      },
    });

    setMessageInput('');
  };

  const authorInfo = {
    name: 'Dr. Sarah K.',
    role: 'Chief Curator',
    bio: 'Focusing on the intersection of cognitive science and interface design.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  };

  const staticParticipants = [
    {
      name: 'Marcus Chen',
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isActive: true,
    },
    {
      name: 'Elena Vance',
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      isActive: true,
    },
    {
      name: 'Julian Thorne',
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      isActive: true,
    },
  ];

  const displayParticipants =
    onlineUsers.length > 0
      ? onlineUsers.slice(0, 5).map((participant) => ({
          name: participant.username || participant.name,
          role: participant.role || 'Member',
          avatar:
            participant.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              participant.username || participant.name,
            )}`,
          isActive: true,
        }))
      : staticParticipants;

  const onlineCount = onlineUsers.length || 12;

  if (!blogId || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#eef1f3] text-sm text-[#595c5e]">
        Loading discussion room...
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100vh-7rem)] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-4">
      <main className="flex min-h-0 flex-col overflow-hidden bg-[#eef1f3]">
        <header className="flex items-center justify-between gap-4 border-b border-[#dde2e7] bg-[#eef1f3] px-4 py-3 lg:px-5">
          <div className="min-w-0">
            <h2 className="truncate font-['Plus_Jakarta_Sans'] text-[1.1rem] font-semibold tracking-tight text-[#2c2f31] sm:text-[1.2rem]">
              The Architecture of Digital Silence
            </h2>
          </div>

          <button className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-[#d8e3fb] px-4 text-sm font-medium text-[#23324d] transition-colors hover:bg-[#cad5ed]">
            <UserPlus size={16} />
            <span>Invite Author</span>
          </button>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto bg-[#eef1f3] px-4 py-4 lg:px-5">
          <div className="mx-auto flex w-full max-w-[820px] flex-col gap-4">
            <div className="flex justify-center">
              <div className="flex items-center gap-2 rounded-full bg-[#e5e9eb] px-3 py-1 text-[11px] font-medium text-[#5d6470]">
                <History size={14} />
                <span>Discussion started today at 10:45 AM</span>
              </div>
            </div>

            {chatHistory.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center bg-[#f5f7f9] px-6 text-center text-sm text-[#7b8085]">
                No messages yet. Be the first to start the discussion!
              </div>
            ) : (
              chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full gap-2 ${
                    msg.isSelf ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex w-full max-w-[min(100%,38rem)] gap-3 ${
                      msg.isSelf ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {msg.isSelf ? (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d9dde0]">
                        <User size={17} className="text-[#4e44d4]" />
                      </div>
                    ) : (
                      <img
                        src={msg.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.author)}`}
                        alt={msg.author}
                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                      />
                    )}

                    <div className={`flex min-w-0 flex-1 flex-col gap-1.5 ${msg.isSelf ? 'items-end' : ''}`}>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-0.5">
                        {msg.isSelf ? (
                          <>
                            <span className="font-['Plus_Jakarta_Sans'] text-sm font-medium text-[#2c2f31]">
                              You
                            </span>
                            <span className="text-[11px] font-medium text-[#6b7280]">{msg.time}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-['Plus_Jakarta_Sans'] text-sm font-medium text-[#2c2f31]">
                              {msg.author}
                            </span>
                            <span className="text-[11px] font-medium text-[#6b7280]">{msg.time}</span>
                          </>
                        )}
                      </div>

                      <div
                        className={`w-full px-4 py-3 ${
                          msg.isSelf
                            ? 'rounded-[14px] rounded-tr-[4px] bg-[#4e44d4] text-[#f5f1ff]'
                            : 'rounded-[14px] rounded-tl-[4px] bg-[#f8fafb] text-[#2c2f31]'
                        }`}
                      >
                        <p className="break-words text-[14px] leading-6">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>
        </section>

        <div className="border-t border-[#dde2e7] bg-[#eef1f3] px-4 py-3 lg:px-5">
          <form
            onSubmit={handleSendMessage}
            className="mx-auto flex w-full max-w-[820px] items-center gap-2 rounded-[16px] bg-[#f8fafb] px-3 py-2"
          >
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-[#595c5e] transition-colors hover:bg-[#e5e9eb] hover:text-[#4e44d4]"
            >
              <CircleFadingPlusIcon size={18} />
            </button>

            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={isConnected ? 'Contribute to the discussion...' : 'Connecting...'}
              disabled={!isConnected}
              className="min-w-0 flex-1 bg-transparent px-1 text-[14px] font-normal text-[#2c2f31] outline-none placeholder:text-[#8c96a3]"
            />

            <button
              type="submit"
              disabled={!isConnected || !messageInput.trim()}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[12px] bg-[#b8b2fa] px-4 text-sm font-medium text-white transition-colors hover:bg-[#a69ef6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Send</span>
              <Send size={14} />
            </button>
          </form>
        </div>
      </main>

      <aside className="hidden min-h-0 xl:flex xl:flex-col">
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#eef1f3]">
          <div className="border-b border-[#dde2e7] px-4 py-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#595c5e]">
              About the Author
            </h3>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="bg-[#f8fafb] p-4">
              <div className="flex items-center gap-3">
                <img
                  src={authorInfo.avatar}
                  alt={authorInfo.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <h4 className="truncate font-['Plus_Jakarta_Sans'] text-sm font-medium text-[#2c2f31]">
                    {authorInfo.name}
                  </h4>
                  <p className="text-[11px] text-[#4e44d4]">{authorInfo.role}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-6 text-[#595c5e]">{authorInfo.bio}</p>
              <button className="mt-3 w-full bg-[#eef1f3] py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-[#e5e9eb]">
                View Portfolio
              </button>
            </div>

            <div className="mt-5">
              <div className="mb-4 flex items-center justify-between px-1">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#595c5e]">
                  Active Members
                </h3>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-[#004b58]">
                  {onlineCount} Online
                </span>
              </div>

              <div className="space-y-1 overflow-y-auto">
                {displayParticipants.map((participant, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-[#f8fafb] px-3 py-2.5 transition-colors hover:bg-[#edf1f4]"
                  >
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                    <p className="truncate text-sm font-medium text-slate-900">{participant.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </aside>
    </div>
  );
};

export default DiscussionRoom;
