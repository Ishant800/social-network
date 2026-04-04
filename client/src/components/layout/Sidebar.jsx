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
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: PlusCircle, label: 'Share Thoughts', type: 'create' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  return (
    <div className="flex h-full flex-col px-6 ">
      <div>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            item.type === 'create' ? (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setShowCreateMenu((value) => !value)}
                  className="group flex w-full items-center justify-between py-3 pl-4 text-left text-slate-600 transition-all duration-200 hover:bg-teal-50 hover:text-teal-800"
                >
                  <span className="flex items-center gap-4">
                    <item.icon className="h-5 w-5" />
                    <span className="font-display text-[1.05rem]">{item.label}</span>
                  </span>
                  <ChevronDown
                    className={`mr-3 h-4 w-4 transition ${showCreateMenu ? 'rotate-180 text-teal-700' : 'text-slate-400'}`}
                  />
                </button>

                {showCreateMenu && (
                  <div className="ml-9 mt-1 space-y-1">
                    <NavLink
                      to="/post/create"
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-slate-600 transition hover:bg-teal-50 hover:text-teal-800"
                    >
                      <PenSquare className="h-4 w-4" />
                      <span>Create Post</span>
                    </NavLink>

                    <NavLink
                      to="/blog/create"
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-slate-600 transition hover:bg-teal-50 hover:text-teal-800"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Write Article</span>
                    </NavLink>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `group flex items-center gap-4 py-3 pl-4 transition-all duration-200 ${
                    isActive
                      ? ' font-bold text-teal-700 '
                      : 'text-slate-600 hover:bg-teal-50 hover:text-teal-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-teal-700 ' : ''}`} />
                    <span className={`font-display text-[1.05rem] ${isActive ? 'text-teal-800' : ''}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          ))}
        </nav>
      </div>
    </div>
  );
}
