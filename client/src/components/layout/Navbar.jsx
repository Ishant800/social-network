import { 
  Bell, Search, ChevronDown, Home, Compass, Bookmark, Users, 
  Settings, LogOut, Check, X, MessageCircle, Heart, Star 
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const image =
    user?.profile?.avatar?.url ||
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4XoGpSkgybe5fubd2XlhO_zNXDF9CjbTrEw&s';
  
  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  
  // Notifications dropdown state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'mentions'

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dummy navigation sections (Profile dropdown)
  const navSections = [
    {
      title: 'Discover',
      items: [
        { label: 'Home', icon: Home, href: '#' },
        { label: 'Explore', icon: Compass, href: '#' },
        { label: 'Saved', icon: Bookmark, href: '#' },
      ],
    },
    {
      title: 'Community',
      items: [
        { label: 'Groups', icon: Users, href: '#' },
        { label: 'Discussions', icon: Users, href: '#' },
      ],
    },
  ];

  // Dummy related content (Profile dropdown)
  const relatedContent = [
    { title: 'New: AI Writing Tools', tag: 'Featured' },
    { title: 'Top thinkers this week', tag: 'Trending' },
    { title: 'Your reading list', tag: 'Personal' },
  ];

  // Dummy notifications data
  const allNotifications = [
    {
      id: 1,
      type: 'like',
      icon: Heart,
      color: 'text-red-500',
      bg: 'bg-red-50',
      title: 'Sarah liked your thought',
      time: '2m ago',
      read: false,
      avatar: 'https://i.pravatar.cc/40?img=1',
    },
    {
      id: 2,
      type: 'comment',
      icon: MessageCircle,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      title: 'Alex commented: "Great insights!"',
      time: '15m ago',
      read: false,
      avatar: 'https://i.pravatar.cc/40?img=3',
    },
    {
      id: 3,
      type: 'mention',
      icon: Star,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      title: 'You were mentioned in "Future of AI"',
      time: '1h ago',
      read: true,
      avatar: 'https://i.pravatar.cc/40?img=5',
    },
    {
      id: 4,
      type: 'follow',
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      title: 'Jamie started following you',
      time: '3h ago',
      read: true,
      avatar: 'https://i.pravatar.cc/40?img=8',
    },
    {
      id: 5,
      type: 'like',
      icon: Heart,
      color: 'text-red-500',
      bg: 'bg-red-50',
      title: 'Taylor and 3 others liked your post',
      time: '5h ago',
      read: true,
      avatar: 'https://i.pravatar.cc/40?img=12',
    },
  ];

  // Filter notifications
  const filteredNotifications = allNotifications.filter((notif) => {
    if (activeFilter === 'unread') return !notif.read;
    if (activeFilter === 'mentions') return notif.type === 'mention';
    return true;
  });

  const unreadCount = allNotifications.filter((n) => !n.read).length;

  return (
    <header className="w-full border-b border-white/60 bg-white/88 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-360 items-center justify-between px-4 lg:px-8">
        <p className="font-display text-xl font-bold tracking-tight text-[#1596ff]">
          Atheneum
        </p>

        <div className="hidden w-full max-w-md px-4 md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Explore thoughts..."
              className="w-full rounded-2xl bg-[#dfe3e6] py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#3f3fe3]/30 transition"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 md:hidden">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 focus:outline-none group"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-[#4e44d4] ring-2 ring-white" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl border border-slate-200/60 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                  {['all', 'unread', 'mentions'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition ${
                        activeFilter === filter
                          ? 'bg-[#3f3fe3] text-white'
                          : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                  {activeFilter !== 'all' && (
                    <button
                      onClick={() => setActiveFilter('all')}
                      className="ml-auto text-xs text-[#3f3fe3] hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Mark all as read */}
                {unreadCount > 0 && activeFilter !== 'unread' && (
                  <button className="w-full px-4 py-2 text-xs font-medium text-[#3f3fe3] hover:bg-[#f0f2f5] transition flex items-center gap-2">
                    <Check className="h-3.5 w-3.5" />
                    Mark all as read
                  </button>
                )}

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-[#f8f9fc] transition cursor-pointer border-b border-slate-50 last:border-0 ${
                          !notif.read ? 'bg-[#f9fafc]' : ''
                        }`}
                      >
                        {/* Avatar / Icon */}
                        <div className="relative shrink-0">
                          <img
                            src={notif.avatar}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <span className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ${notif.bg} flex items-center justify-center`}>
                            <notif.icon className={`h-2.5 w-2.5 ${notif.color}`} />
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{notif.time}</p>
                        </div>

                        {/* Unread indicator */}
                        {!notif.read && (
                          <span className="shrink-0 h-2 w-2 rounded-full bg-[#4e44d4] mt-2" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No notifications yet</p>
                      <p className="text-xs text-slate-400 mt-1">When activity happens, it'll show up here</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                  <a
                    href="#"
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-[#3f3fe3] hover:bg-[#f0f2f5] rounded-xl transition"
                  >
                    See more...
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 focus:outline-none group"
            >
              <img
                src={image}
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#3f3fe3]/30 transition"
              />
              <ChevronDown 
                className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl border border-slate-200/60 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* User Info Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-3">
                  <img
                    src={image}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user?.name || 'Guest User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email || 'guest@atheneum.app'}
                    </p>
                  </div>
                </div>

                {/* Navigation Sections */}
                {navSections.map((section, idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                      {section.title}
                    </h4>
                    <div className="space-y-1">
                      {section.items.map((item, i) => (
                        <a
                          key={i}
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-[#f0f2f5] hover:text-[#3f3fe3] transition group"
                        >
                          <item.icon className="h-4 w-4 text-slate-400 group-hover:text-[#3f3fe3] transition" />
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Related Content Section */}
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                    For You
                  </h4>
                  <div className="space-y-2">
                    {relatedContent.map((content, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-2 px-3 py-2 rounded-xl hover:bg-[#f8f9fc] transition cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {content.title}
                          </p>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#eef0ff] text-[#4e44d4]">
                          {content.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* See More & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <a
                    href="#"
                    className="block w-full text-center px-4 py-2 text-sm font-medium text-[#3f3fe3] hover:bg-[#f0f2f5] rounded-xl transition"
                  >
                    See more...
                  </a>
                  
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#f8f9fc] transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">Settings</span>
                    </div>
                  </div>
                  
                  <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-red-50 transition group">
                    <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-red-600">
                      Sign out
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}