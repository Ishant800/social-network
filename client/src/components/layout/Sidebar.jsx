import { NavLink } from 'react-router-dom';
import { Bookmark, Compass, Home, Plus, Settings, User } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  return (
    <div className="flex h-full flex-col px-6 ">
      <div>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-4 py-3 pl-4 transition-all duration-200 ${
                  isActive
                    ? ' font-bold text-indigo-700 '
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-700 ' : ''}`} />
                  <span className={`font-display text-[1.05rem] ${isActive ? 'text-indigo-700' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
     </div>
  );
}
