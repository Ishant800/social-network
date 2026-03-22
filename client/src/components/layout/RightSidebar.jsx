import { useNavigate } from 'react-router-dom';

const suggestedUsers = [
  {
    name: 'Julian K.',
    handle: '@j_visuals',
    avatar: 'https://i.pravatar.cc/120?u=julian-k',
  },
  {
    name: 'Sarah Chen',
    handle: '@schen_writes',
    avatar: 'https://i.pravatar.cc/120?u=sarah-chen',
  },
];

const trendingTopics = [
  { category: 'Social Media', topic: '#EditorialShift', posts: '12.4k posts' },
  { category: 'Design', topic: 'Asymmetric Layouts', posts: '8.2k posts' },
  { category: 'Technology', topic: 'Ethical AI Feed', posts: '21.5k posts' },
];

export default function RightSidebar() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-display text-base font-bold text-slate-900">Trending topics</h2>
        <div className="mt-4 space-y-4">
          {trendingTopics.map((item) => (
            <button
              key={item.topic}
              type="button"
              onClick={() => navigate('/explore')}
              className="block w-full text-left"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                {item.category}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-slate-900">{item.topic}</h3>
              <p className="mt-1 text-xs text-slate-500">{item.posts}</p>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="mt-4 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
        >
          View more
        </button>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-display text-base font-bold text-slate-900">Who to follow</h2>
        <div className="mt-4 space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.handle} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.handle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/friendsexplore')}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-1 pb-8 text-[11px] text-slate-500">
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Cookies</span>
        </div>
        <p className="mt-3">© 2024 Atheneum Inc.</p>
      </footer>
    </div>
  );
}
