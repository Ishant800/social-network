import { Bell, Home, Plus, User, Search, MessageCircle, Compass } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

function TabLink({ to, end, icon, label, badge }) {
  const Icon = icon;
  const location = useLocation();
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
  
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive: navActive }) => {
        const active = navActive !== undefined ? navActive : isActive;
        return `flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[0.65rem] font-medium transition-all duration-200 ${
          active 
            ? 'text-blue-600 bg-blue-50/50' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`;
      }}
    >
      {({ isActive: navActive }) => {
        const active = navActive !== undefined ? navActive : isActive;
        return (
          <div className="relative">
            <Icon className={`h-5 w-5 transition-all ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {badge && badge > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </div>
        );
      }}
    </NavLink>
  );
}

export default function MobileNav() {
  const location = useLocation();
  const isCreatePage = location.pathname === '/post/create' || location.pathname === '/blog/create';
  
  // Example badge counts (connect to your real data)
  const notificationCount = 3;
  const messageCount = 2;

  if (isCreatePage) return null;

  return (
    <>
      {/* Spacer to prevent content hiding behind nav */}
      <div className="h-[72px]" />
      
      <nav
        className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="relative mx-auto flex items-center justify-between gap-1 px-3">
          {/* Home */}
          <TabLink to="/" end icon={Home} label="Home" />

          {/* Search */}
          <TabLink to="/explore" icon={Search} label="Explore" />

          {/* Create Button - Floating */}
          <div className="relative -top-5">
            <NavLink
              to="/post/create"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-white transition-all active:scale-95 hover:shadow-xl"
              aria-label="Create post"
            >
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </NavLink>
          </div>

          {/* Messages */}
          <TabLink to="/chats" icon={MessageCircle} label="Messages" badge={messageCount} />

          {/* Notifications */}
          <TabLink to="/notifications" icon={Bell} label="Alerts" badge={notificationCount} />

          {/* Profile */}
          <TabLink to="/profile" icon={User} label="Profile" />
        </div>
      </nav>
    </>
  );
}