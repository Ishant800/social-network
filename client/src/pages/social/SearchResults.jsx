import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  FileText,
  BookOpen,
  Loader2,
  UserRound,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import API from '@/api/axios';
import { followUser, unfollowUser } from '@/features/users/userSlice';
import { getDisplayName, getAvatarUrl } from '@/utils/userDisplay';

const TABS = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'posts', label: 'Posts', icon: FileText },
  { key: 'blogs', label: 'Blogs', icon: BookOpen },
];

const PAGE_SIZE = 5;

const EMPTY_MESSAGES = {
  users: 'No users found.',
  posts: 'No posts found.',
  blogs: 'No blogs found.',
};

const formatCount = (value) => {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
};

const avatarFallback = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=e2e8f0&color=475569&bold=true`;

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...');
    result.push(sorted[i]);
  }
  return result;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((s) => s.auth);
  const { followingIds } = useSelector((s) => s.users);

  const query = searchParams.get('q') || '';
  const activeTab = TABS.some((t) => t.key === (searchParams.get('tab') || 'users'))
    ? searchParams.get('tab') || 'users'
    : 'users';
  const page = Math.max(1, Number(searchParams.get('page') || 1));

  const [results, setResults] = useState({ users: [], posts: [], blogs: [] });
  const [totals, setTotals] = useState({ users: 0, posts: 0, blogs: 0 });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  const [localFollowing, setLocalFollowing] = useState({});

  const fetchResults = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await API.get('/search', {
        params: {
          q: query.trim(),
          type: activeTab,
          page,
          limit: PAGE_SIZE,
        },
      });

      const data = res.data;
      setResults(data.results || { users: [], posts: [], blogs: [] });
      setTotals(data.totals || { users: 0, posts: 0, blogs: 0 });
      setPagination(
        data.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
      );

      if (data.results?.users?.length) {
        setLocalFollowing((prev) => {
          const next = { ...prev };
          data.results.users.forEach((user) => {
            if (next[user._id] === undefined) {
              next[user._id] = !!user.isFollowing;
            }
          });
          return next;
        });
      }
    } catch (err) {
      console.error(err);
      setResults({ users: [], posts: [], blogs: [] });
      setTotals({ users: 0, posts: 0, blogs: 0 });
      setPagination({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [query, activeTab, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const isFollowingUser = useCallback(
    (user) => {
      const id = String(user._id);
      if (localFollowing[id] !== undefined) return localFollowing[id];
      if (followingIds.some((fid) => String(fid) === id)) return true;
      return !!user.isFollowing;
    },
    [localFollowing, followingIds],
  );

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, String(value));
      else next.delete(key);
    });
    setSearchParams(next);
  };

  const handleTabChange = (tabKey) => {
    updateParams({ q: query, tab: tabKey, page: '1' });
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    updateParams({ q: query, tab: activeTab, page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFollowToggle = async (user) => {
    const id = user._id;
    const currentlyFollowing = isFollowingUser(user);
    setFollowLoading((prev) => ({ ...prev, [id]: true }));

    try {
      if (currentlyFollowing) {
        await dispatch(unfollowUser(id));
        setLocalFollowing((prev) => ({ ...prev, [id]: false }));
      } else {
        await dispatch(followUser(id));
        setLocalFollowing((prev) => ({ ...prev, [id]: true }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const pageNumbers = useMemo(
    () => buildPageNumbers(pagination.page, pagination.totalPages),
    [pagination.page, pagination.totalPages],
  );

  const currentUserId = currentUser?._id || currentUser?.id;

  if (!query.trim()) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-12 text-center text-sm text-gray-500">
        Use the search bar above to find users, posts, and blogs.
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-5">
      <h1 className="text-xl font-bold text-gray-900">
        Results for &ldquo;{query}&rdquo;
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Users by full name · Posts by tag or category · Blogs by title or category
      </p>

      <nav className="mt-5 flex border-b border-gray-200">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count = totals[key] ?? 0;
          const isActive = activeTab === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span className="text-xs text-gray-400">{count}</span>
            </button>
          );
        })}
      </nav>

      {loading ? (
        <p className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </p>
      ) : (
        <>
          {activeTab === 'users' && (
            results.users.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">{EMPTY_MESSAGES.users}</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {results.users.map((user) => (
                  <UserResultRow
                    key={user._id}
                    user={user}
                    isSelf={String(user._id) === String(currentUserId)}
                    isFollowing={isFollowingUser(user)}
                    followLoading={!!followLoading[user._id]}
                    onFollowToggle={() => handleFollowToggle(user)}
                  />
                ))}
              </ul>
            )
          )}

          {activeTab === 'posts' && (
            results.posts.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">{EMPTY_MESSAGES.posts}</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {results.posts.map((post) => (
                  <PostResultRow key={post._id} post={post} />
                ))}
              </ul>
            )
          )}

          {activeTab === 'blogs' && (
            results.blogs.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">{EMPTY_MESSAGES.blogs}</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {results.blogs.map((blog) => (
                  <BlogResultRow key={blog._id} blog={blog} />
                ))}
              </ul>
            )
          )}

          {pagination.totalPages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              pageNumbers={pageNumbers}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </section>
  );
}

function UserResultRow({ user, isSelf, isFollowing, followLoading, onFollowToggle }) {
  const name = getDisplayName(user);
  const avatar = getAvatarUrl(user, avatarFallback(name));
  const bio = user.profile?.bio?.trim();
  const postsCount = user.stats?.posts ?? 0;
  const followersCount = user.stats?.followers ?? 0;

  return (
    <li className="flex items-center gap-3 py-3">
      <img src={avatar} alt={name} className="h-11 w-11 shrink-0 rounded-full object-cover" />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-900">{name}</span>
        <span className="block truncate text-xs text-gray-500">@{user.username}</span>
        {bio && <span className="mt-0.5 block truncate text-xs text-gray-500">{bio}</span>}
        <span className="mt-1 block text-xs text-gray-400 sm:hidden">
          {formatCount(postsCount)} posts · {formatCount(followersCount)} followers
        </span>
      </span>

      <span className="hidden shrink-0 text-xs text-gray-500 sm:block">
        <strong className="text-gray-800">{formatCount(postsCount)}</strong> posts
        <span className="mx-2 text-gray-300">·</span>
        <strong className="text-gray-800">{formatCount(followersCount)}</strong> followers
      </span>

      {!isSelf && (
        <>
          <button
            type="button"
            onClick={onFollowToggle}
            disabled={followLoading}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
              isFollowing
                ? 'text-gray-600 hover:text-gray-800'
                : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            {followLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
              'Following'
            ) : (
              'Follow'
            )}
          </button>
          <Link
            to={`/profile/${user._id}`}
            className="shrink-0 text-gray-400 transition hover:text-gray-600"
            aria-label={`View ${name}'s profile`}
          >
            <UserRound className="h-4 w-4" />
          </Link>
        </>
      )}

      {isSelf && (
        <Link
          to={`/profile/${user._id}`}
          className="shrink-0 text-sm text-gray-600 hover:text-gray-900"
        >
          Profile
        </Link>
      )}
    </li>
  );
}

