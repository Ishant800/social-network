import { 
  Calendar, 
  Link as LinkIcon, 
  MapPin, 
  Edit3, 
  Settings, 
  MoreHorizontal,
  Users,
  FileText,
  Heart,
  MessageCircle,
  Share2,
  Camera,
  UserPlus,
  UserCheck,
  Send,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import SimplePostCard from "../components/posts/SimplePostCard";
import BlogCard from "../components/blogs/BlogCard";
import API from "../api/axios";
import { followUser, unfollowUser } from "../features/users/userSlice";

// Anonymous placeholder image
const ANONYMOUS_AVATAR = "data:image/jpeg;base64,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";


const tabs = [
  { key: "Posts", label: "Posts", icon: MessageCircle },
  { key: "Blogs", label: "Articles", icon: FileText },
  { key: "Followers", label: "Followers", icon: Users },
  { key: "Following", label: "Following", icon: Heart }
];

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser, profilePosts: currentUserPosts, token } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState("Posts");
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profilePosts, setProfilePosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAllInterests, setShowAllInterests] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?._id;

  // Get actual user interests from backend
  const userInterests = profileData?.preferences?.interests || [];

  // Get avatar with anonymous fallback
  const getAvatar = (user) => {
    return user?.profile?.avatar?.url || user?.profile?.avatar || ANONYMOUS_AVATAR;
  };

  useEffect(() => {
    if (!token) return;
    
    // Always fetch posts for profile view
    if (isOwnProfile) {
      // Use current user data from Redux
      setProfileData(currentUser);
      setProfilePosts(currentUserPosts || []);
      fetchMyPosts(); // Fetch own posts
    } else {
      fetchUserProfile();
    }
  }, [userId, currentUser, token, isOwnProfile]);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const response = await API.get('/post/myPost');
      setProfilePosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching my posts:', error);
      setProfilePosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/user/profile/${userId}`);
      setProfileData(response.data.user);
      setProfilePosts(response.data.posts || []);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await dispatch(unfollowUser(userId)).unwrap();
        setIsFollowing(false);
      } else {
        await dispatch(followUser(userId)).unwrap();
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleMessage = () => {
    if (!profileData) return;
    navigate('/chats', {
      state: {
        startChatWith: {
          _id: profileData._id,
          name: profileData.profile?.fullName || profileData.username,
          email: profileData.email,
          profileImage: profileData.profile?.avatar,
        },
      },
    });
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading || !profileData) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="bg-white rounded-xl border border-gray-100 p-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading profile...
          </h2>
          <div className="animate-pulse space-y-4">
            <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const user = profileData;
  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { 
        month: "long", 
        year: "numeric" 
      })
    : "";

  const posts = (profilePosts || []).map((post) => ({
    ...post,
    author: {
      userId: user._id,
      username: user.username,
      fullName: user.profile?.fullName || user.username,
      avatar: user.profile?.avatar?.url || null,
    },
  }));

  const regularPosts = posts.filter(post => !post.title && !post.coverImage);
  const blogPosts = posts.filter(post => post.title || post.coverImage);

  const userStats = {
    posts: user.stats?.posts || posts.length || 0,
    followers: user.followers?.length || user.stats?.followers || 0,
    following: user.following?.length || user.stats?.following || 0,
  };

  const displayedInterests = showAllInterests 
    ? userInterests 
    : userInterests.slice(0, 5);

  const renderContent = () => {
    switch (activeTab) {
      case "Posts":
        return renderPosts(regularPosts, 
          isOwnProfile ? "No posts yet" : "No posts shared yet",
          isOwnProfile ? "Share your thoughts with the world!" : "This user hasn't shared any posts yet."
        );
      case "Blogs":
        return renderBlogs();
      case "Followers":
        return renderUserList(user.followers || [], 
          isOwnProfile ? "No followers yet" : "No followers",
          isOwnProfile ? "People who follow you will appear here." : "This user doesn't have any followers yet."
        );
      case "Following":
        return renderUserList(user.following || [], 
          isOwnProfile ? "Not following anyone yet" : "Not following anyone",
          isOwnProfile ? "People you follow will appear here." : "This user isn't following anyone yet."
        );
      default:
        return null;
    }
  };

  const renderPosts = (postList, emptyTitle, emptyMessage) => {
    if (!postList.length) {
      return (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyTitle}</h3>
          <p className="text-gray-500 text-sm mb-6">{emptyMessage}</p>
          {isOwnProfile && (
            <Link
              to="/post/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-black rounded-sm text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Create Post
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {postList.map((post) => {
          const isBlog = post.title || post.coverImage;
          return isBlog ? (
            <BlogCard key={post._id} post={post} />
          ) : (
            <SimplePostCard key={post._id} post={post} />
          );
        })}
      </div>
    );
  };

  // Articles section - only show create button if owner
  const renderBlogs = () => {
    if (!blogPosts.length) {
      return (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isOwnProfile ? "No articles yet" : "No articles posted"}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {isOwnProfile 
              ? "Write your first article to share your knowledge!" 
              : "This user hasn't published any articles yet."}
          </p>
          {isOwnProfile && (
            <Link
              to="/blog/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-black rounded-sm text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Write Article
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {blogPosts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    );
  };

  // Updated user list with anonymous avatar + new card design
  const renderUserList = (userList, emptyTitle, emptyMessage) => {
    if (!userList || userList.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyTitle}</h3>
          <p className="text-gray-500 text-sm mb-6">{emptyMessage}</p>
          {isOwnProfile && (
            <Link
              to="/friendsexplore"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-black rounded-sm text-sm font-medium hover:bg-slate-300 transition-colors"
            >
              <Users className="w-4 h-4" />
              Discover People
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userList.map((followUser) => {
            const fUserId = followUser._id || followUser.id;
            const name = followUser.profile?.fullName || followUser.username || 'User';
            // Use anonymous avatar if no profile image
            const avatar = followUser.profile?.avatar?.url 
              || followUser.profile?.avatar 
              || ANONYMOUS_AVATAR;
            const followersCount = followUser.followers?.length || followUser.stats?.followers || 0;
            const followingCount = followUser.following?.length || followUser.stats?.following || 0;

            const handleUserMessage = () => {
              navigate('/chats', {
                state: {
                  startChatWith: {
                    _id: fUserId,
                    name: name,
                    email: followUser.email,
                    profileImage: followUser.profile?.avatar,
                  },
                },
              });
            };

            return (
              <div 
                key={fUserId} 
                className="flex flex-col p-4 rounded-sm border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                {/* Avatar + Name + Stats */}
                <div className="flex items-center gap-3 mb-3">
                  <Link to={`/profile/${fUserId}`}>
                    <img 
                      src={avatar} 
                      alt={name}
                      className="w-12 h-12 rounded-full object-cover bg-gray-100"
                      onError={(e) => { e.target.src = ANONYMOUS_AVATAR; }}
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${fUserId}`} className="block font-medium text-sm text-gray-900 truncate hover:text-teal-700">
                      {name}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span><strong className="text-gray-700">{followersCount}</strong> followers</span>
                      <span>·</span>
                      <span><strong className="text-gray-700">{followingCount}</strong> following</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <Link
                    to={`/profile/${fUserId}`}
                    className="flex-1 text-center py-1.5 px-3 text-xs font-medium text-black bg-slate-200 hover:bg-slate-300 rounded-sm transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleUserMessage}
                    className="p-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5 text-gray-700" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
            <div className="relative">
              <img
                src={getAvatar(user)}
                alt={user.profile?.fullName || user.username}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-100 bg-gray-100"
                onError={(e) => { e.target.src = ANONYMOUS_AVATAR; }}
              />
              {isOwnProfile && (
                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Camera className="w-3.5 h-3.5 text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <h1 className="text-xl font-semibold text-gray-900 truncate">
                    {user.profile?.fullName || user.username}
                  </h1>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {isOwnProfile ? (
                    <div className="relative flex items-center gap-2">
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {showDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <Link
                            to="/profile/edit"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                            onClick={() => setShowDropdown(false)}
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowDropdown(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          <button
                            onClick={() => {
                              navigator.share?.({
                                title: `${user.profile?.fullName || user.username}'s Profile`,
                                url: window.location.href
                              });
                              setShowDropdown(false);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                          >
                            <Share2 className="w-4 h-4" />
                            Share Profile
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Follow Button - text only, sm size */}
                      <button
                        onClick={handleFollow}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                          isFollowing
                            ? 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>

                      {/* Message Button - icon only, sm size */}
                      <button
                        onClick={handleMessage}
                        className="p-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                        title="Send message"
                      >
                        <MessageCircle className="w-4 h-4 text-gray-700" />
                      </button>

                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {showDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              navigator.share?.({
                                title: `${user.profile?.fullName || user.username}'s Profile`,
                                url: window.location.href
                              });
                              setShowDropdown(false);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                            <Share2 className="w-4 h-4" />
                            Share Profile
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.profile?.bio && (
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {user.profile.bio}
                </p>
              )}

              {/* Interests Section */}
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Interests</h3>
                </div>
                {userInterests.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {displayedInterests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[11px] font-medium text-black bg-slate-100 rounded-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                    {userInterests.length > 5 && (
                      <button
                        onClick={() => setShowAllInterests(!showAllInterests)}
                        className="mt-2 text-[11px] font-medium text-teal-600 hover:text-teal-700"
                      >
                        {showAllInterests ? 'Show less' : `Show more (${userInterests.length - 5}+)`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    {isOwnProfile ? 'Add interests in Settings to personalize your feed' : 'No interests added yet'}
                  </p>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {user.profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {user.profile.location}
                  </span>
                )}
                {user.profile?.website && (
                  <a
                    href={
                      user.profile.website.startsWith("http")
                        ? user.profile.website
                        : `https://${user.profile.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 truncate max-w-xs"
                  >
                    <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user.profile.website}</span>
                  </a>
                )}
                {joined && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {joined}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:shrink-0">
            <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {userStats.posts}
                </div>
                <div className="text-xs text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {userStats.followers}
                </div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {userStats.following}
                </div>
                <div className="text-xs text-gray-500">Following</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 mb-6">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = tab.key === "Posts" ? regularPosts.length : 
                         tab.key === "Blogs" ? blogPosts.length :
                         tab.key === "Followers" ? userStats.followers :
                         tab.key === "Following" ? userStats.following : 0;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {count > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}