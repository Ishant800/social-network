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
                          onClick={() => handleFollow(id)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
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

      {/* This Week Stats */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">This Week</h2>
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
        </div>
        <p className="mt-2 text-xs text-gray-400">© 2024 Social Network</p>
      </div>
    </div>
  );
}
