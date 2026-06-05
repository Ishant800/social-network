import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  Bookmark, 
  BookmarkX, 
  Search, 
  Grid3X3, 
  List,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  MessageCircle,
  Heart
} from 'lucide-react';
import { 
  fetchBookmarks, 
  toggleBookmark as toggleBookmarkAction 
} from '../features/bookmarks/bookmarkSlice';

// Anonymous placeholder image
const ANONYMOUS_AVATAR = "data:image/jpeg;base64,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";

// Format date
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

// Get content type
const getContentType = (item) => {
  if (item.title || item.coverImage || item.summary) return 'blog';
  return 'post';
};

// Get author info
const getAuthorInfo = (item) => {
  const authorName = item.author?.fullName || item.author?.username || item.user?.name || item.user?.username || 'Unknown';
  const authorAvatar = item.author?.avatar?.url || item.author?.avatar || item.user?.profileImage?.url || item.user?.profileImage || ANONYMOUS_AVATAR;
  return { authorName, authorAvatar };
};

// Bookmark item component for grid view
function BookmarkGridItem({ item, onRemove, onNavigate }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const contentType = getContentType(item);
  const itemId = item._id || item.id;
  const { authorName, authorAvatar } = getAuthorInfo(item);

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

  // Get preview image
  const previewImage = item.coverImage?.url || item.media?.[0]?.url;
  
  // Get stats
  const likesCount = item.likesCount || 0;
  const commentsCount = item.commentsCount || 0;

  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
      {/* Preview Image */}
      {previewImage ? (
        <div 
          onClick={handleClick}
          className="aspect-video bg-gray-100 cursor-pointer overflow-hidden"
        >
          <img 
            src={previewImage} 
            alt={item.title || 'Content preview'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23f3f4f6" width="400" height="225"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      ) : (
        <div 
          onClick={handleClick}
          className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer"
        >
          {contentType === 'blog' ? (
            <FileText className="w-12 h-12 text-gray-400" />
          ) : (
            <ImageIcon className="w-12 h-12 text-gray-400" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <img 
            src={authorAvatar} 
            alt={authorName}
            className="w-6 h-6 rounded-full object-cover bg-gray-100"
            onError={(e) => (e.target.src = ANONYMOUS_AVATAR)}
          />
          <span className="text-xs font-medium text-gray-700 truncate flex-1">{authorName}</span>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
            title="Remove bookmark"
          >
            {isRemoving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <BookmarkX className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Title/Content */}
        <h3 
          onClick={handleClick}
          className="font-semibold text-gray-900 text-sm line-clamp-2 cursor-pointer hover:text-teal-700 transition-colors mb-2"
        >
          {item.title || item.content?.substring(0, 100) || 'Untitled'}
        </h3>

        {/* Description for blogs */}
        {item.summary && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">
            {item.summary}
          </p>
        )}

        {/* Stats */}
        {(likesCount > 0 || commentsCount > 0) && (
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            {likesCount > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {likesCount}
              </span>
            )}
            {commentsCount > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {commentsCount}
              </span>
            )}
          </div>
        )}

        {/* Meta - pushed to bottom */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            {contentType === 'blog' ? (
              <>
                <FileText className="w-3 h-3" />
                Article
              </>
            ) : (
              <>
                <ImageIcon className="w-3 h-3" />
                Post
              </>
            )}
          </span>
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

// Bookmark item component for list view
function BookmarkListItem({ item, onRemove, onNavigate }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const contentType = getContentType(item);
  const itemId = item._id || item.id;
  const { authorName, authorAvatar } = getAuthorInfo(item);

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

  const previewImage = item.coverImage?.url || item.media?.[0]?.url;
  const likesCount = item.likesCount || 0;
  const commentsCount = item.commentsCount || 0;

  return (
    <div className="bg-white rounded-sm border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex gap-4">
        {/* Thumbnail */}
        {previewImage ? (
          <div 
            onClick={handleClick}
            className="shrink-0 w-32 h-24 rounded-sm overflow-hidden bg-gray-100 cursor-pointer"
          >
            <img 
              src={previewImage} 
              alt={item.title || 'Content preview'}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23f3f4f6" width="200" height="150"/%3E%3C/svg%3E';
              }}
            />
          </div>
        ) : (
          <div 
            onClick={handleClick}
            className="shrink-0 w-32 h-24 rounded-sm bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer"
          >
            {contentType === 'blog' ? (
              <FileText className="w-8 h-8 text-gray-400" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={authorAvatar} 
              alt={authorName}
              className="w-6 h-6 rounded-full object-cover bg-gray-100"
              onError={(e) => (e.target.src = ANONYMOUS_AVATAR)}
            />
            <span className="text-sm font-medium text-gray-700">{authorName}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
          </div>

          {/* Title/Content */}
          <h3 
            onClick={handleClick}
            className="font-semibold text-gray-900 text-sm line-clamp-2 cursor-pointer hover:text-teal-700 transition-colors mb-2"
          >
            {item.title || item.content?.substring(0, 150) || 'Untitled'}
          </h3>

          {/* Preview for blogs */}
          {item.summary && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {item.summary}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                {contentType === 'blog' ? (
                  <>
                    <FileText className="w-3 h-3" />
                    Article
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3" />
                    Post
                  </>
                )}
              </span>
              {(likesCount > 0 || commentsCount > 0) && (
                <>
                  <span>·</span>
                  {likesCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {likesCount}
                    </span>
                  )}
                  {commentsCount > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {commentsCount}
                    </span>
                  )}
                </>
              )}
            </div>
            
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              {isRemoving ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <BookmarkX className="w-3 h-3" />
              )}
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
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

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  const handleRemoveBookmark = useCallback(async (item) => {
    const itemId = item._id || item.id;
    const contentType = getContentType(item);
    await dispatch(toggleBookmarkAction({ itemId, type: contentType }));
  }, [dispatch]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleRefresh = () => {
    dispatch(fetchBookmarks());
  };

  // Filter and sort bookmarks
  const filteredAndSortedBookmarks = items
    .filter(item => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').toLowerCase();
        const author = (item.author?.fullName || item.author?.username || item.user?.name || item.user?.username || '').toLowerCase();
        
        if (!title.includes(query) && !content.includes(query) && !author.includes(query)) {
          return false;
        }
      }

      if (filter === 'posts') {
        return getContentType(item) === 'post';
      }
      if (filter === 'blogs') {
        return getContentType(item) === 'blog';
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'author':
          const authorA = (a.author?.fullName || a.author?.username || a.user?.name || a.user?.username || '').toLowerCase();
          const authorB = (b.author?.fullName || b.author?.username || b.user?.name || b.user?.username || '').toLowerCase();
          return authorA.localeCompare(authorB);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const postCount = items.filter(item => getContentType(item) === 'post').length;
  const blogCount = items.filter(item => getContentType(item) === 'blog').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-sm border border-gray-200 p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-sm">
              <Bookmark className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Saved Items</h1>
              <p className="text-sm text-gray-500">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="flex border border-gray-200 rounded-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-teal-50 text-teal-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white"
            >
              <option value="all">All ({items.length})</option>
              <option value="posts">Posts ({postCount})</option>
              <option value="blogs">Articles ({blogCount})</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="author">By author</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading && items.length === 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-sm border border-gray-200 overflow-hidden">
              <div className="animate-pulse">
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 flex gap-4">
                    <div className="w-32 h-24 bg-gray-200 rounded-sm"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load bookmarks</h3>
          <p className="text-gray-500 text-sm mb-4">{message || 'Something went wrong'}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-teal-600 text-white text-sm rounded-sm hover:bg-teal-700 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : filteredAndSortedBookmarks.length === 0 ? (
        <div className="bg-white rounded-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || filter !== 'all' ? 'No matching bookmarks' : 'No bookmarks yet'}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start bookmarking posts and articles to save them for later'
            }
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-4'
        }>
          {filteredAndSortedBookmarks.map((item) => (
            viewMode === 'grid' ? (
              <BookmarkGridItem
                key={item._id || item.id}
                item={item}
                onRemove={handleRemoveBookmark}
                onNavigate={handleNavigate}
              />
            ) : (
              <BookmarkListItem
                key={item._id || item.id}
                item={item}
                onRemove={handleRemoveBookmark}
                onNavigate={handleNavigate}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}