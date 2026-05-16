import { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageCircle, Loader2, LogOut, User, Settings } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import Logo from '../../assets/logo.png';
import API from '../../api/axios';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { unreadCount: messageCount } = useSelector((state) => state.messages);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await API.get(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (response.data.success) {
          const { users, posts, blogs } = response.data.results;
          setSuggestions({ users: users.slice(0, 5), posts: posts.slice(0, 3), blogs: blogs.slice(0, 3) });
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchMobile(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowSuggestions(false);
    setShowSearchMobile(false);
  };

  const totalResults = (suggestions.users?.length || 0) + (suggestions.posts?.length || 0) + (suggestions.blogs?.length || 0);

  const displayName = user?.profile?.fullName || user?.username || 'Account';
  const navAvatarUrl =
    user?.profile?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e2e8f0&color=475569&bold=true`;

  const handleLogout = () => {
    setAccountMenuOpen(false);
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-full w-full">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">

          <Link to="/" className="flex items-center shrink-0 rounded-xl ring-1 ring-transparent hover:ring-teal-100 transition">
            <img src={Logo} className="h-9 w-auto max-h-10 object-contain" alt="Sanjal" />
          </Link>

          {/* Search Bar — Desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, posts, blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200/90 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-400/80 text-sm transition-all placeholder:text-slate-400"
              />
              {loadingSuggestions && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && totalResults > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 surface-card rounded-xl max-h-96 overflow-y-auto thin-scrollbar z-50">
                {/* Users */}
                {suggestions.users && suggestions.users.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">Users</p>
                    {suggestions.users.map(user => {
                      const name = user.profile?.fullName || user.username;
                      const avatar =
                        user.profile?.avatar?.url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f0fdfa&color=0f766e`;
                      return (
                        <button
                          key={user._id}
                          onClick={() => handleSuggestionClick(`/profile/${user._id}`)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-left"
                        >
                          <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Posts */}
                {suggestions.posts && suggestions.posts.length > 0 && (
                  <div className="p-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">Posts</p>
                    {suggestions.posts.map(post => (
                      <button
                        key={post._id}
                        onClick={() => handleSuggestionClick(`/post/${post._id}`)}
                        className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
                          {post.tags && post.tags.length > 0 && (
                            <p className="text-xs text-teal-600 mt-1">#{post.tags[0]}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Blogs */}
                {suggestions.blogs && suggestions.blogs.length > 0 && (
                  <div className="p-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">Blogs</p>
                    {suggestions.blogs.map(blog => (
                      <button
                        key={blog._id}
                        onClick={() => handleSuggestionClick(`/blog/${blog._id}`)}
                        className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{blog.title}</p>
                          {blog.category?.name && (
                            <p className="text-xs text-gray-500 mt-0.5">{blog.category.name}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* View All Results */}
                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={() => handleSuggestionClick(`/search?q=${encodeURIComponent(searchQuery.trim())}`)}
                    className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-2"
                  >
                    View all results
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right icon group */}
          <div className="flex items-center gap-1">

            {/* Search Icon — Mobile only */}
            <div className="flex md:hidden items-center">
              {showSearchMobile ? (
                <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-44 pl-8 pr-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSearchMobile(false)}
                    className="text-xs text-gray-500 whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearchMobile(true)}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Messages */}
            <Link
              to="/chats"
              className="relative p-2 rounded-full text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              aria-label="Messages"
            >
              <MessageCircle className="w-5 h-5" />
              {messageCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {messageCount > 99 ? '99+' : messageCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-full text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {token && (
              <div className="relative pl-1" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((o) => !o)}
                  className="flex items-center rounded-full border border-slate-200 p-0.5 hover:bg-teal-50/60 hover:border-teal-200 transition-colors"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                >
                  <img
                    src={navAvatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </button>
                {accountMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200/90 bg-white py-1 shadow-[var(--shadow-float)] z-[60]"
                    role="menu"
                  >
                    <p className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 truncate">
                      {displayName}
                    </p>
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4 text-gray-400" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}