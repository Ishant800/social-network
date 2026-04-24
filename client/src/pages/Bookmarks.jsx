import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  Bookmark, 
  BookmarkX, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { 
  fetchBookmarks, 
  toggleBookmark as toggleBookmarkAction 
} from '../features/bookmarks/bookmarkSlice';

// Format date
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(undefined, { 
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

// Bookmark item component for grid view
function BookmarkGridItem({ item, onRemove, onNavigate }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const contentType = getContentType(item);
  const itemId = item._id || item.id;

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
  
  // Get author info
  const authorName = item.user?.name || item.user?.username || item.author?.username || 'Unknown';
  const authorAvatar = item.user?.profileImage?.url || item.user?.profileImage || item.author?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=3b82f6&color=ffffff`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
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
          />
        </div>
      ) : (
        <div 
          onClick={handleClick}
          className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer"
        >
          {contentType === 'blog' ? (
            <FileText className="w-8 h-8 text-gray-400" />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img 
              src={authorAvatar} 
              alt={authorName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-700">{authorName}</span>
          </div>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Remove bookmark"
          >
            {isRemoving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <BookmarkX className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Title/Content */}
        <h3 
          onClick={handleClick}
          className="font-semibold text-gray-900 text-sm line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors mb-2"
        >
          {item.title || item.content || 'Untitled'}
        </h3>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            {contentType === 'blog' ? (
              <FileText className="w-3 h-3" />
            ) : (
              <ImageIcon className="w-3 h-3" />
            )}
            {contentType === 'blog' ? 'Article' : 'Post'}
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

  const authorName = item.user?.name || item.user?.username || item.author?.username || 'Unknown';
  const authorAvatar = item.user?.profileImage?.url || item.user?.profileImage || item.author?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=3b82f6&color=ffffff`;

  const previewImage = item.coverImage?.url || item.media?.[0]?.url;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex gap-4">
        {/* Thumbnail */}
        {previewImage && (
          <div 
            onClick={handleClick}
            className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
          >
            <img 
              src={previewImage} 
              alt={item.title || 'Content preview'}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={authorAvatar} 
              alt={authorName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-700">{authorName}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs text-gray-400 flex items-center gap-1">
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
            </div>
          </div>

          {/* Title/Content */}
          <h3 
            onClick={handleClick}
            className="font-semibold text-gray-900 text-sm line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors mb-2"
          >
            {item.title || item.content || 'Untitled'}
          </h3>

          {/* Preview */}
          {(item.summary || item.content) && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {item.summary || (typeof item.content === 'string' ? item.content.substring(0, 150) : '')}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleClick}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Read more
            </button>
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
  const [filter, setFilter] = useState('all'); // 'all', 'posts', 'blogs'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'author'

  // Redirect if not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Load bookmarks on mount
  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  // Handle remove bookmark
  const handleRemoveBookmark = useCallback(async (item) => {
    const itemId = item._id || item.id;
    const contentType = getContentType(item);
    await dispatch(toggleBookmarkAction({ itemId, type: contentType }));
  }, [dispatch]);

  // Handle navigation
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchBookmarks());
  };

  // Filter and sort bookmarks
  const filteredAndSortedBookmarks = items
    .filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').toLowerCase();
        const author = (item.user?.name || item.user?.username || '').toLowerCase();
        
        if (!title.includes(query) && !content.includes(query) && !author.includes(query)) {
          return false;
        }
      }

      // Type filter
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
          const authorA = (a.user?.name || a.user?.username || '').toLowerCase();
          const authorB = (b.user?.name || b.user?.username || '').toLowerCase();
          return authorA.localeCompare(authorB);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const postCount = items.filter(item => getContentType(item) === 'post').length;
  const blogCount = items.filter(item => getContentType(item) === 'blog').length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bookmark className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Saved Items</h1>
              <p className="text-sm text-gray-500">
                {items.length > 0 ? `${items.length} saved items` : 'No saved items yet'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* View mode toggle */}
            <div className="flex border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-50 text-blue-600' 
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
                    ? 'bg-blue-50 text-blue-600' 
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
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            >
              <option value="all">All ({items.length})</option>
              <option value="posts">Posts ({postCount})</option>
              <option value="blogs">Articles ({blogCount})</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
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
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="animate-pulse">
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load bookmarks</h3>
          <p className="text-gray-500 text-sm mb-4">{message || 'Something went wrong'}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : filteredAndSortedBookmarks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || filter !== 'all' ? 'No matching bookmarks' : 'No bookmarks yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start bookmarking posts and articles to save them for later'
            }
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
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
