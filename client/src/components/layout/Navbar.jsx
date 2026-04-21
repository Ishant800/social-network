import { useState } from 'react';
import { Search, Bell, MessageCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.png';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img src={Logo} className="h-30 w-50 rounded-xl" alt="Sanjal" />
          </Link>

          {/* Search Bar — Desktop */}
          <div className="hidden md:flex flex-1 max-w-md">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, posts, articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 text-sm transition-all"
              />
            </form>
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
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Messages"
            >
              <MessageCircle className="w-5 h-5" />
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}