function PostResultRow({ post }) {
  const author = post.author || post.user;
  const authorName = getDisplayName(author);
  const tag = post.tags?.[0];

  return (
    <li>
      <Link to={`/post/${post._id}`} className="block py-3 transition hover:opacity-80">
        <span className="line-clamp-2 text-sm text-gray-900">{post.content}</span>
        <span className="mt-1 block text-xs text-gray-500">
          {authorName}
          {(tag || post.category) && (
            <>
              <span className="text-gray-300"> · </span>
              {tag ? `#${tag}` : post.category}
            </>
          )}
        </span>
      </Link>
    </li>
  );
}

function BlogResultRow({ blog }) {
  const authorName = getDisplayName(blog.author);

  return (
    <li>
      <Link to={`/blog/${blog._id}`} className="block py-3 transition hover:opacity-80">
        <span className="line-clamp-1 text-sm font-medium text-gray-900">{blog.title}</span>
        {(blog.summary || blog.category || authorName) && (
          <span className="mt-1 block text-xs text-gray-500">
            {blog.summary && <span className="line-clamp-1">{blog.summary}</span>}
            {(blog.category || authorName) && (
              <span className={blog.summary ? 'mt-0.5 block' : 'block'}>
                {blog.category && <span>{blog.category}</span>}
                {blog.category && authorName && <span className="text-gray-300"> · </span>}
                {authorName}
              </span>
            )}
          </span>
        )}
      </Link>
    </li>
  );
}

function Pagination({ page, totalPages, pageNumbers, onPageChange }) {
  return (
    <nav className="mt-6 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      {pageNumbers.map((item, idx) =>
        item === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`h-8 min-w-8 text-sm font-medium transition ${
              page === item ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
