import { useState } from 'react';
import { Search, User, Bell, MessageCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  
  // Get user display name
  const displayName = user?.profile?.fullName || user?.username || 'User';
  
  // Get avatar URL
  const avatarUrl = user?.profile?.avatar?.url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=ffffff`;

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo - reduced left margin */}
          <Link to="/" className="flex items-center shrink-0 -ml-2 sm:ml-0">
            {/* Mobile logo */}
            <span className="text-xl font-bold text-blue-600 block sm:hidden px-2">
              A
            </span>
            {/* Desktop logo */}
            <span className="text-xl font-bold text-blue-600 hidden sm:block px-2">
              Atheneum
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search users, posts, articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-sm border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 text-sm"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </form>
          </div>

          {/* Right Section - Icons + Profile */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Search Icon - Mobile */}
            <div className="flex md:hidden items-center">
              {showSearchMobile ? (
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 pl-8 pr-3 py-1.5 rounded-full border border-gray-300 bg-gray-50 text-sm"
                    autoFocus
                  />
                  <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowSearchMobile(false)}
                    className="ml-2 text-xs text-gray-500"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearchMobile(true)}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Messages Icon */}
            <Link 
              to="/chats" 
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Messages"
            >
              <MessageCircle className="w-5 h-5" />
            </Link>

            {/* Notifications Icon */}
            <Link 
              to="/notifications" 
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Notification badge - shows if unread */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>

            {/* Profile Section - Desktop */}
            <Link 
              to="/profile" 
              className="hidden md:flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors ml-1"
            >
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{displayName}</span>
                <span className="text-xs text-gray-500">Profile</span>
              </div>
            </Link>

            {/* Profile Icon - Mobile */}
            <Link to="/profile" className="flex md:hidden p-1">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}