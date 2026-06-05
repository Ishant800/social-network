import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { followUser, getUserSuggestions, unfollowUser } from '../features/users/userSlice';
import { Loader2, UserPlus, MessageCircle, Users, UserCheck } from 'lucide-react';
import API from '../api/axios';

// The anonymous placeholder image provided
const ANONYMOUS_AVATAR = "data:image/jpeg;base64,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";

const fallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=e2e8f0&color=475569`;

export default function UserSuggestions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((s) => s.auth);
  const { suggestions, isLoading, isError } = useSelector((s) => s.users);

  const [activeTab, setActiveTab] = useState('suggestions');
  // We only need to track local following state for immediate UI updates on suggestions
  const [localFollowingIds, setLocalFollowingIds] = useState([]);
  
  // State for the "Following" tab list
  const [followingList, setFollowingList] = useState([]);
  
  const [actionLoading, setActionLoading] = useState({});
  const [loadingFollowingList, setLoadingFollowingList] = useState(false);

  useEffect(() => {
    dispatch(getUserSuggestions());
  }, [dispatch]);

  // Sync local following state with Redux/Suggestions data
  useEffect(() => {
    if (suggestions?.length && currentUser) {
      const currentUserFollowing = currentUser.following || [];
      const ids = suggestions
        .filter((u) => currentUserFollowing.some((f) => String(f._id || f) === String(u._id)))
        .map((u) => u._id);
      setLocalFollowingIds(ids);
    }
  }, [suggestions, currentUser]);

  // Fetch Following List when tab is active
  useEffect(() => {
    if (activeTab === 'following') {
      fetchFollowingList();
    }
  }, [activeTab]);

  const fetchFollowingList = async () => {
    if (followingList.length > 0) return; // Cache it so we don't refetch unnecessarily
    try {
      setLoadingFollowingList(true);
      const response = await API.get('/user/following');
      setFollowingList(response.data.following || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoadingFollowingList(false);
    }
  };

  const isFollowing = (id) => {
    // Check local state, following list, or redux state
    return localFollowingIds.includes(id) || 
           followingList.some(u => String(u._id) === String(id)) ||
           (currentUser?.following || []).some(f => String(f._id || f) === String(id));
  };

  const handleFollow = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await dispatch(followUser(id));
      setLocalFollowingIds((p) => [...p, id]);
      
      // If we are in following tab, we might want to refresh or add manually, 
      // but usually switching tabs handles fresh data. 
      // For immediate feedback in 'Following' tab if needed:
      // However, usually you follow from Suggestions tab.
    } catch (err) {
      console.error(err);
    }
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleUnfollow = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await dispatch(unfollowUser(id));
      setLocalFollowingIds((p) => p.filter((x) => x !== id));
      
      // Remove from local following list immediately for UI responsiveness
      setFollowingList((p) => p.filter((u) => String(u._id) !== String(id)));
    } catch (err) {
      console.error(err);
    }
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
    
    if (activeTab === 'suggestions') {
      // Show only users NOT following and exclude current user
      return (suggestions || []).filter((u) => 
        String(u._id) !== String(currentUserId) && !isFollowing(u._id)
      );
    } else if (activeTab === 'following') {
      return followingList;
    }
    
    return [];
  };

  const filteredUsers = getFilteredUsers();
  
  // Determine loading state
  const isLoadingData = (activeTab === 'suggestions' && isLoading) || 
                        (activeTab === 'following' && loadingFollowingList);

  if (isLoading && !suggestions?.length && activeTab === 'suggestions') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError && activeTab === 'suggestions') {
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
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 leading-relaxed">
            Connect with people who share your interests.
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
              {activeTab === 'following' && 'People You Follow'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'suggestions' && 'Based on your interests and connections'}
              {activeTab === 'following' && 'Manage your connections'}
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
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === 'following'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              Following ({currentUser?.following?.length || 0})
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
                {activeTab === 'following' && 'Not following anyone yet'}
                {activeTab === 'suggestions' && 'No suggestions available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                const displayName = user.profile?.fullName || user.username || 'User';
                
                // LOGIC FOR AVATAR: Use API URL if exists, else Anonymous Base64
                const avatar = user.profile?.avatar?.url 
                  ? user.profile.avatar.url 
                  : ANONYMOUS_AVATAR;
                
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
<div className="flex items-center gap-3 mb-3">
  <Link to={`/profile/${user._id}`}>
    <img
      src={avatar}
      alt={displayName}
      className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-gray-300 transition bg-gray-50"
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