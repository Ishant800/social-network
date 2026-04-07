import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Newspaper, Search, ChevronDown, Eye, MessageCircle, Heart, Bookmark, MoreHorizontal, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import postService from '../features/post/postService';

function BlogCard({ blog }) {
  const id = blog._id || blog.id;
  const cover = blog.coverImage?.url?.trim();
  const author = blog.author?.fullName || blog.author?.username || 'Anonymous';
  const authorAvatar = blog.author?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=3b82f6&color=ffffff`;
  const date = blog.publishedAt || blog.createdAt;
  
  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="group py-6 border-b border-gray-100 hover:bg-gray-50/30 -mx-4 px-4 transition-all duration-200">
      <div className="flex gap-5">
        {/* Left Content Section */}
        <div className="flex-1 min-w-0">
          {/* Author Row - Avatar + Name */}
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={authorAvatar} 
              alt={author}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-900">{author}</span>
          </div>

          {/* Title - Bold, Multi-line */}
          <Link to={`/blog/${id}`}>
            <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 leading-tight mb-2 line-clamp-2">
              {blog.title}
            </h2>
          </Link>

          {/* Description - Muted preview text */}
         {/* Description - Muted preview text */}
<p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">
  {blog.summary || (typeof blog.content === 'string' ? blog.content.substring(0, 140) : '') || ''}
</p>
          {/* Bottom Metadata Row */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{formatDate(date)}</span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {blog.likes?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {blog.comments?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {blog.views || 0}
            </span>
          </div>
        </div>

        {/* Right Section - Thumbnail */}
        {cover && (
          <Link to={`/blog/${id}`} className="shrink-0">
            <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={cover} 
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Explore() {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('latest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const limit = 10;

  const filterOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most viewed' },
    { value: 'trending', label: 'Trending' },
  ];

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async (offset, append) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');
      
      const data = await postService.exploreBlogs({
        search: debouncedSearch,
        skip: offset,
        limit,
        sort: filter,
      });
      
      const list = data.blogs || [];
      setTotal(data.total ?? list.length);
      
      if (append) {
        setBlogs((prev) => [...prev, ...list]);
      } else {
        setBlogs(list);
      }
      setSkip(offset + list.length);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load articles.');
      if (!append) setBlogs([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, filter, limit]);

  useEffect(() => {
    setSkip(0);
    load(0, false);
  }, [debouncedSearch, filter, load]);

  const hasMore = useMemo(() => skip < total && blogs.length > 0, [skip, total, blogs.length]);

  const currentFilterLabel = filterOptions.find(f => f.value === filter)?.label;

  return (
    <div className="max-w-4xl mx-auto px-6 py-2">
      {/* Header - Minimal with proper margin */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">Explore</h1>
      </div>

      {/* Search & Filter Row */}
      <div className="flex items-center gap-3 mb-8">
        {/* Search Input */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-sm transition-all"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-all"
          >
            {currentFilterLabel}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showFilterDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)} />
              <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      filter === option.value ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results count */}
      {!loading && blogs.length > 0 && (
        <div className="text-xs text-gray-400 mb-4">
          {total} {total === 1 ? 'article' : 'articles'}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
        </div>
      )}

      {/* Empty */}
      {!loading && blogs.length === 0 && !error && (
        <div className="text-center py-20">
          <Newspaper className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500 text-sm">No articles found</p>
        </div>
      )}

      {/* Blog List */}
      {!loading && blogs.length > 0 && (
        <>
          <div className="-mx-4">
            {blogs.map((blog) => (
              <BlogCard key={blog._id || blog.id} blog={blog} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => load(skip, true)}
                disabled={loadingMore}
                className="text-sm text-gray-500 hover:text-gray-700 py-2 px-4 transition-colors"
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}