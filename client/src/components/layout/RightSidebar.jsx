import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { followUser, getUserSuggestions } from '../../features/users/userSlice';

export default function RightSidebar() {
  const dispatch = useDispatch();
  const { suggestions, isLoading, isError } = useSelector((s) => s.users);

  useEffect(() => {
    dispatch(getUserSuggestions(6));
  }, [dispatch]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold text-slate-900">Who to follow</h2>
          <Link to="/friendsexplore" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
            See all
          </Link>
        </div>

        {isLoading && suggestions.length === 0 && (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-slate-200" />
                  <div className="h-2 w-20 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <p className="mt-4 text-sm text-slate-500">Could not load suggestions.</p>
        )}

        {!isLoading && !isError && suggestions.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">No suggestions right now. Invite friends to join.</p>
        )}

        <div className="mt-4 space-y-3">
          {suggestions.map((user) => {
            const id = user._id || user.id;
            const name = user.profile?.fullName || user.username || 'User';
            const handle = user.username ? `@${user.username}` : '';
            const avatar =
              user.profile?.avatar?.url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ccfbf1&color=115e59`;

            return (
              <div key={id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <img src={avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                    <p className="truncate text-xs text-slate-500">{handle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch(followUser(id))}
                  className="shrink-0 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100"
                >
                  Follow
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="px-1 pb-8 text-[11px] text-slate-500">
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          <span>Terms</span>
          <span>Privacy</span>
        </div>
        <p className="mt-3 text-slate-400">© {new Date().getFullYear()} Atheneum</p>
      </footer>
    </div>
  );
}
