import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Newspaper, ChevronDown, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import postService from '../features/post/postService';

function BlogCard({ blog }) {
  const id = blog._id || blog.id;
  const cover = blog.coverImage?.url?.trim();
  const author = blog.author?.fullName || blog.author?.username || 'Anonymous';
  const authorId = blog.author?._id || blog.author?.userId;
  const authorAvatar = blog.author?.avatar?.url || `https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg`;
  const date = blog.publishedAt || blog.createdAt;
  
  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const readTime = blog.readTime || Math.ceil((blog.content?.length || 0) / 1000) || 5;

  return (
    <article className="py-5 border-b border-gray-200 last:border-0">
      <div className="flex gap-8">
        {/* Left Content Section */}
        <div className="flex-1 min-w-0">
          {/* Author Row */}
          <div className="flex items-center gap-2 mb-2">
            <Link to={`/profile/${authorId}`} onClick={(e) => e.stopPropagation()}>
              <img 
                src={authorAvatar} 
                alt={author}
                className="w-6 h-6 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
              />
            </Link>
            <Link 
              to={`/profile/${authorId}`} 
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium text-gray-900 hover:text-gray-700 transition"
            >
              {author}
            </Link>
          </div>

          {/* Title */}
          <Link to={`/blog/${id}`}>
            <h2 className="text-xl font-bold text-gray-900 hover:text-gray-700 leading-tight mb-2 line-clamp-2 cursor-pointer">
              {blog.title}
            </h2>
          </Link>

          {/* Description */}
          <Link to={`/blog/${id}`}>
            <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2 cursor-pointer">
              {blog.summary || (typeof blog.content === 'string' ? blog.content.substring(0, 160) : '') || 'Read this article...'}
            </p>
          </Link>

          {/* Bottom Metadata Row */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{formatDate(date)}</span>
            <span>·</span>
            <span>{readTime} min read</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {blog.likes?.length || blog.likesCount || 0}
            </span>
          </div>
        </div>

        {/* Right Section - Thumbnail */}
        {cover && (
          <Link to={`/blog/${id}`} className="shrink-0">
            <div className="w-32 h-32 rounded overflow-hidden bg-gray-100">
              <img 
                src={cover} 
                alt={blog.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}

export default function Explore() {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
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

  const load = useCallback(async (offset, append) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');
      
      const data = await postService.exploreBlogs({
        search: '',
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
  }, [filter, limit]);

  useEffect(() => {
    setSkip(0);
    load(0, false);
  }, [filter, load]);

  const hasMore = useMemo(() => skip < total && blogs.length > 0, [skip, total, blogs.length]);

  const currentFilterLabel = filterOptions.find(f => f.value === filter)?.label;

  return (
    <div className="max-w-3xl mx-auto px-6 py-4">
      {/* Header with Filter */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
        
        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-all"
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
          <div>
            {blogs.map((blog) => (
              <BlogCard key={blog._id || blog.id} blog={blog} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8 mb-4">
              <button
                onClick={() => load(skip, true)}
                disabled={loadingMore}
                className="px-6 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Load more articles'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}