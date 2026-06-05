import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { followUser, getUserSuggestions } from '../../features/users/userSlice';
import axios from '../../api/axios';
import { 
  X, 
  MessageCircle,
  Heart,
  Eye
} from 'lucide-react';

// The anonymous placeholder image
const ANONYMOUS_AVATAR = "data:image/jpeg;base64,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";


export default function RightSidebar() {
  const dispatch = useDispatch();
  const { suggestions, isLoading, isError } = useSelector((s) => s.users);
  
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
    dispatch(getUserSuggestions(6));
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
    .slice(0, 6);

  const getAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff3f6&color=4b5563`;
  };

  return (
<<<<<<< Updated upstream
    <div className="space-y-6 sticky top-20 p-4">
      {/* Quick Stats */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Activity</h2>
        <div className="grid grid-cols-3 gap-4">
          <Link to="/profile" className="text-center hover:opacity-70 transition">
            <div className="text-xl font-bold text-gray-900">{userStats.posts}</div>
            <div className="text-xs text-gray-500 mt-0.5">Posts</div>
          </Link>
          <Link to="/profile" className="text-center hover:opacity-70 transition">
            <div className="text-xl font-bold text-gray-900">{userStats.followers}</div>
            <div className="text-xs text-gray-500 mt-0.5">Followers</div>
          </Link>
          <Link to="/profile" className="text-center hover:opacity-70 transition">
            <div className="text-xl font-bold text-gray-900">{userStats.following}</div>
            <div className="text-xs text-gray-500 mt-0.5">Following</div>
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-100" />

=======
    <div className="space-y-5 p-4 pb-10">
>>>>>>> Stashed changes
      {/* Who to Follow */}
      {visibleSuggestions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Who to follow</h2>
            <Link to="/friendsexplore" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              See all
            </Link>
          </div>

          {isLoading && suggestions.length === 0 && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
                // Check if avatar exists, otherwise use anonymous placeholder
                const avatar = user.profile?.avatar?.url 
                  ? user.profile.avatar.url 
                  : ANONYMOUS_AVATAR;
                
                const isFollowing = following[id];

                return (
                  <div key={id} className="flex items-center justify-between gap-2 group">
                    <Link to={`/profile/${id}`} className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-70 transition">
                      <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover bg-gray-100" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                        {/* Username removed as requested */}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      {isFollowing ? (
                        <span className="text-[10px] text-gray-500">Following</span>
                      ) : (
                        <button
                          onClick={() => handleFollow(id)}
<<<<<<< Updated upstream
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
=======
                          
                          className="text-xs font-semibold bg-slate-50 p-2 rounded-sm text-black  "
>>>>>>> Stashed changes
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

      <div className="border-t border-gray-100" />

<<<<<<< Updated upstream
      {/* This Week Stats */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">This Week</h2>
=======
      <div className="rounded-2xl p-4">
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">This week</h2>
>>>>>>> Stashed changes
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
                <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
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
          </div>
        )}
      </div>

<<<<<<< Updated upstream
      <div className="border-t border-gray-100" />

      {/* Quick Access */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Access</h2>
        <div className="space-y-1">
          <Link 
            to="/bookmarks" 
            className="flex items-center justify-between py-2 hover:opacity-70 transition group"
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Saved Items</span>
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
              <Bell className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Notifications</span>
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
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Messages</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Create Shortcuts */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Create</h2>
        <div className="space-y-1">
          <Link 
            to="/post/create"
            className="flex items-center gap-2.5 py-2 hover:opacity-70 transition"
          >
            <Star className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-700">Write a Post</span>
          </Link>
          <Link 
            to="/blog/create"
            className="flex items-center gap-2.5 py-2 hover:opacity-70 transition"
          >
            <Star className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-gray-700">Write an Article</span>
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Footer */}
      <div className="pt-2 pb-8">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
          <Link to="/terms" className="hover:text-gray-600 transition">Terms</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-gray-600 transition">Privacy</Link>
          <span>·</span>
          <Link to="/about" className="hover:text-gray-600 transition">About</Link>
          <span>·</span>
          <Link to="/help" className="hover:text-gray-600 transition">Help</Link>
=======
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
>>>>>>> Stashed changes
        </div>
        <p className="mt-2 text-xs text-gray-400">© 2024 Social Network</p>
      </div>
    </div>
  );
}