import { useState } from 'react';
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, Image as ImageIcon } from 'lucide-react';

export default function Messages() {
  const [activeChat, setActiveChat] = useState(0);
  const [messageInput, setMessageInput] = useState('');

  // Dummy chat list data
  const chats = [
    {
      id: 0,
      name: "Sarah Chen",
      avatar: "https://i.pravatar.cc/150?u=sarah&size=200",
      lastMessage: "That sounds great! Let me check the docs 📚",
      time: "12:45 PM",
      unread: 2,
      online: true,
      typing: true,
    },
    {
      id: 1,
      name: "Marcus Johnson",
      avatar: "https://i.pravatar.cc/150?u=marcus&size=200",
      lastMessage: "Can you review the PR when you get a chance?",
      time: "11:20 AM",
      unread: 0,
      online: false,
      typing: false,
    },
    {
      id: 2,
      name: "Elena Rodriguez",
      avatar: "https://i.pravatar.cc/150?u=elena&size=200",
      lastMessage: "Thanks for the help yesterday! 🙏",
      time: "Yesterday",
      unread: 1,
      online: true,
      typing: false,
    },
    {
      id: 3,
      name: "Dev Team",
      avatar: "https://ui-avatars.com/api/?name=Dev+Team&background=6366f1&color=fff&size=200",
      lastMessage: "Alex: Sprint planning at 3 PM today",
      time: "Mon",
      unread: 5,
      online: null, // group chat
      typing: false,
      isGroup: true,
    },
  ];

  // Dummy messages for active chat
  const messages = [
    {
      id: 1,
      senderId: 'other',
      text: "Hey! Did you get a chance to look at the new design mockups?",
      time: "12:30 PM",
      status: 'read',
    },
    {
      id: 2,
      senderId: 'me',
      text: "Yes! I love the new color palette. The indigo accents really pop ✨",
      time: "12:32 PM",
      status: 'read',
    },
    {
      id: 3,
      senderId: 'other',
      text: "Awesome! I was worried it might be too bold, but I'm glad you like it.",
      time: "12:35 PM",
      status: 'read',
    },
    {
      id: 4,
      senderId: 'me',
      text: "Definitely not too bold. It feels modern and professional at the same time. When do you want to finalize?",
      time: "12:40 PM",
      status: 'delivered',
    },
    {
      id: 5,
      senderId: 'other',
      text: "That sounds great! Let me check the docs 📚",
      time: "12:45 PM",
      status: 'read',
    },
  ];

  const activeChatData = chats[activeChat];

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm flex h-[calc(100vh-120px)] overflow-hidden">
      
      {/* ===== Chat List Pane ===== */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/40">
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm 
                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none 
                         placeholder:text-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5">
          {chats.map((chat, index) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(index)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 text-left
                         ${activeChat === index 
                           ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                           : 'hover:bg-white hover:shadow-sm border border-transparent'}`}
            >
              {/* Avatar with status */}
              <div className="relative flex-shrink-0">
                <img 
                  src={chat.avatar} 
                  alt={`${chat.name}'s avatar`}
                  className={`w-12 h-12 rounded-2xl object-cover shadow-sm
                             ${activeChat === index ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                  loading="lazy"
                />
                {/* Online indicator */}
                {chat.online !== null && (
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white
                                   ${chat.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                )}
              </div>

              {/* Chat info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <span className={`font-semibold truncate ${activeChat === index ? 'text-indigo-900' : 'text-slate-900'}`}>
                    {chat.name}
                    {chat.isGroup && <span className="ml-1 text-[10px] text-slate-400 font-normal">• Group</span>}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">{chat.time}</span>
                </div>
                
                <p className={`text-xs mt-0.5 truncate ${
                  chat.typing 
                    ? 'text-indigo-600 font-semibold italic' 
                    : chat.unread > 0 
                      ? 'text-slate-700 font-semibold' 
                      : 'text-slate-500'
                }`}>
                  {chat.typing ? 'Typing...' : chat.lastMessage}
                </p>
              </div>

              {/* Unread badge */}
              {chat.unread > 0 && (
                <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full 
                               bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
                  {chat.unread > 9 ? '9+' : chat.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Conversation Pane ===== */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* Conversation Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img 
                src={activeChatData.avatar} 
                alt={`${activeChatData.name}'s avatar`}
                className="w-11 h-11 rounded-2xl object-cover shadow-sm"
              />
              {activeChatData.online !== null && (
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
                                 ${activeChatData.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-[15px]">{activeChatData.name}</p>
              <p className={`text-[11px] font-medium ${
                activeChatData.typing 
                  ? 'text-indigo-600 italic' 
                  : activeChatData.online 
                    ? 'text-emerald-600' 
                    : 'text-slate-400'
              }`}>
                {activeChatData.typing ? 'typing...' : activeChatData.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 
                             rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 
                             focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label="Voice call">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 
                             rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 
                             focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label="Video call">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl 
                             transition-all duration-200 focus:outline-none focus:ring-2 
                             focus:ring-slate-300 focus:ring-offset-2"
                    aria-label="More options">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
          {messages.map((message, index) => {
            const isMe = message.senderId === 'me';
            const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId === 'me');
            
            return (
              <div 
                key={message.id} 
                className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar for received messages */}
                {!isMe && (
                  <div className={`flex-shrink-0 w-8 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                    {showAvatar && (
                      <img 
                        src={activeChatData.avatar} 
                        alt="" 
                        className="w-8 h-8 rounded-xl object-cover shadow-sm"
                      />
                    )}
                  </div>
                )}
                
                {/* Message bubble */}
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-md' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-bl-md'
                  }`}>
                    {message.text}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${
                    isMe ? 'text-slate-400 text-right' : 'text-slate-400'
                  }`}>
                    {message.time}
                    {isMe && message.status === 'read' && (
                      <span className="ml-1 text-indigo-500">✓✓</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator */}
          {activeChatData.typing && (
            <div className="flex items-end gap-3">
              <div className="flex-shrink-0 w-8">
                <img 
                  src={activeChatData.avatar} 
                  alt="" 
                  className="w-8 h-8 rounded-xl object-cover shadow-sm"
                />
              </div>
              <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl 
                          focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent 
                          transition-all duration-200">
            
            {/* Attachment buttons */}
            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 
                               rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 
                               focus:ring-indigo-500"
                      aria-label="Attach file">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 
                               rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 
                               focus:ring-indigo-500"
                      aria-label="Attach image">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Text input */}
            <input 
              type="text" 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] px-2 py-1.5 
                         outline-none placeholder:text-slate-400 min-w-0"
              onKeyDown={(e) => e.key === 'Enter' && messageInput.trim() && console.log('Send:', messageInput)}
            />
            
            {/* Emoji & Send */}
            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 
                               rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 
                               focus:ring-indigo-500"
                      aria-label="Add emoji">
                <Smile className="w-5 h-5" />
              </button>
              <button 
                className={`p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 
                           focus:ring-indigo-500 focus:ring-offset-2 ${
                  messageInput.trim() 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                disabled={!messageInput.trim()}
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Helper text */}
          <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Enter</kbd> to send
          </p>
        </div>
      </div>
    </div>
  );
}