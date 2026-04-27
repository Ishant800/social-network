import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import SimplePostCard from '../components/posts/SimplePostCard';
import BlogCard from '../components/blogs/BlogCard';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { getFeed, resetFeed, setLikedPosts } from '../features/post/postSlice';

const feedTabs = ['Posts', 'Articles', 'Discussions'];

export default function Home() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const { isLoading, isError, posts, hasMore, isLoadingMore, currentPage, message, activeFeedType } = useSelector(
    (s) => s.posts,
  );
  const [activeTab, setActiveTab] = useState('Posts');
  const sentinelRef = useRef(null);
  const isFirstMount = useRef(true);

  const feedType = activeTab === 'Articles' ? 'articles' : 'posts';

  useEffect(() => {
    if (!token) return;

    if (isFirstMount.current) {
      // On first mount - use cache if available, otherwise fetch
      isFirstMount.current = false;
      dispatch(getFeed({ feedType, page: 1, append: false, force: false }));
    }
  }, [token]);

  // When tab changes - force fresh fetch for new tab
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    const newFeedType = tab === 'Articles' ? 'articles' : 'posts';
    dispatch(getFeed({ feedType: newFeedType, page: 1, append: false, force: false }));
  };

  // Load liked posts from feed data
  useEffect(() => {
    if (posts && posts.length > 0) {
      const likedIds = posts.filter(p => p.isLiked).map(p => p._id || p.id);
      if (likedIds.length > 0) dispatch(setLikedPosts(likedIds));
    }
  }, [posts, dispatch]);

  const loadMore = useCallback(() => {
    if (!token || !hasMore || isLoadingMore || isLoading) return;
    dispatch(getFeed({ feedType, page: currentPage + 1, append: true }));
  }, [dispatch, token, hasMore, isLoadingMore, isLoading, currentPage, feedType]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !token) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadMore(); },
      { root: null, rootMargin: '120px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, token]);

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
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
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
      {!isLoading && (!posts || posts.length === 0) && !isError && (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 px-5 py-12 text-center">
          <p className="text-gray-500 text-sm">
            {activeTab === 'Posts' && 'No posts found'}
            {activeTab === 'Articles' && 'No articles found'}
            {activeTab === 'Discussions' && 'No discussions found'}
          </p>
        </div>
      )}

      {/* Posts Feed */}
      {!isLoading && posts?.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => {
            const isBlog = activeTab === 'Articles' || post.feedType === 'blog';
            return isBlog ? (
              <BlogCard key={post._id || post.id} post={post} />
            ) : (
              <SimplePostCard key={post._id || post.id} post={post} />
            );
          })}
        </div>
      )}

      {/* Load More Sentinel */}
      {hasMore && posts?.length > 0 && (
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