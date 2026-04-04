import { useState } from 'react';
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Smile } from 'lucide-react';

export default function Messages() {
  const [activeChat, setActiveChat] = useState(0);
  const [messageInput, setMessageInput] = useState('');

  const chats = [
    { id: 0, name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah&size=150", lastMessage: "That sounds great! Let me check the docs", time: "12:45 PM", unread: 2, online: true, typing: true },
    { id: 1, name: "Marcus Johnson", avatar: "https://i.pravatar.cc/150?u=marcus&size=150", lastMessage: "Can you review the PR when you get a chance?", time: "11:20 AM", unread: 0, online: false, typing: false },
    { id: 2, name: "Elena Rodriguez", avatar: "https://i.pravatar.cc/150?u=elena&size=150", lastMessage: "Thanks for the help yesterday!", time: "Yesterday", unread: 1, online: true, typing: false },
    { id: 3, name: "Dev Team", avatar: "https://ui-avatars.com/api/?name=Dev+Team&background=6366f1&color=fff&size=150", lastMessage: "Alex: Sprint planning at 3 PM today", time: "Mon", unread: 5, online: null, typing: false, isGroup: true },
  ];

  const messages = [
    { id: 1, senderId: 'other', text: "Hey! Did you get a chance to look at the new design mockups?", time: "12:30 PM" },
    { id: 2, senderId: 'me', text: "Yes! I love the new color palette. The indigo accents really pop ✨", time: "12:32 PM" },
    { id: 3, senderId: 'other', text: "Awesome! I was worried it might be too bold, but I'm glad you like it.", time: "12:35 PM" },
    { id: 4, senderId: 'me', text: "Definitely not too bold. It feels modern and professional. When do you want to finalize?", time: "12:40 PM" },
    { id: 5, senderId: 'other', text: "That sounds great! Let me check the docs 📚", time: "12:45 PM" },
  ];

  const activeChatData = chats[activeChat];

  const handleSend = () => {
    if (!messageInput.trim()) return;
    // TODO: Send message via API
    console.log('Sending:', messageInput);
    setMessageInput('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-100px)] flex bg-white rounded-xl border border-slate-100 overflow-hidden">
      
      {/* Chat List */}
      <div className="w-72 border-r border-slate-100 flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Chat Items */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat, index) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(index)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition text-left ${
                activeChat === index ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
                {chat.online !== null && (
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${chat.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-slate-900 truncate">{chat.name}</span>
                  <span className="text-xs text-slate-400">{chat.time}</span>
                </div>
                <p className={`text-xs truncate ${chat.typing ? 'text-indigo-600 italic' : chat.unread > 0 ? 'font-medium text-slate-700' : 'text-slate-500'}`}>
                  {chat.typing ? 'Typing...' : chat.lastMessage}
                </p>
              </div>

              {chat.unread > 0 && (
                <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                  {chat.unread > 9 ? '9+' : chat.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src={activeChatData.avatar} alt={activeChatData.name} className="w-9 h-9 rounded-full object-cover" />
            <div>
              <p className="text-sm font-medium text-slate-900">{activeChatData.name}</p>
              <p className={`text-xs ${activeChatData.typing ? 'text-indigo-600 italic' : activeChatData.online ? 'text-emerald-600' : 'text-slate-400'}`}>
                {activeChatData.typing ? 'typing...' : activeChatData.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.map((msg, i) => {
            const isMe = msg.senderId === 'me';
            const prevMsg = messages[i - 1];
            const showAvatar = !isMe && (!prevMsg || prevMsg.senderId === 'me');
            
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && (
                  <div className={`w-8 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                    {showAvatar && <img src={activeChatData.avatar} alt="" className="w-8 h-8 rounded-full" />}
                  </div>
                )}
                
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm ${
                    isMe ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">{msg.time}</span>
                </div>
              </div>
            );
          })}
          
          {activeChatData.typing && (
            <div className="flex items-end gap-2">
              <img src={activeChatData.avatar} alt="" className="w-8 h-8 rounded-full" />
              <div className="bg-white border border-slate-100 px-3 py-2 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <Paperclip className="w-4 h-4" />
            </button>
            
            <input 
              type="text" 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..." 
              className="flex-1 bg-transparent border-none outline-none text-sm py-2"
            />
            
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
              <Smile className="w-4 h-4" />
            </button>
            
            <button 
              onClick={handleSend}
              disabled={!messageInput.trim()}
              className={`p-2 rounded-lg transition ${
                messageInput.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}