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
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import SimplePostCard from '@/components/posts/SimplePostCard';
import BlogCard from '@/components/blogs/BlogCard';
import { followUser, unfollowUser } from '@/features/users/userSlice';
import {
  getProfileKey,
  loadProfileHeader,
  loadProfileTab,
  setActiveProfileKey,
  setProfileFollowing,
  invalidateProfileTab,
} from '@/features/profile/profileSlice';
import { getDisplayName, getAvatarUrl, normalizeAuthor } from '@/utils/userDisplay';

const ANONYMOUS_AVATAR =
  'data:image/jpeg;base64,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';

const tabs = [
  { key: 'Posts', label: 'Posts', icon: MessageCircle },
  { key: 'Blogs', label: 'Blogs', icon: FileText },
  { key: 'Followers', label: 'Followers', icon: Users },
  { key: 'Following', label: 'Following', icon: Heart },
];

const attachAuthorToContent = (items, user) => {
  const fallback = normalizeAuthor(user);
  return (items || []).map((item) => ({
    ...item,
    author: normalizeAuthor(item.author || fallback),
  }));
};

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser, token } = useSelector((state) => state.auth);

  const profileKey = getProfileKey(userId, currentUser?._id || currentUser?.id);
  const apiUserId = profileKey === 'me' ? null : profileKey;
  const isOwnProfile = profileKey === 'me';

  const profileEntry = useSelector((state) => state.profile.profiles[profileKey]);
  const user = profileEntry?.user;
  const isFollowing = profileEntry?.isFollowing ?? false;
  const headerLoading = profileEntry?.headerLoading ?? false;
  const headerLoaded = profileEntry?.headerLoaded ?? false;
  const headerError = profileEntry?.headerError;

  const [activeTab, setActiveTab] = useState('Posts');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!token) return;
    dispatch(setActiveProfileKey(profileKey));
    dispatch(loadProfileHeader({ profileKey, userId: apiUserId }));
  }, [token, profileKey, apiUserId, dispatch]);

  useEffect(() => {
    if (!token || !headerLoaded) return;
    dispatch(loadProfileTab({ profileKey, userId: apiUserId, tab: activeTab }));
  }, [token, profileKey, apiUserId, activeTab, headerLoaded, dispatch]);

  const tabState = profileEntry?.tabs?.[activeTab];
  const tabItems = tabState?.items || [];
  const tabLoading = tabState?.loading ?? false;

  const posts = useMemo(
    () => attachAuthorToContent(profileEntry?.tabs?.Posts?.items, user),
    [profileEntry?.tabs?.Posts?.items, user],
  );

  const blogs = useMemo(
    () => attachAuthorToContent(profileEntry?.tabs?.Blogs?.items, user),
    [profileEntry?.tabs?.Blogs?.items, user],
  );

  const followers = profileEntry?.tabs?.Followers?.items || user?.followers || [];
  const following = profileEntry?.tabs?.Following?.items || user?.following || [];

  const getAvatar = (profileUser) =>
    profileUser?.profile?.avatar?.url || profileUser?.profile?.avatar || ANONYMOUS_AVATAR;

  const handleFollow = async () => {
    if (!apiUserId) return;
    try {
      if (isFollowing) {
        await dispatch(unfollowUser(apiUserId)).unwrap();
        dispatch(setProfileFollowing({ profileKey, isFollowing: false }));
      } else {
        await dispatch(followUser(apiUserId)).unwrap();
        dispatch(setProfileFollowing({ profileKey, isFollowing: true }));
      }
      dispatch(invalidateProfileTab({ profileKey, tab: 'Followers' }));
      dispatch(invalidateProfileTab({ profileKey, tab: 'Following' }));
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleMessage = () => {
    if (!user) return;
    navigate('/chats', {
      state: {
        startChatWith: {
          _id: user._id,
          username: user.username,
          fullName: getDisplayName(user),
          name: getDisplayName(user),
          email: user.email,
          profileImage: user.profile?.avatar,
        },
      },
    });
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if ((headerLoading && !user) || (!headerLoaded && !headerError)) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center">
        <div className="rounded-xl border border-gray-100 bg-white p-12">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Loading profile...</h2>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
        </div>
      </div>
    );
  }

  if (headerError || !user) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center">
        <div className="rounded-xl border border-red-100 bg-white p-8">
          <p className="text-sm text-red-600">{headerError || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const userStats = {
    posts: user.stats?.posts ?? posts.length,
    followers: user.followers?.length ?? user.stats?.followers ?? followers.length,
    following: user.following?.length ?? user.stats?.following ?? following.length,
  };

  const tabCounts = {
    Posts: profileEntry?.tabs?.Posts?.loaded ? posts.length : userStats.posts,
    Blogs: profileEntry?.tabs?.Blogs?.loaded ? blogs.length : user.stats?.blogs ?? blogs.length,
    Followers: profileEntry?.tabs?.Followers?.loaded ? followers.length : userStats.followers,
    Following: profileEntry?.tabs?.Following?.loaded ? following.length : userStats.following,
  };

  const renderTabLoading = () => (
    <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
      <p className="mt-3 text-sm text-gray-500">Loading {activeTab.toLowerCase()}...</p>
    </div>
  );

  const renderPosts = (postList, emptyTitle, emptyMessage) => {
    if (tabLoading) return renderTabLoading();
    if (tabState?.error) {
      return (
        <div className="rounded-xl border border-red-100 bg-white p-8 text-center text-sm text-red-600">
          {tabState.error}
        </div>
      );
    }

    if (!postList.length) {
      return (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{emptyTitle}</h3>
          <p className="mb-6 text-sm text-gray-500">{emptyMessage}</p>
          {isOwnProfile && (
            <Link
              to="/post/create"
              className="inline-flex items-center gap-2 rounded-sm bg-slate-200 px-4 py-2 text-sm font-medium text-black hover:bg-slate-300"
            >
              <Edit3 className="h-4 w-4" />
              Create Post
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {postList.map((post) => (
          <SimplePostCard key={post._id} post={post} />
        ))}
      </div>
    );
  };

  const renderBlogs = () => {
    if (tabLoading) return renderTabLoading();
    if (tabState?.error) {
      return (
        <div className="rounded-xl border border-red-100 bg-white p-8 text-center text-sm text-red-600">
          {tabState.error}
        </div>
      );
    }

    if (!blogs.length) {
      return (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {isOwnProfile ? 'No blogs yet' : 'No blogs posted'}
          </h3>
          <p className="mb-6 text-sm text-gray-500">
            {isOwnProfile
              ? 'Write your first blog to share your knowledge!'
              : "This user hasn't published any blogs yet."}
          </p>
          {isOwnProfile && (
            <Link
              to="/blog/create"
              className="inline-flex items-center gap-2 rounded-sm bg-slate-200 px-4 py-2 text-sm font-medium text-black hover:bg-slate-300"
            >
              <Edit3 className="h-4 w-4" />
              Write a Blog
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {blogs.map((blog) => (
          <BlogCard key={blog._id} post={blog} />
        ))}
      </div>
    );
  };

  const renderUserList = (userList, emptyTitle, emptyMessage) => {
    if (tabLoading) return renderTabLoading();
    if (tabState?.error) {
      return (
        <div className="rounded-xl border border-red-100 bg-white p-8 text-center text-sm text-red-600">
          {tabState.error}
        </div>
      );
    }

    if (!userList?.length) {
      return (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{emptyTitle}</h3>
          <p className="mb-6 text-sm text-gray-500">{emptyMessage}</p>
          {isOwnProfile && (
            <Link
              to="/friendsexplore"
              className="inline-flex items-center gap-2 rounded-sm bg-slate-200 px-4 py-2 text-sm font-medium text-black hover:bg-slate-300"
            >
              <Users className="h-4 w-4" />
              Discover People
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userList.map((followUserItem) => {
            const fUserId = followUserItem._id || followUserItem.id;
            const name = getDisplayName(followUserItem);
            const avatar = getAvatarUrl(followUserItem, ANONYMOUS_AVATAR);
            const followersCount =
              followUserItem.followers?.length || followUserItem.stats?.followers || 0;
            const followingCount =
              followUserItem.following?.length || followUserItem.stats?.following || 0;

            return (
              <div
                key={fUserId}
                className="flex flex-col rounded-sm border border-gray-100 p-4 transition-all hover:border-gray-200 hover:shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Link to={`/profile/${fUserId}`}>
                    <img
                      src={avatar}
                      alt={name}
                      className="h-12 w-12 rounded-full bg-gray-100 object-cover"
                      onError={(e) => {
                        e.target.src = ANONYMOUS_AVATAR;
                      }}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/profile/${fUserId}`}
                      className="block truncate text-sm font-medium text-gray-900 hover:text-teal-700"
                    >
                      {name}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                      <span>
                        <strong className="text-gray-700">{followersCount}</strong> followers
                      </span>
                      <span>·</span>
                      <span>
                        <strong className="text-gray-700">{followingCount}</strong> following
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-2">
                  <Link
                    to={`/profile/${fUserId}`}
                    className="flex-1 rounded-sm bg-slate-200 py-1.5 text-center text-xs font-medium text-black hover:bg-slate-300"
                  >
                    View Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/chats', {
                        state: {
                          startChatWith: {
                            _id: fUserId,
                            username: followUserItem.username,
                            fullName: name,
                            name,
                            email: followUserItem.email,
                            profileImage: followUserItem.profile?.avatar,
                          },
                        },
                      })
                    }
                    className="rounded-sm border border-gray-200 p-1.5 hover:bg-gray-50"
                    title="Send message"
                  >
                    <Send className="h-3.5 w-3.5 text-gray-700" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Posts':
        return renderPosts(
          posts,
          isOwnProfile ? 'No posts yet' : 'No posts shared yet',
          isOwnProfile
            ? 'Share your thoughts with the world!'
            : "This user hasn't shared any posts yet.",
        );
      case 'Blogs':
        return renderBlogs();
      case 'Followers':
        return renderUserList(
          followers,
          isOwnProfile ? 'No followers yet' : 'No followers',
          isOwnProfile
            ? 'People who follow you will appear here.'
            : "This user doesn't have any followers yet.",
        );
      case 'Following':
        return renderUserList(
          following,
          isOwnProfile ? 'Not following anyone yet' : 'Not following anyone',
          isOwnProfile
            ? 'People you follow will appear here.'
            : "This user isn't following anyone yet.",
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col gap-4 sm:flex-row lg:gap-6">
            <div className="relative">
              <img
                src={getAvatar(user)}
                alt={user.profile?.fullName || user.username}
                className="h-20 w-20 rounded-full bg-gray-100 object-cover ring-4 ring-gray-100"
                onError={(e) => {
                  e.target.src = ANONYMOUS_AVATAR;
                }}
              />
              {isOwnProfile && (
                <button
                  type="button"
                  className="absolute bottom-0 right-0 rounded-full border border-gray-200 bg-white p-1.5 shadow-lg hover:bg-gray-50"
                >
                  <Camera className="h-3.5 w-3.5 text-gray-600" />
                </button>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-start justify-between">
                <div className="mr-3 min-w-0 flex-1">
                  <h1 className="truncate text-xl font-semibold text-gray-900">
                    {getDisplayName(user)}
                  </h1>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>

                <div className="relative flex shrink-0 items-center gap-2">
                  {isOwnProfile ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-2 hover:bg-gray-50"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {showDropdown && (
                        <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                          <Link
                            to="/profile/edit"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                            onClick={() => setShowDropdown(false)}
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit Profile
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowDropdown(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleFollow}
                        className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium ${
                          isFollowing
                            ? 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5" />
                            Follow
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleMessage}
                        className="rounded-sm border border-gray-200 p-1.5 hover:bg-gray-50"
                        title="Send message"
                      >
                        <MessageCircle className="h-4 w-4 text-gray-700" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {user.profile?.bio && (
                <p className="mb-3 text-sm leading-relaxed text-gray-700">{user.profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {user.profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.profile.location}
                  </span>
                )}
                {user.profile?.website && (
                  <a
                    href={
                      user.profile.website.startsWith('http')
                        ? user.profile.website
                        : `https://${user.profile.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex max-w-xs items-center gap-1 truncate text-blue-600 hover:text-blue-700"
                  >
                    <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{user.profile.website}</span>
                  </a>
                )}
                {joined && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {joined}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="lg:shrink-0">
            <div className="grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{userStats.posts}</div>
                <div className="text-xs text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{userStats.followers}</div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{userStats.following}</div>
                <div className="text-xs text-gray-500">Following</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = tabCounts[tab.key] || 0;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {count > 0 && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {renderContent()}
    </div>
  );
}
