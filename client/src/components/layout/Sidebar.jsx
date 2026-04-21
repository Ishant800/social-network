import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bookmark,
  Compass,
  FileText,
  Home,
  PenSquare,
  Settings,
  Users,
  MessageCircle,
  Bell,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice';

// ─── Nav data ───────────────────────────────────────────────────────────────────
const mainNav = [
  { icon: Home,          label: 'Home',         path: '/',              end: true },
  { icon: Compass,       label: 'Explore',       path: '/explore'                  },
  { icon: Users,         label: 'Friends',       path: '/friendsexplore'           },
  { icon: MessageCircle, label: 'Messages',      path: '/chats'                    },
  { icon: Bell,          label: 'Notifications', path: '/notifications', badge: 3  },
  { icon: Bookmark,      label: 'Saved',         path: '/bookmarks'                },
];

const createNav = [
  { icon: PenSquare, label: 'Write a Post',     path: '/post/create' },
  { icon: FileText,  label: 'Write an Article', path: '/blog/create' },
];

// ─── NavItem ────────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, path, end = false, badge }) {
  return (
    <NavLink
      to={path}
      end={end}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-teal-50 text-teal-700 shadow-[inset_3px_0_0_#0d9488]'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`w-[18px] h-[18px] shrink-0 transition-colors ${
              isActive
                ? 'text-teal-600'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          <span className="flex-1 leading-none truncate">{label}</span>
          {badge ? (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
              {badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

// ─── Section label ──────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 select-none">
      {children}
    </p>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);

  const displayName = user?.profile?.fullName || user?.username || 'You';
  const handle      = user?.username ? `@${user.username}` : '';
  const avatarUrl   =
    user?.profile?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0d9488&color=ffffff`;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="h-full w-60 flex flex-col py-5 px-2">

      {/* ── Main navigation ─────────────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-0.5">

        {/* Section: Navigation */}
        <SectionLabel>Navigation</SectionLabel>
        {mainNav.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}

        {/* Section: Create */}
        <div className="mt-5">
          <SectionLabel>Create</SectionLabel>
          {createNav.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>
      </nav>

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className="my-4 border-t border-slate-100" />

      {/* ── Bottom ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        <NavItem icon={Settings} label="Settings" path="/settings" />

        {/* Profile card */}
        <div className="mt-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm">
          {/* Avatar row */}
          <div className="flex items-center gap-2.5">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                {handle}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* View profile link */}
          <NavLink
            to="/profile"
            className="mt-2.5 flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-100 text-[11px] font-medium text-slate-500 hover:border-teal-200 hover:text-teal-700 hover:bg-teal-50 transition-all"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              View my profile
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          </NavLink>
        </div>
      </div>

    </div>
  );
}