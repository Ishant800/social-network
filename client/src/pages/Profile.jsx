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
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Navigate, useParams } from "react-router-dom";
import SimplePostCard from "../components/posts/SimplePostCard";
import BlogCard from "../components/blogs/BlogCard";
import API from "../api/axios";
import { followUser, unfollowUser } from "../features/users/userSlice";

const tabs = [
  { key: "Posts", label: "Posts", icon: MessageCircle },
  { key: "Blogs", label: "Articles", icon: FileText },
  { key: "Followers", label: "Followers", icon: Users },
  { key: "Following", label: "Following", icon: Heart }
];

export default function Profile() {
  const dispatch = useDispatch();
  const { userId } = useParams(); // Get userId from URL params
  const { user: currentUser, profilePosts: currentUserPosts, token } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState("Posts");
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profilePosts, setProfilePosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?._id;

  // Fetch profile data
  useEffect(() => {
    if (!token) return;
    
    if (isOwnProfile) {
      setProfileData(currentUser);
      setProfilePosts(currentUserPosts || []);
      setIsPrivateProfile(Boolean(currentUser?.privacy?.isPrivate));
    } else {
      // Fetch other user's profile
      fetchUserProfile();
    }
  }, [userId, currentUser, token, isOwnProfile]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/user/profile/${userId}`);
      setProfileData(response.data.user);
      setProfilePosts(response.data.posts || []);
      setIsFollowing(response.data.isFollowing);
      setIsPrivateProfile(Boolean(response.data.isPrivateProfile));
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

  // Redirect if not authenticated
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

  // Process posts with proper author data
  const posts = (profilePosts || []).map((post) => ({
    ...post,
    author: {
      userId: user._id,
      username: user.username,
      fullName: user.profile?.fullName || user.username,
      avatar: user.profile?.avatar?.url || null,
    },
  }));

  // Filter posts by type
  const regularPosts = posts.filter(post => !post.title && !post.coverImage);
  const blogPosts = posts.filter(post => post.title || post.coverImage);

  // Get user stats
  const userStats = {
    posts: user.stats?.posts || posts.length || 0,
    followers: user.followers?.length || user.stats?.followers || 0,
    following: user.following?.length || user.stats?.following || 0,
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Posts":
        return renderPosts(regularPosts, "No posts yet", "Share your thoughts with the world!");
      case "Blogs":
        return renderPosts(blogPosts, "No articles yet", "Write your first article to share your knowledge!");
      case "Followers":
        return renderUserList(user.followers || [], "No followers yet", "People who follow you will appear here.");
      case "Following":
        return renderUserList(user.following || [], "Not following anyone yet", "People you follow will appear here.");
      default:
        return null;
    }
  };

  const renderPosts = (postList, emptyTitle, emptyMessage) => {
    if (!postList.length) {
      return (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === "Posts" ? (
              <MessageCircle className="w-8 h-8 text-gray-400" />
            ) : (
              <FileText className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyTitle}</h3>
          <p className="text-gray-500 text-sm mb-6">{emptyMessage}</p>
          <Link
            to={activeTab === "Posts" ? "/post/create" : "/blog/create"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {activeTab === "Posts" ? "Create Post" : "Write Article"}
          </Link>
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

  const renderUserList = (userList, emptyTitle, emptyMessage) => {
    if (!userList || userList.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyTitle}</h3>
          <p className="text-gray-500 text-sm mb-6">{emptyMessage}</p>
          <Link
            to="/friendsexplore"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            Discover People
          </Link>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userList.map((followUser) => {
            const userId = followUser._id || followUser.id;
            const name = followUser.profile?.fullName || followUser.username || 'User';
            const handle = followUser.username ? `@${followUser.username}` : '';
            const bio = followUser.profile?.bio || '';
            const avatar = followUser.profile?.avatar?.url || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff`;

            return (
              <div key={userId} className="flex flex-col p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={avatar} 
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-500 truncate">{handle}</p>
                  </div>
                </div>
                {bio && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">{bio}</p>
                )}
                <Link
                  to={`/profile/${userId}`}
                  className="mt-auto text-xs text-center py-2 px-3  text-black border rounded-sm transition-colors"
                >
                  View Profile
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isPrivate = Boolean(user.privacy?.isPrivate || isPrivateProfile);
  const showLockedContent = isPrivateProfile && !isOwnProfile;

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
            <div className="relative">
              <img
                src={
                  user.profile?.avatar?.url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.profile?.fullName || user.username
                  )}&background=3b82f6&color=ffffff`
                }
                alt={user.profile?.fullName || user.username}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-100"
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
                  {!isOwnProfile && isPrivate && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Lock size={10} />
                      Private account
                    </span>
                  )}
                  {isOwnProfile && isPrivate && (
                    <Link to="/settings" className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-teal-700 hover:underline">
                      <Lock size={10} />
                      Private · change in settings
                    </Link>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {isOwnProfile ? (
                    <div className="relative flex items-center gap-2">
                      <Link
                        to="/profile/edit"
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                      <button
                        onClick={handleFollow}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isFollowing
                            ? 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Follow
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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

      {showLockedContent && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="font-display font-bold text-slate-900">This account is private</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
            Follow {user.profile?.fullName || user.username} to see their posts and connections.
          </p>
          {!isFollowing && (
            <button
              type="button"
              onClick={handleFollow}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
            >
              <UserPlus className="w-4 h-4" />
              Follow
            </button>
          )}
        </div>
      )}

      {!showLockedContent && (
      <>
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

      {renderContent()}
      </>
      )}
    </div>
  );
}

