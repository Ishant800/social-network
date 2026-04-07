import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PostCard from '../components/posts/PostCard';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { getFeed } from '../features/post/postSlice';

const feedTabs = ['For You', 'Posts', 'Blogs'];

// Helper function to identify post type
const getPostType = (post) => {
  // Check if it's a blog post
  if (post?.feedType === 'blog') return 'Blog';
  if (post?.isBlog === true) return 'Blog';
  if (post?.title && (post?.coverImage || post?.summary)) return 'Blog';
  if (post?.content?.body || post?.content?.type === 'blog') return 'Blog';
  
  // Check if it's a regular post
  if (post?.feedType === 'post') return 'Post';
  if (post?.content && typeof post?.content === 'string' && !post?.title) return 'Post';
  
  // Default based on available fields
  if (post?.title) return 'Blog';
  return 'Post';
};

export default function Home() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const { isLoading, isError, posts, hasMore, isLoadingMore, feedCursor, message } = useSelector(
    (s) => s.posts,
  );
  const [activeTab, setActiveTab] = useState('For You');
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    dispatch(getFeed({ cursor: null, append: false }));
  }, [dispatch, token]);

  const loadMore = useCallback(() => {
    if (!token || !hasMore || isLoadingMore || isLoading || !feedCursor) return;
    if (activeTab !== 'For You') return;
    dispatch(getFeed({ cursor: feedCursor, append: true }));
  }, [dispatch, token, hasMore, isLoadingMore, isLoading, feedCursor, activeTab]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !token) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: '120px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, token, activeTab]);

  // Fixed filtering logic
  const filteredPosts = useMemo(() => {
    if (!posts?.length) return [];
    
    if (activeTab === 'For You') return posts;
    
    if (activeTab === 'Posts') {
      return posts.filter((post) => getPostType(post) === 'Post');
    }
    
    if (activeTab === 'Blogs') {
      return posts.filter((post) => getPostType(post) === 'Blog');
    }
    
    return posts;
  }, [activeTab, posts]);

  // Debug logging (remove in production)
  useEffect(() => {
    if (posts?.length > 0) {
      const postCount = posts.filter(p => getPostType(p) === 'Post').length;
      const blogCount = posts.filter(p => getPostType(p) === 'Blog').length;
      console.log(`Feed: ${posts.length} total | ${postCount} Posts | ${blogCount} Blogs`);
    }
  }, [posts]);

  if (!token) return <Navigate to="/login" replace />;

  if (isError && !posts?.length) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 px-5 py-10 text-center">
        <p className="font-semibold text-gray-900">Something went wrong</p>
        <p className="mt-1 text-sm text-gray-500">{message || 'Unable to load your feed.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-gray-100 mb-4">
        {feedTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {tab === 'For You' && posts?.length > 0 && (
              <span className="ml-1 text-xs text-gray-400">({posts.length})</span>
            )}
            {tab === 'Posts' && (
              <span className="ml-1 text-xs text-gray-400">
                ({posts?.filter(p => getPostType(p) === 'Post').length || 0})
              </span>
            )}
            {tab === 'Blogs' && (
              <span className="ml-1 text-xs text-gray-400">
                ({posts?.filter(p => getPostType(p) === 'Blog').length || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!filteredPosts || filteredPosts.length === 0) && !isError && (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 px-5 py-12 text-center">
          <p className="text-gray-500 text-sm">
            {activeTab === 'For You' && 'No posts in your feed'}
            {activeTab === 'Posts' && 'No short posts found'}
            {activeTab === 'Blogs' && 'No blog articles found'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {activeTab === 'For You' && 'Follow people or create something new'}
            {activeTab === 'Posts' && 'Create a short post to share your thoughts'}
            {activeTab === 'Blogs' && 'Write a blog article to share your knowledge'}
          </p>
        </div>
      )}

      {/* Posts Feed */}
      {!isLoading && filteredPosts?.length > 0 && (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post._id || post.id} post={post} />
          ))}
        </div>
      )}

      {/* Load More Sentinel */}
      {activeTab === 'For You' && hasMore && filteredPosts?.length > 0 && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {isLoadingMore ? (
            <span className="text-xs text-gray-400">Loading more...</span>
          ) : (
            <span className="text-xs text-transparent">.</span>
          )}
        </div>
      )}
    </div>
  );
}