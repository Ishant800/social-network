import { Bell, Compass, Home, Plus, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Explore', path: '/friendsexplore' },
  { icon: Bell, label: 'Saved', path: '/bookmarks' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function MobileNav() {
  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/70 bg-white/90 px-4 pb-6 pt-3 backdrop-blur-xl lg:hidden">
        <div className="relative flex items-end justify-between">
          {items.slice(0, 2).map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex min-w-[68px] flex-col items-center rounded-2xl px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] transition ${
                  isActive ? 'bg-[#eceeff] text-[#3f3fe3]' : 'text-slate-400'
                }`
              }
            >
              <item.icon className="mb-1 h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <NavLink
            to="/post/create"
            className="absolute left-1/2 top-[-32px] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-[#4e44d4] text-white shadow-[0_24px_48px_-20px_rgba(78,68,212,0.8)] ring-4 ring-[#f5f7f9]"
          >
            <Plus className="h-7 w-7" />
          </NavLink>

          {items.slice(2).map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex min-w-[68px] flex-col items-center rounded-2xl px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] transition ${
                  isActive ? 'bg-[#eceeff] text-[#3f3fe3]' : 'text-slate-400'
                }`
              }
            >
              <item.icon className="mb-1 h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
