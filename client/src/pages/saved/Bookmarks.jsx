import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import {
  Bookmark,
  BookmarkX,
  Search,
  LayoutGrid,
  List,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  MessageCircle,
  Heart,
  Loader2,
  Compass,
} from 'lucide-react';
import {
  fetchBookmarks,
  toggleBookmark as toggleBookmarkAction,
} from '@/features/bookmarks/bookmarkSlice';
import { getDisplayName, getAvatarUrl } from '@/utils/userDisplay';

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getContentType = (item) => {
  if (item.title || item.coverImage || item.summary) return 'blog';
  return 'post';
};

const getAuthorInfo = (item) => {
  const author = item.author || item.user;
  const name = getDisplayName(author);
  const avatar = getAvatarUrl(
    author,
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=475569&bold=true`,
  );
  return { authorName: name, authorAvatar: avatar };
};

const getPreviewText = (item) => {
  if (item.title) return item.title;
  if (item.summary) return item.summary;
  if (item.content) return item.content.substring(0, 120);
  return 'Untitled';
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'posts', label: 'Posts' },
  { key: 'blogs', label: 'Articles' },
];

function BookmarkGridItem({ item, onRemove, onNavigate }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const contentType = getContentType(item);
  const itemId = item._id || item.id;
  const { authorName, authorAvatar } = getAuthorInfo(item);
  const previewImage = item.coverImage?.url || item.media?.[0]?.url;
  const likesCount = item.likesCount || item.stats?.likes || 0;
  const commentsCount = item.commentsCount || item.stats?.comments || 0;

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (isRemoving) return;
    setIsRemoving(true);
    await onRemove(item);
    setIsRemoving(false);
  };

  const handleClick = () => {
    onNavigate(contentType === 'blog' ? `/blog/${itemId}` : `/post/${itemId}`);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md">
      <button type="button" onClick={handleClick} className="relative block w-full text-left">
        {previewImage ? (
          <div className="aspect-[16/10] overflow-hidden bg-gray-100">
            <img
              src={previewImage}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            {contentType === 'blog' ? (
              <FileText className="h-10 w-10 text-slate-300" />
            ) : (
              <ImageIcon className="h-10 w-10 text-slate-300" />
            )}
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            contentType === 'blog'
              ? 'bg-violet-100 text-violet-700'
              : 'bg-teal-100 text-teal-700'
          }`}
        >
          {contentType === 'blog' ? 'Article' : 'Post'}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-3">
        <div className="mb-2 flex items-center gap-2">
          <img
            src={authorAvatar}
            alt={authorName}
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{authorName}</p>
            <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            title="Remove bookmark"
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookmarkX className="h-4 w-4" />
            )}
          </button>
        </div>

        <button type="button" onClick={handleClick} className="mb-2 text-left">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 transition group-hover:text-teal-700">
            {getPreviewText(item)}
          </h3>
          {item.summary && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">
              {item.summary}
            </p>
          )}
        </button>

        {(likesCount > 0 || commentsCount > 0) && (
          <div className="mt-auto flex items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
            {likesCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {likesCount}
              </span>
            )}
            {commentsCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {commentsCount}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function BookmarkListItem({ item, onRemove, onNavigate }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const contentType = getContentType(item);
  const itemId = item._id || item.id;
  const { authorName, authorAvatar } = getAuthorInfo(item);
  const previewImage = item.coverImage?.url || item.media?.[0]?.url;
  const likesCount = item.likesCount || item.stats?.likes || 0;
  const commentsCount = item.commentsCount || item.stats?.comments || 0;

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (isRemoving) return;
    setIsRemoving(true);
    await onRemove(item);
    setIsRemoving(false);
  };

  const handleClick = () => {
    onNavigate(contentType === 'blog' ? `/blog/${itemId}` : `/post/${itemId}`);
  };

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-3 transition hover:border-gray-300 hover:shadow-sm">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClick}
          className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100"
        >
          {previewImage ? (
            <img src={previewImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              {contentType === 'blog' ? (
                <FileText className="h-8 w-8 text-slate-300" />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-300" />
              )}
            </div>
          )}
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-2 flex items-center gap-2">
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="truncate text-sm font-medium text-gray-900">{authorName}</span>
            <span className="text-gray-300">·</span>
            <span className="shrink-0 text-xs text-gray-500">{formatDate(item.createdAt)}</span>
            <span
              className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                contentType === 'blog'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-teal-100 text-teal-700'
              }`}
            >
              {contentType === 'blog' ? 'Article' : 'Post'}
            </span>
          </div>

          <button type="button" onClick={handleClick} className="mb-2 text-left">
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 hover:text-teal-700">
              {getPreviewText(item)}
            </h3>
            {item.summary && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.summary}</p>
            )}
          </button>

          <div className="mt-auto flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {likesCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {likesCount}
                </span>
              )}
              {commentsCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {commentsCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
            >
              {isRemoving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <BookmarkX className="h-3.5 w-3.5" />
              )}
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ title, description, showExplore }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
        <Bookmark className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-gray-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>
      {showExplore && (
        <Link
          to="/explore"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <Compass className="h-4 w-4" />
          Explore content
        </Link>
      )}
    </section>
  );
}

export default function Bookmarks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { items, isLoading, isError, message } = useSelector((state) => state.bookmarks);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleRemoveBookmark = useCallback(
    async (item) => {
      const itemId = item._id || item.id;
      const contentType = getContentType(item);
      await dispatch(toggleBookmarkAction({ itemId, type: contentType }));
    },
    [dispatch],
  );

  const postCount = items.filter((item) => getContentType(item) === 'post').length;
  const blogCount = items.filter((item) => getContentType(item) === 'blog').length;

  const counts = { all: items.length, posts: postCount, blogs: blogCount };

  const filteredAndSortedBookmarks = items
    .filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').toLowerCase();
        const author = getDisplayName(item.author || item.user).toLowerCase();
        if (!title.includes(query) && !content.includes(query) && !author.includes(query)) {
          return false;
        }
      }
      if (filter === 'posts') return getContentType(item) === 'post';
      if (filter === 'blogs') return getContentType(item) === 'blog';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'author') {
        const authorA = getDisplayName(a.author || a.user).toLowerCase();
        const authorB = getDisplayName(b.author || b.user).toLowerCase();
        return authorA.localeCompare(authorB);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Saved items</h1>
        <p className="mt-1 text-sm text-gray-500">
          Posts and articles you bookmarked for later
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by title, content, or author…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="author">By author</option>
            </select>

            <div className="flex rounded-xl border border-gray-200 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2 transition ${
                  viewMode === 'grid'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2 transition ${
                  viewMode === 'list'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => dispatch(fetchBookmarks())}
              disabled={isLoading}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === tab.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 ${filter === tab.key ? 'text-gray-300' : 'text-gray-400'}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading && items.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
        </div>
      ) : isError ? (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
          <h2 className="text-lg font-semibold text-red-800">Could not load bookmarks</h2>
          <p className="mt-2 text-sm text-red-600">{message || 'Something went wrong.'}</p>
          <button
            type="button"
            onClick={() => dispatch(fetchBookmarks())}
            className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </section>
      ) : filteredAndSortedBookmarks.length === 0 ? (
        <EmptyState
          title={searchQuery || filter !== 'all' ? 'No matching items' : 'Nothing saved yet'}
          description={
            searchQuery || filter !== 'all'
              ? 'Try a different search term or filter.'
              : 'Bookmark posts and articles while browsing to find them here later.'
          }
          showExplore={!searchQuery && filter === 'all'}
        />
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-2'
          }
        >
          {filteredAndSortedBookmarks.map((item) =>
            viewMode === 'grid' ? (
              <BookmarkGridItem
                key={item._id || item.id}
                item={item}
                onRemove={handleRemoveBookmark}
                onNavigate={navigate}
              />
            ) : (
              <BookmarkListItem
                key={item._id || item.id}
                item={item}
                onRemove={handleRemoveBookmark}
                onNavigate={navigate}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
