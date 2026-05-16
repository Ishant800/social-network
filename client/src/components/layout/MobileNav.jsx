import { Bell, Home, Plus, User, Search, MessageCircle, LogOut } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

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
            ? 'text-teal-700 bg-teal-50' 
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isCreatePage = location.pathname === '/post/create' || location.pathname === '/blog/create';
  
  // Get dynamic counts from Redux store
  const { unreadCount } = useSelector((state) => state.notifications);
  const { unreadCount: messageCount } = useSelector((state) => state.messages);

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  if (isCreatePage) return null;

  return (
    <>
      {/* Spacer to prevent content hiding behind nav */}
      <div className="h-[72px]" />
      
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-soft)] bg-white/90 backdrop-blur-xl shadow-[0_-8px_32px_rgba(15,23,42,0.06)]"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="relative mx-auto flex items-stretch justify-between gap-0.5 px-2 overflow-x-auto">
          {/* Home */}
          <TabLink to="/" end icon={Home} label="Home" />

          {/* Search */}
          <TabLink to="/explore" icon={Search} label="Explore" />

          {/* Create Button - Floating */}
          <div className="relative -top-5">
            <NavLink
              to="/post/create"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-600/35 ring-4 ring-white transition-all active:scale-95 hover:shadow-xl hover:from-teal-400 hover:to-teal-600"
              aria-label="Create post"
            >
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </NavLink>
          </div>

          {/* Messages */}
          <TabLink to="/chats" icon={MessageCircle} label="Messages" badge={messageCount} />

          {/* Notifications */}
          <TabLink to="/notifications" icon={Bell} label="Alerts" badge={unreadCount} />

          {/* Profile */}
          <TabLink to="/profile" icon={User} label="Profile" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-[3.25rem] min-w-[3.25rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[0.65rem] font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5 stroke-[2.2]" />
            <span className="text-[0.65rem] leading-none">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}