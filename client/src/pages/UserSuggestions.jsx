import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  followUser,
  getUserSuggestions,
  unfollowUser,
} from '../features/users/userSlice';
import {
  MessageCircle,
  Search,
  Users,
  UserCheck,
  UserPlus,
  X,
  SlidersHorizontal,
  RefreshCw,
  Check,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────────
const fallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=e2e8f0&color=475569&bold=true`;

const FILTERS = [
  { key: 'all',           label: 'All people'     },
  { key: 'not_following', label: 'Not following'  },
  { key: 'following',     label: 'Following'      },
];

// ─── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-100 rounded-full w-28" />
          <div className="h-2.5 bg-gray-100 rounded-full w-20" />
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full w-full mb-1.5" />
      <div className="h-2.5 bg-gray-100 rounded-full w-2/3 mb-4" />
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Filter dropdown ─────────────────────────────────────────────────────────────
function FilterDropdown({ filter, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = FILTERS.find((f) => f.key === filter);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
          filter !== 'all'
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">{active?.label ?? 'Filter'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-100 shadow-lg shadow-gray-900/10 z-20 py-1 overflow-hidden">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { onSelect(key); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors ${
                filter === key
                  ? 'text-gray-900 font-semibold bg-gray-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
              {filter === key && <Check className="w-3.5 h-3.5 text-gray-900" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── User card ──────────────────────────────────────────────────────────────────
function UserCard({ user, isFollowing, onFollow, onUnfollow, onMessage }) {
  const [imgErr, setImgErr] = useState(false);
  const displayName = user.profile?.fullName || user.name || user.username || 'User';
  const handle      = user.username ? `@${user.username}` : '';
  const bio         = user.profile?.bio || user.bio || null;
  const avatar      = (!imgErr && (user.profile?.avatar?.url || user.profileImage?.url)) || fallbackAvatar(displayName);
  const followers   = user.followers?.length ?? 0;
  const following   = user.following?.length ?? 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md hover:shadow-gray-900/5 transition-all duration-200 flex flex-col overflow-hidden">

      <div className="p-5 flex flex-col flex-1">
        {/* Avatar + name */}
        <div className="flex items-start gap-3.5 mb-3">
          <Link to={`/profile/${user._id}`} className="shrink-0">
            <img
              src={avatar}
              alt={displayName}
              onError={() => setImgErr(true)}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 hover:ring-gray-300 transition-all cursor-pointer"
            />
          </Link>
          
          <div className="flex-1 min-w-0 pt-0.5">
            <Link to={`/profile/${user._id}`} className="block hover:underline">
              <h3 className="text-sm font-semibold text-gray-900 truncate leading-tight">{displayName}</h3>
            </Link>
            <p className="text-xs text-gray-400 truncate mt-0.5">{handle}</p>
          </div>
          {isFollowing && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full mt-0.5">
              <UserCheck className="w-3 h-3" />
              Following
            </span>
          )}
        </div>

        {/* Bio */}
        {bio ? (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{bio}</p>
        ) : (
          <p className="text-xs text-gray-300 italic mb-3">No bio yet.</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
          <span>
            <strong className="text-gray-800 font-semibold">{followers}</strong>
            {' '}follower{followers !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-200">·</span>
          <span>
            <strong className="text-gray-800 font-semibold">{following}</strong>
            {' '}following
          </span>
        </div>

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => isFollowing ? onUnfollow(user._id) : onFollow(user._id)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
              isFollowing
                ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isFollowing
              ? <><UserCheck className="w-3.5 h-3.5" />Following</>
              : <><UserPlus  className="w-3.5 h-3.5" />Follow</>
            }
          </button>

          <button
            onClick={() => onMessage(user)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Message
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────────
export default function UserSuggestions() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user: currentUser } = useSelector((s) => s.auth);
  const { suggestions, isLoading, isError, message } = useSelector((s) => s.users);

  const [filter,         setFilter]         = useState('all');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [followingUsers, setFollowingUsers] = useState([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current && (!suggestions || suggestions.length === 0)) {
      hasFetched.current = true;
      dispatch(getUserSuggestions());
    }
  }, [dispatch, suggestions]);

  useEffect(() => {
    if (suggestions?.length && currentUser) {
      // Check which users the current user is following
      const currentUserFollowing = currentUser.following || [];
      const ids = suggestions
        .filter((u) => currentUserFollowing.some((f) => String(f._id || f) === String(u._id)))
        .map((u) => u._id);
      setFollowingUsers(ids);
    }
  }, [suggestions, currentUser]);

  const isFollowing    = (id) => followingUsers.includes(id);
  const followingCount = followingUsers.length;

  const handleFollow = (id) => {
    dispatch(followUser(id));
    setFollowingUsers((p) => [...p, id]);
  };

  const handleUnfollow = (id) => {
    dispatch(unfollowUser(id));
    setFollowingUsers((p) => p.filter((x) => x !== id));
  };

  const handleMessage = (user) => {
    navigate('/chats', {
      state: {
        startChatWith: {
          _id: user._id,
          name: user.profile?.fullName || user.name || user.username,
          email: user.email,
          profileImage: user.profile?.avatar || user.profileImage,
        },
      },
    });
  };

  const filteredSuggestions = suggestions.filter((user) => {
    const id = user._id;
    if (filter === 'following'     && !isFollowing(id)) return false;
    if (filter === 'not_following' &&  isFollowing(id)) return false;
    if (searchTerm) {
      const name   = (user.profile?.fullName || user.name || user.username || '').toLowerCase();
      const handle = (user.username || '').toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || handle.includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // ── Loading ──
  if (isLoading && suggestions.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <X className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Could not load suggestions</h3>
        <p className="text-xs text-gray-400 mb-5">{message || 'Something went wrong.'}</p>
        <button
          onClick={() => { hasFetched.current = false; dispatch(getUserSuggestions()); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
      </div>
    );
  }

  // ── Empty ──
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">No suggestions yet</h3>
        <p className="text-xs text-gray-400">Check back later for new people to connect with.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-bold text-gray-900">People you may know</h1>
          <p className="text-sm text-gray-400 mt-0.5">Discover and connect with people in your community</p>
        </div>

        {/* Search + filter */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or username…"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition" />
              </button>
            )}
          </div>

          {/* Filter dropdown */}
          <FilterDropdown filter={filter} onSelect={setFilter} />
        </div>

        {/* Count */}
        <p className="text-xs text-gray-400 mb-4">
          {filteredSuggestions.length === 0
            ? 'No users match your filters'
            : `${filteredSuggestions.length} ${filteredSuggestions.length === 1 ? 'person' : 'people'}`}
        </p>

        {/* Grid */}
        {filteredSuggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl border border-gray-100 text-center">
            <Users className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              {searchTerm ? 'No users match your search' : 'No users match this filter'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSuggestions.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                isFollowing={isFollowing(user._id)}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                onMessage={handleMessage}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}