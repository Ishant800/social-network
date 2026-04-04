import { LogOut, MessageCircle, Settings, Bell, Compass } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { resetFeed } from '../../features/post/postSlice';

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const displayName = user?.profile?.fullName || user?.username || 'You';
  const avatarUrl =
    user?.profile?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ccfbf1&color=115e59`;

  const handleLogout = () => {
    dispatch(resetFeed());
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-6 lg:gap-10">
        <Link
          to="/"
          className="shrink-0 font-display text-lg font-bold tracking-tight text-teal-700 sm:text-xl"
        >
          Atheneum
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/explore" className={navClass}>
            Explore
          </NavLink>
          <NavLink
            to="/friendsexplore"
            className={({ isActive }) =>
              `hidden rounded-lg px-3 py-2 text-sm font-semibold transition lg:inline-flex ${
                isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            People
          </NavLink>
          <NavLink to="/notifications" className={navClass}>
            <span className="inline-flex items-center gap-1.5">
              <Bell className="h-4 w-4" />
              Alerts
            </span>
          </NavLink>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Link
          to="/post/create"
          className="hidden rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 sm:inline-flex"
        >
          New post
        </Link>
        <Link
          to="/explore"
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 md:hidden"
          aria-label="Explore"
        >
          <Compass className="h-5 w-5" />
        </Link>
        <Link
          to="/chats"
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
          aria-label="Messages"
        >
          <MessageCircle className="h-5 w-5" />
        </Link>
        <Link
          to="/settings"
          className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 sm:flex"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
        <Link to="/profile" className="ml-0.5">
          <img
            src={avatarUrl}
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-200 sm:h-10 sm:w-10"
          />
        </Link>
      </div>
    </div>
  );
}
