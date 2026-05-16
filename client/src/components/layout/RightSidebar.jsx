import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { followUser, getUserSuggestions } from '../../features/users/userSlice';
import axios from '../../api/axios';
import { 
  X, 
  ChevronRight, 
  Users, 
  Bookmark, 
  Bell, 
  Star,
  MessageCircle,
  Heart,
  Eye
} from 'lucide-react';

export default function RightSidebar() {
  const dispatch = useDispatch();
  const { suggestions, isLoading, isError } = useSelector((s) => s.users);
  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const { items: bookmarks } = useSelector((s) => s.bookmarks);
  
  const [dismissedUsers, setDismissedUsers] = useState([]);
  const [following, setFollowing] = useState({});
  const [weeklyStats, setWeeklyStats] = useState({
    likesReceived: 0,
    commentsReceived: 0,
    profileViews: 0,
    newFollowers: 0,
    postsCreated: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    dispatch(getUserSuggestions(5));
    fetchWeeklyStats();
  }, [dispatch]);

  const fetchWeeklyStats = async () => {
    try {
      setLoadingStats(true);
      const response = await axios.get('/user/weekly-stats');
      if (response.data.success) {
        setWeeklyStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      // Set default stats on error
      setWeeklyStats({
        likesReceived: 0,
        commentsReceived: 0,
        profileViews: 0,
        newFollowers: 0,
        postsCreated: 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleFollow = (userId) => {
    dispatch(followUser(userId));
    setFollowing((prev) => ({ ...prev, [userId]: true }));
  };

  const handleDismiss = (userId) => {
    setDismissedUsers((prev) => [...prev, userId]);
  };

  const visibleSuggestions = suggestions
    .filter((user) => !dismissedUsers.includes(user._id || user.id))
    .slice(0, 3);

  const getAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff3f6&color=4b5563`;
  };

  const userStats = {
    posts: user?.stats?.posts || 0,
    followers: user?.followers?.length || 0,
    following: user?.following?.length || 0,
  };

  return (
    <div className="space-y-5 p-4 pb-10">
      <div className="surface-card rounded-2xl p-4">
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Your activity</h2>
        <div className="grid grid-cols-3 gap-2">
          <Link
            to="/profile"
            className="rounded-xl bg-teal-50/60 px-2 py-3 text-center transition hover:bg-teal-100/80"
          >
            <div className="font-display text-xl font-bold text-slate-900">{userStats.posts}</div>
            <div className="mt-0.5 text-[11px] font-medium text-slate-500">Posts</div>
          </Link>
          <Link
            to="/profile"
            className="rounded-xl bg-slate-50 px-2 py-3 text-center transition hover:bg-slate-100"
          >
            <div className="font-display text-xl font-bold text-slate-900">{userStats.followers}</div>
            <div className="mt-0.5 text-[11px] font-medium text-slate-500">Followers</div>
          </Link>
          <Link
            to="/profile"
            className="rounded-xl bg-slate-50 px-2 py-3 text-center transition hover:bg-slate-100"
          >
            <div className="font-display text-xl font-bold text-slate-900">{userStats.following}</div>
            <div className="mt-0.5 text-[11px] font-medium text-slate-500">Following</div>
          </Link>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Who to Follow */}
      {visibleSuggestions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Who to follow</h2>
            <Link to="/friendsexplore" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              See all
            </Link>
          </div>

          {isLoading && suggestions.length === 0 && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 rounded bg-gray-100" />
                    <div className="h-2 w-16 rounded bg-gray-50" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !isError && visibleSuggestions.length > 0 && (
            <div className="space-y-3">
              {visibleSuggestions.map((user) => {
                const id = user._id || user.id;
                const name = user.profile?.fullName || user.username || 'User';
                const handle = user.username ? `@${user.username}` : '';
                const isFollowing = following[id];
                const avatar = user.profile?.avatar?.url || getAvatar(name);

                return (
                  <div key={id} className="flex items-center justify-between gap-2 group">
                    <Link to={`/profile/${id}`} className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-70 transition">
                      <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-500 truncate">{handle}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      {isFollowing ? (
                        <span className="text-xs text-gray-500">Following</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleFollow(id)}
                          className="text-xs font-semibold text-teal-600 transition hover:text-teal-800"
                        >
                          Follow
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(id)}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="surface-card rounded-2xl p-4">
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">This week</h2>
        {loadingStats ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="h-3 w-28 bg-gray-100 rounded" />
                <div className="h-3 w-6 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span className="text-gray-600">Likes received</span>
              </div>
              <span className="font-semibold text-gray-900">{weeklyStats.likesReceived}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-gray-600">Comments</span>
              </div>
              <span className="font-semibold text-gray-900">{weeklyStats.commentsReceived}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-green-500" />
                <span className="text-gray-600">Profile views</span>
              </div>
              <span className="font-semibold text-gray-900">{weeklyStats.profileViews}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-gray-600">New followers</span>
              </div>
              <span className="font-semibold text-gray-900">{weeklyStats.newFollowers}</span>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="surface-card rounded-2xl p-4">
        <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick access</h2>
        <div className="space-y-1">
          <Link 
            to="/bookmarks" 
            className="flex items-center justify-between py-2 hover:opacity-70 transition group"
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="h-4 w-4 text-teal-500/80" />
              <span className="text-sm font-medium text-slate-700">Saved items</span>
            </div>
            <div className="flex items-center gap-2">
              {bookmarks?.length > 0 && (
                <span className="text-xs text-gray-500">
                  {bookmarks.length}
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </Link>

          <Link 
            to="/notifications" 
            className="flex items-center justify-between py-2 hover:opacity-70 transition group"
          >
            <div className="flex items-center gap-2.5">
              <Bell className="h-4 w-4 text-amber-500/90" />
              <span className="text-sm font-medium text-slate-700">Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                  {unreadCount}
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </Link>

          <Link 
            to="/chats" 
            className="flex items-center justify-between py-2 hover:opacity-70 transition group"
          >
            <div className="flex items-center gap-2.5">
              <MessageCircle className="h-4 w-4 text-teal-500/80" />
              <span className="text-sm font-medium text-slate-700">Messages</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="surface-card rounded-2xl p-4">
        <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Create</h2>
        <div className="space-y-0.5">
          <Link
            to="/post/create"
            className="flex items-center gap-2.5 rounded-lg py-2 transition hover:bg-teal-50/60"
          >
            <Star className="h-4 w-4 text-teal-600" />
            <span className="text-sm font-medium text-slate-700">Write a post</span>
          </Link>
          <Link
            to="/blog/create"
            className="flex items-center gap-2.5 rounded-lg py-2 transition hover:bg-teal-50/60"
          >
            <Star className="h-4 w-4 text-teal-700" />
            <span className="text-sm font-medium text-slate-700">Write an article</span>
          </Link>
        </div>
      </div>

      <div className="px-1 pt-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
          <Link to="/terms" className="transition hover:text-teal-700">
            Terms
          </Link>
          <span aria-hidden>·</span>
          <Link to="/privacy" className="transition hover:text-teal-700">
            Privacy
          </Link>
          <span aria-hidden>·</span>
          <Link to="/about" className="transition hover:text-teal-700">
            About
          </Link>
          <span aria-hidden>·</span>
          <Link to="/help" className="transition hover:text-teal-700">
            Help
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">© 2026 Sanjal</p>
      </div>
    </div>
  );
}
