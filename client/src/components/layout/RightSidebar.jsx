import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { followUser, getUserSuggestions } from '../../features/users/userSlice';
import { UserPlus, TrendingUp, Sparkles, X, ChevronRight, Flame } from 'lucide-react';

export default function RightSidebar() {
  const dispatch = useDispatch();
  const { suggestions, isLoading, isError } = useSelector((s) => s.users);
  const [dismissedUsers, setDismissedUsers] = useState([]);
  const [following, setFollowing] = useState({});

  useEffect(() => {
    dispatch(getUserSuggestions(10));
  }, [dispatch]);

  const handleFollow = (userId) => {
    dispatch(followUser(userId));
    setFollowing((prev) => ({ ...prev, [userId]: true }));
  };

  const handleDismiss = (userId) => {
    setDismissedUsers((prev) => [...prev, userId]);
  };

  const visibleSuggestions = suggestions
    .filter((user) => !dismissedUsers.includes(user._id || user.id))
    .slice(0, 5);

  const trendingTopics = [
    { tag: 'React 19', posts: '12.5K' },
    { tag: 'Tailwind CSS', posts: '8.2K' },
    { tag: 'Next.js', posts: '6.8K' },
    { tag: 'TypeScript', posts: '5.1K' },
  ];

  const getAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff3f6&color=4b5563`;
  };

  return (
    <div className="space-y-6 sticky top-20">
      {/* Who to Follow */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Who to follow</h2>
          <Link to="/friends" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            See all
          </Link>
        </div>

        {isLoading && suggestions.length === 0 && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-28 rounded bg-gray-100" />
                  <div className="h-2.5 w-20 rounded bg-gray-50" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && visibleSuggestions.length > 0 && (
          <div className="space-y-4">
            {visibleSuggestions.map((user) => {
              const id = user._id || user.id;
              const name = user.profile?.fullName || user.username || 'User';
              const handle = user.username ? `@${user.username}` : '';
              const isFollowing = following[id];
              const avatar = user.profile?.avatar?.url || getAvatar(name);

              return (
                <div key={id} className="flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={avatar} alt={name} className="h-11 w-11 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-500 truncate">{handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isFollowing ? (
                      <span className="text-xs text-gray-500 px-3 py-1.5">Following</span>
                    ) : (
                      <button
                        onClick={() => handleFollow(id)}
                        className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition"
                      >
                        Follow
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(id)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && !isError && visibleSuggestions.length === 0 && (
          <p className="text-sm text-gray-500 py-4 text-center">No suggestions available</p>
        )}
      </div>

      {/* Trending */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Trending</h2>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic, idx) => (
            <div key={idx} className="group cursor-pointer py-1">
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition">
                {topic.tag}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{topic.posts} posts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Topics */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Suggested topics</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Technology', 'Design', 'Startups', 'AI', 'Open Source', 'Web Dev', 'Mobile', 'Cloud'].map((topic) => (
            <button
              key={topic}
              className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 text-xs font-medium hover:bg-gray-100 transition"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pt-4 pb-8">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400">
          <Link to="/terms" className="hover:text-gray-600 transition">Terms</Link>
          <Link to="/privacy" className="hover:text-gray-600 transition">Privacy</Link>
          <Link to="/about" className="hover:text-gray-600 transition">About</Link>
          <Link to="/help" className="hover:text-gray-600 transition">Help</Link>
        </div>
        <p className="mt-3 text-xs text-gray-400">© 2024 Atheneum</p>
      </div>
    </div>
  );
}