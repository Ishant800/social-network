import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { followUser, getUserSuggestions, unfollowUser } from '../features/users/userSlice';
import { Loader2, UserPlus, UserCheck, MessageCircle, Users, UserMinus } from 'lucide-react';
import API from '../api/axios';

const fallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=e2e8f0&color=475569`;

export default function UserSuggestions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((s) => s.auth);
  const { suggestions, isLoading, isError } = useSelector((s) => s.users);

  const [activeTab, setActiveTab] = useState('suggestions');
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  useEffect(() => {
    dispatch(getUserSuggestions());
  }, [dispatch]);

  useEffect(() => {
    if (suggestions?.length && currentUser) {
      const currentUserFollowing = currentUser.following || [];
      const ids = suggestions
        .filter((u) => currentUserFollowing.some((f) => String(f._id || f) === String(u._id)))
        .map((u) => u._id);
      setFollowingUsers(ids);
    }
  }, [suggestions, currentUser]);

  // Fetch followers list
  const fetchFollowers = async () => {
    if (followersList.length > 0) return; // Already loaded
    try {
      setLoadingFollowers(true);
      const response = await API.get('/user/followers');
      setFollowersList(response.data.followers || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Fetch following list
  const fetchFollowing = async () => {
    if (followingList.length > 0) return; // Already loaded
    try {
      setLoadingFollowing(true);
      const response = await API.get('/user/following');
      setFollowingList(response.data.following || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'followers') {
      fetchFollowers();
    } else if (activeTab === 'following') {
      fetchFollowing();
    }
  }, [activeTab]);

  const isFollowing = (id) => {
    return followingUsers.includes(id) || 
           followingList.some(u => String(u._id) === String(id)) ||
           (currentUser?.following || []).some(f => String(f._id || f) === String(id));
  };

  const handleFollow = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    await dispatch(followUser(id));
    setFollowingUsers((p) => [...p, id]);
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleUnfollow = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    await dispatch(unfollowUser(id));
    setFollowingUsers((p) => p.filter((x) => x !== id));
    // Also remove from following list if present
    setFollowingList((p) => p.filter((u) => String(u._id) !== String(id)));
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleMessage = (user) => {
    navigate('/chats', {
      state: {
        startChatWith: {
          _id: user._id,
          name: user.profile?.fullName || user.username,
          email: user.email,
          profileImage: user.profile?.avatar,
        },
      },
    });
  };

  // Filter users based on active tab
  const getFilteredUsers = () => {
    const currentUserId = currentUser?._id || currentUser?.id;
    
    switch (activeTab) {
      case 'suggestions':
        // Show only users not following and exclude current user
        return (suggestions || []).filter((u) => 
          String(u._id) !== String(currentUserId) && !isFollowing(u._id)
        );
      case 'followers':
        return followersList;
      case 'following':
        return followingList;
      case 'all':
      default:
        // Exclude current user from all list
        return (suggestions || []).filter((u) => String(u._id) !== String(currentUserId));
    }
  };

  const filteredUsers = getFilteredUsers();
  const isLoadingData = isLoading || (activeTab === 'followers' && loadingFollowers) || (activeTab === 'following' && loadingFollowing);

  if (isLoading && !suggestions?.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Failed to load suggestions</p>
        <button
          onClick={() => dispatch(getUserSuggestions())}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const suggestionCount = (suggestions || []).filter((u) => 
    String(u._id) !== String(currentUser?._id || currentUser?.id) && !isFollowing(u._id)
  ).length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Left Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-100 bg-white">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Discover People
          </h2>
          
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'suggestions'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Suggestions</span>
              <span className="ml-auto text-xs">
                {suggestionCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('followers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'followers'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Followers</span>
              <span className="ml-auto text-xs">
                {currentUser?.followers?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('following')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'following'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Following</span>
              <span className="ml-auto text-xs">
                {currentUser?.following?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'all'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All People</span>
              <span className="ml-auto text-xs">
                {(suggestions || []).filter((u) => String(u._id) !== String(currentUser?._id || currentUser?.id)).length}
              </span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 leading-relaxed">
            Discover people based on your interests and connections. Follow to see their posts in your feed.
          </p>
        </div>
      </aside>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'suggestions' && 'Suggested for You'}
              {activeTab === 'followers' && 'Your Followers'}
              {activeTab === 'following' && 'People You Follow'}
              {activeTab === 'all' && 'All People'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'suggestions' && 'Based on your interests and connections'}
              {activeTab === 'followers' && 'People who follow you'}
              {activeTab === 'following' && 'Manage your connections'}
              {activeTab === 'all' && `${filteredUsers.length} people to connect with`}
            </p>
          </div>

          {/* Mobile Tab Selector */}
          <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === 'suggestions'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              Suggestions ({suggestionCount})
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === 'followers'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              Followers ({currentUser?.followers?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === 'following'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              Following ({currentUser?.following?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              All ({(suggestions || []).filter((u) => String(u._id) !== String(currentUser?._id || currentUser?.id)).length})
            </button>
          </div>

          {/* Loading State */}
          {isLoadingData && filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">
                {activeTab === 'followers' && 'No followers yet'}
                {activeTab === 'following' && 'Not following anyone yet'}
                {activeTab === 'suggestions' && 'No suggestions available'}
                {activeTab === 'all' && 'No users found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                const displayName = user.profile?.fullName || user.username || 'User';
                const handle = user.username ? `@${user.username}` : '';
                const avatar = user.profile?.avatar?.url || fallbackAvatar(displayName);
                const bio = user.profile?.bio || '';
                const followers = user.followers?.length || 0;
                const following = user.following?.length || 0;
                const isUserFollowing = isFollowing(user._id);
                const loading = actionLoading[user._id];

                return (
                  <div
                    key={user._id}
                    className="bg-white border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:shadow-sm transition"
                  >
                    {/* Avatar & Name */}
                    <div className="flex items-start gap-3 mb-3">
                      <Link to={`/profile/${user._id}`}>
                        <img
                          src={avatar}
                          alt={displayName}
                          className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-gray-300 transition"
                          onError={(e) => {
                            e.target.src = fallbackAvatar(displayName);
                          }}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${user._id}`}
                          className="block font-semibold text-gray-900 hover:text-blue-600 truncate"
                        >
                          {displayName}
                        </Link>
                        <p className="text-xs text-gray-500 truncate">{handle}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    {bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{bio}</p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                      <span>
                        <strong className="text-gray-900">{followers}</strong> followers
                      </span>
                      <span>
                        <strong className="text-gray-900">{following}</strong> following
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isUserFollowing ? (
                        <button
                          onClick={() => handleUnfollow(user._id)}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4" />
                              Following
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollow(user._id)}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              Follow
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleMessage(user)}
                        className="px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
