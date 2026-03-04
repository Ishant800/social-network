import { NavLink } from 'react-router-dom';
import { Home, Compass, MessageSquare, User, Bookmark, Settings, LogOut, User2 } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: MessageSquare, label: 'Messages', path: '/chats' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: User2, label: 'Find Friend', path: '/friendsexplore' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex flex-col h-full select-none pr-2">
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group
              ${isActive 
                ? 'bg-indigo-400 text-white shadow-lg shadow-indigo-100 translate-x-1' 
                : 'text-slate-600 hover:bg-white hover:text-indigo-400 hover:shadow-sm'}
            `}
          >
            <item.icon className="w-6 h-6" />
            <span className="font-bold text-[16px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pb-4 pt-4 border-t border-gray-200/60">
        <button className="flex items-center gap-4 px-5 py-4 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all font-bold">
          <LogOut className="w-6 h-6" />
          <span className="text-[16px]">Logout</span>
        </button>
      </div>
    </div>
  );
}