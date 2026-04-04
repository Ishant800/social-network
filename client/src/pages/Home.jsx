import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PostCard from '../components/posts/PostCard';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { getFeed } from '../features/post/postSlice';
import { getFeedType } from '../utils/feedType';

const feedTabs = ['All', 'Posts Feed', 'Blog Feed'];

export default function Home() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const { isLoading, isError, posts, hasMore, isLoadingMore, feedCursor, message } = useSelector(
    (s) => s.posts,
  );
  const [activeTab, setActiveTab] = useState('All');
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    dispatch(getFeed({ cursor: null, append: false }));
  }, [dispatch, token]);

  const loadMore = useCallback(() => {
    if (!token || !hasMore || isLoadingMore || isLoading || !feedCursor) return;
    if (activeTab !== 'All') return;
    dispatch(getFeed({ cursor: feedCursor, append: true }));
  }, [dispatch, token, hasMore, isLoadingMore, isLoading, feedCursor, activeTab]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !token) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { root: null, rootMargin: '120px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, token, activeTab]);

  const filteredPosts = useMemo(() => {
    if (!posts?.length || activeTab === 'All') {
      return posts;
    }
    return posts.filter((post) => getFeedType(post) === activeTab);
  }, [activeTab, posts]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isError && !posts?.length) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center shadow-md shadow-teal-900/5">
        <p className="font-display text-lg font-bold text-slate-900">Something went wrong</p>
        <p className="mt-2 text-sm text-slate-600">{message || 'Unable to load your feed.'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="sticky top-0 z-10 -mx-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-1 py-2 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap gap-2">
          {feedTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-700/25'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {!isLoading && (!filteredPosts || filteredPosts.length === 0) && !isError && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">
          No posts yet. Follow people or create something new.
        </div>
      )}

      {!isLoading &&
        filteredPosts?.length > 0 &&
        filteredPosts.map((post) => <PostCard key={post._id || post.id} post={post} />)}

      {activeTab === 'All' && hasMore && filteredPosts?.length > 0 && (
        <div ref={sentinelRef} className="flex min-h-12 justify-center py-4" aria-hidden>
          {isLoadingMore ? (
            <span className="text-sm text-slate-500">Loading more…</span>
          ) : (
            <span className="text-xs text-transparent">.</span>
          )}
        </div>
      )}
    </div>
  );
}
