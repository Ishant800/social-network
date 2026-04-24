import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { followUser, getUserSuggestions } from '../../features/users/userSlice';
import { 
  UserPlus, 
  X, 
  ChevronRight, 
  Users, 
  Bookmark, 
  Bell, 
  Calendar,
  Activity,
  Star,
  TrendingUp,
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

  useEffect(() => {
    dispatch(getUserSuggestions(5));
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
    .slice(0, 3);

  const getAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eff3f6&color=4b5563`;
  };

  // Quick stats for the user
  const userStats = {
    posts: user?.stats?.posts || 0,
    followers: user?.followers?.length || 0,
    following: user?.following?.length || 0,
  };

  return (
    <div className="space-y-4 sticky top-20">
      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Your Activity</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{userStats.posts}</div>
            <div className="text-xs text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{userStats.followers}</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{userStats.following}</div>
            <div className="text-xs text-gray-500">Following</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Access</h2>
        <div className="space-y-2">
          <Link 
            to="/bookmarks" 
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5  rounded-lg">
                <Bookmark className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Saved Items</span>
            </div>
            <div className="flex items-center gap-2">
              {bookmarks?.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {bookmarks.length}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          </Link>

          <Link 
            to="/notifications" 
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5  rounded-lg">
                <Bell className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          </Link>

          <Link 
            to="/friendsexplore" 
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg">
                <Users className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Discover People</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </Link>

          <Link 
            to="/profile" 
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5  rounded-lg">
                <Activity className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">My Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </Link>
        </div>
      </div>

      {/* Who to Follow */}
      {visibleSuggestions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Who to follow</h2>
            <Link to="/friendsexplore" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              See all
            </Link>
          </div>

          {isLoading && suggestions.length === 0 && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex animate-pulse items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-20 rounded bg-gray-100" />
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
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img src={avatar} alt={name} className="h-9 w-9 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-500 truncate">{handle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isFollowing ? (
                        <span className="text-xs text-gray-500 px-2 py-1">Following</span>
                      ) : (
                        <button
                          onClick={() => handleFollow(id)}
                          className="px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition"
                        >
                          Follow
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(id)}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">This Week</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span className="text-gray-600">Likes received</span>
            </div>
            <span className="font-medium text-gray-900">24</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-gray-600">Comments</span>
            </div>
            <span className="font-medium text-gray-900">8</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-green-500" />
              <span className="text-gray-600">Profile views</span>
            </div>
            <span className="font-medium text-gray-900">12</span>
          </div>
        </div>
      </div>

      {/* Create Content Shortcuts */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Create Something</h2>
        <div className="space-y-2">
          <Link 
            to="/post/create"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <MessageCircle className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Write a Post</span>
          </Link>
          <Link 
            to="/blog/create"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <Star className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Write an Article</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-2 pt-2 pb-8">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
          <Link to="/terms" className="hover:text-gray-600 transition">Terms</Link>
          <Link to="/privacy" className="hover:text-gray-600 transition">Privacy</Link>
          <Link to="/about" className="hover:text-gray-600 transition">About</Link>
          <Link to="/help" className="hover:text-gray-600 transition">Help</Link>
        </div>
        <p className="mt-2 text-xs text-gray-400">© 2024 Social Network</p>
      </div>
    </div>
  );
}