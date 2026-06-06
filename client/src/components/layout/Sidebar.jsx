import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Bookmark,
  Compass,
  VenetianMask,
  FileText,
  Home,
  PenSquare,
  Settings,
  Users,
  User,
} from 'lucide-react';

// ─── NavItem ────────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, path, end = false, badge }) {
  return (
    <NavLink
      to={path}
      end={end}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-teal-50 text-teal-700 '
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
          {badge && badge > 0 ? (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
              {badge > 99 ? '99+' : badge}
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
  const { user } = useSelector((s) => s.auth);

  // ─── Nav data with dynamic counts ───────────────────────────────────────────────────────────────────
  const mainNav = [
    { icon: Home,          label: 'Home',         path: '/',              end: true },
    { icon: Compass,       label: 'Explore',       path: '/explore'                  },
    { icon: Users,         label: 'Friends',       path: '/friendsexplore'           },
  ];

  const discoverNav = [
    { icon: VenetianMask, label: 'Confessions', path: '/confessions', accent: 'teal' },
  ];

  const profileNav = [
    { icon: User, label: 'My Profile', path: `/profile/${user?._id || user?.id || ''}` },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
  ];

  const createNav = [
    { icon: PenSquare, label: 'Write a Post',     path: '/post/create' },
    { icon: FileText,  label: 'Write an Article', path: '/blog/create' },
  ];

  return (
    <div className="h-full w-60 flex flex-col py-5 px-2">

      {/* ── Main navigation ─────────────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-0.5">

        {/* Section: Navigation */}
        {/* <SectionLabel>Navigation</SectionLabel> */}
        {mainNav.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}

        <div className="mt-0">
          {/* <SectionLabel>Anonymous</SectionLabel> */}
          {discoverNav.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        {/* Section: Profile */}
        <div className="mt-0">
          {/* <SectionLabel>Profile</SectionLabel> */}
          {profileNav.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        {/* Section: Create */}
        <div className="mt-0">
          {/* <SectionLabel>Create</SectionLabel> */}
          {createNav.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        {/* Section: Settings */}
        <div className="mt-0">
          {/* <SectionLabel>Settings</SectionLabel> */}
          <NavItem icon={Settings} label="Settings" path="/settings" />
        </div>
      </nav>

    </div>
  );
}