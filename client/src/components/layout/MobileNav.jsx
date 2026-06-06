import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Home,
  Compass,
  PenSquare,
  User,
  Bell,
} from 'lucide-react';

export default function MobileNav() {
  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);

  const navItems = [
    { icon: Home, path: '/', label: 'Home', end: true },
    { icon: Compass, path: '/explore', label: 'Explore' },
    { icon: PenSquare, path: '/post/create', label: 'Create' },
    { icon: Bell, path: '/notifications', label: 'Notifications', badge: unreadCount },
    { icon: User, path: `/profile/${user?._id || user?.id || ''}`, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-teal-600'
                  : 'text-gray-500 active:bg-gray-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-teal-600' : 'text-gray-500'
                    }`}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${
                  isActive ? 'text-teal-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
