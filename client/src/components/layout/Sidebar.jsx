import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Bookmark,
  Compass,
  FileText,
  Home,
  Mic,
  PenSquare,
  Settings,
  Users,
  User,
  MessagesSquare,
  VenetianMask,
} from 'lucide-react';

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

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);

  const mainNav = [
    { icon: Home, label: 'Home', path: '/', end: true },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Users, label: 'Friends', path: '/friendsexplore' },
    { icon: MessagesSquare, label: 'Live Discussions', path: '/discussions' },
  ];

  const discoverNav = [
    { icon: VenetianMask, label: 'Confessions', path: '/confessions' },
    { icon: Mic, label: 'Voice Stories', path: '/voice-stories' },
  ];

  const profileNav = [
    { icon: User, label: 'My Profile', path: `/profile/${user?._id || user?.id || ''}` },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
  ];

  const createNav = [
    { icon: PenSquare, label: 'Write a Post', path: '/post/create' },
    { icon: FileText, label: 'Write a Blog', path: '/blog/create' },
  ];

  return (
    <div className="h-full w-60 flex flex-col py-5 px-2">
      <nav className="flex-1 flex flex-col gap-0.5">
        {mainNav.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}

        <div className="mt-4 pt-4 border-t border-slate-100">
          {discoverNav.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        <div className="mt-0">
          {profileNav.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        <div className="mt-0">
          {createNav.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        <div className="mt-0">
          <NavItem icon={Settings} label="Settings" path="/settings" />
        </div>
      </nav>
    </div>
  );
}
