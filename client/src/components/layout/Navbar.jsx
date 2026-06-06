import { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageCircle, Loader2, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { logout } from '@/features/auth/authSlice';
import Logo from '@/assets/logo.png';
import API from '@/api/axios';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState({ users: [], posts: [], blogs: [] });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const searchRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [urlSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { unreadCount: messageCount } = useSelector((state) => state.messages);

  useEffect(() => {
    if (location.pathname === '/search') {
      setSearchQuery(urlSearchParams.get('q') || '');
    }
  }, [location.pathname, urlSearchParams]);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions({ users: [], posts: [], blogs: [] });
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await API.get('/search', {
          params: { q: searchQuery.trim(), preview: true },
        });
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
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToSearchResults = (keyword) => {
    const q = keyword.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setShowSearchMobile(false);
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    goToSearchResults(searchQuery);
  };

  const handleSuggestionClick = (path) => {
    navigate(path);
    if (!path.startsWith('/search')) {
      setSearchQuery('');
    }
    setShowSuggestions(false);
    setShowSearchMobile(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getUserAvatar = () => {
    return user?.profile?.avatar?.url || user?.profile?.avatar || 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg';
  };

  const getUserName = () => {
    return user?.profile?.fullName || user?.username || 'User';
  };

  const totalResults = (suggestions.users?.length || 0) + (suggestions.posts?.length || 0) + (suggestions.blogs?.length || 0);

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">

          <Link to="/" className="flex items-center shrink-0">
            <img src={Logo} className="h-30 w-50 rounded-xl" alt="Sanjal" />
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
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200/90 bg-slate-50/80 focus:bg-white focus:border-teal-400/80 text-sm transition-all placeholder:text-slate-400 outline-none"
              />
              {loadingSuggestions && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim().length >= 2 && !loadingSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                {totalResults === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">No results found.</div>
                ) : (
                <>
                {/* Users */}
                {suggestions.users && suggestions.users.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">Users</p>
                    {suggestions.users.map(user => {
                      const name = user.profile?.fullName || user.username;
                      const avatar = user.profile?.avatar?.url || `https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg`;
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
                          {(post.tags?.length > 0 || post.category) && (
                            <p className="text-xs text-blue-600 mt-1">
                              {post.tags?.[0] ? `#${post.tags[0]}` : post.category}
                            </p>
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
                          {blog.category && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {typeof blog.category === 'string' ? blog.category : blog.category.name}
                            </p>
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
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                  >
                    View all results
                  </button>
                </div>
                </>
                )}
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
                      className="w-44 pl-8 pr-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400"
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
              className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
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
              className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Profile menu"
              >
                <img 
                  src={getUserAvatar()} 
                  alt={getUserName()}
                  className="w-12 h-12 rounded-full object-cover border-gray-200"
                  onError={(e) => {
                    e.target.src = 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg';
                  }}
                />
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{getUserName()}</p>
                    <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to={`/profile/${user?._id}`}
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}