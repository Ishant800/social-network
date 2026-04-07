import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bookmark,
  ChevronDown,
  Compass,
  FileText,
  Home,
  PenSquare,
  PlusCircle,
  Settings,
  User,
  Users,
  Heart,
  MessageCircle,
  Bell,
  Flag
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Users, label: 'Friends', path: '/friendsexplore' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: MessageCircle, label: 'Messages', path: '/chats' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Heart, label: 'Liked Posts', path: '/liked' },
  { icon: Bookmark, label: 'Saved', path: '/saved' },
  { icon: Flag, label: 'Pages', path: '/pages' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  return (
    <div className="h-screen w-64 fixed left-0 top-0 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tight">SocialHub</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Create Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Create</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
          </button>

          {showCreateMenu && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              <NavLink
                to="/post/create"
                onClick={() => setShowCreateMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <PenSquare className="w-4 h-4" />
                <span>Create Post</span>
              </NavLink>
              <NavLink
                to="/blog/create"
                onClick={() => setShowCreateMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
              >
                <FileText className="w-4 h-4" />
                <span>Write Article</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}