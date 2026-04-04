import { Bell, Home, Plus, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

function TabLink({ to, end, icon, label }) {
  const Icon = icon;
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide transition active:scale-95 ${
          isActive ? 'text-teal-700' : 'text-slate-500'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-6 w-6" strokeWidth={isActive ? 2.25 : 2} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-white/95 px-2 pt-2 backdrop-blur-xl"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="relative mx-auto flex max-w-lg items-end justify-between gap-1">
        <TabLink to="/" end icon={Home} label="Home" />

        <NavLink
          to="/post/create"
          className="absolute left-1/2 top-[-26px] flex h-[3.25rem] w-[3.25rem] -translate-x-1/2 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-700/30 ring-[5px] ring-[var(--bg-page-2)] transition active:scale-95"
          aria-label="Create post"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </NavLink>

        <TabLink to="/notifications" icon={Bell} label="Alerts" />

        <TabLink to="/profile" icon={User} label="Profile" />
      </div>
    </nav>
  );
}
