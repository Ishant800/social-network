import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import SimplePostCard from '../components/posts/SimplePostCard';
import BlogCard from '../components/blogs/BlogCard';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { getFeed, resetFeed, setLikedPosts } from '../features/post/postSlice';
import { Hash, MessagesSquare, PenLine, Sparkles, TrendingUp } from 'lucide-react';

const feedTabs = ['Posts', 'Blogs', 'Discussions'];

const TRENDING_TOPICS = [
  { label: 'Design', href: '/explore' },
  { label: 'Startups', href: '/explore' },
  { label: 'Wellness', href: '/explore' },
  { label: 'Dev tips', href: '/explore' },
  { label: 'Photography', href: '/explore' },
];

function greetingForHour(h) {
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);
  const { user } = useSelector((s) => s.auth);
  const { isLoading, isError, posts, hasMore, isLoadingMore, currentPage, message, activeFeedType } = useSelector(
    (s) => s.posts,
  );
  const [activeTab, setActiveTab] = useState('Posts');
  const [showInterestBanner, setShowInterestBanner] = useState(false);
  const sentinelRef = useRef(null);
  const isFirstMount = useRef(true);

  const feedType = activeTab === 'Blogs' ? 'blogs' : 'posts';
  const isDiscussionsTab = activeTab === 'Discussions';

  const hasInterests = user?.preferences?.interests && user.preferences.interests.length > 0;
  const firstName =
    (user?.profile?.fullName && String(user.profile.fullName).split(/\s+/)[0]) ||
    user?.username ||
    'there';

  useEffect(() => {
    if (!token || isDiscussionsTab) return;

    if (isFirstMount.current) {
      isFirstMount.current = false;
      dispatch(getFeed({ feedType, page: 1, append: false, force: true }));
    }

    if (!hasInterests && posts && posts.length > 0) {
      setShowInterestBanner(true);
    }
  }, [token, hasInterests, posts, feedType, dispatch, isDiscussionsTab]);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    if (tab === 'Discussions') {
      dispatch(resetFeed());
      return;
    }
    const newFeedType = tab === 'Blogs' ? 'blogs' : 'posts';
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
    if (!token || isDiscussionsTab || !hasMore || isLoadingMore || isLoading) return;
    dispatch(getFeed({ feedType, page: currentPage + 1, append: true }));
  }, [dispatch, token, isDiscussionsTab, hasMore, isLoadingMore, isLoading, currentPage, feedType]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !token || isDiscussionsTab) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadMore(); },
      { root: null, rootMargin: '120px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, token, isDiscussionsTab]);

  if (!token) return <Navigate to="/login" replace />;

  if (isError && !posts?.length) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 px-5 py-10 text-center">
        <p className="font-semibold text-gray-900">Something went wrong</p>
        <p className="mt-1 text-sm text-gray-500">{message || 'Unable to load your feed.'}</p>
      </div>
    );
  }

  const hour = new Date().getHours();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <section className="surface-card animate-fade-up overflow-hidden rounded-2xl p-5 sm:p-6">
        <p className="font-display text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {greetingForHour(hour)}, {firstName}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Catch up on what your network shared — or start something new.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/post/create"
            className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-teal-600/25 transition hover:bg-teal-700"
          >
            <PenLine className="h-3.5 w-3.5" />
            New post
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50/50"
          >
            <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
            Explore
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-teal-200/80 bg-gradient-to-r from-teal-50/80 to-white px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal-800">
          <Hash className="h-3.5 w-3.5" />
          Trending topics
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {TRENDING_TOPICS.map((t) => (
            <Link
              key={t.label}
              to={t.href}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-teal-300 hover:text-teal-800"
            >
              #{t.label}
            </Link>
          ))}
        </div>
      </section>

      {showInterestBanner && !hasInterests && !isDiscussionsTab && (
        <div className="surface-card rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/90 to-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm font-bold text-slate-900">Personalize your feed</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Add interests in settings so we can surface posts and blogs that match what you care about.
              </p>
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-700"
              >
                Select interests
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowInterestBanner(false)}
              className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100/80 p-1 ring-1 ring-slate-200/60">
        {feedTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`min-h-[2.5rem] flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold transition sm:flex-none sm:px-5 ${
              activeTab === tab
                ? 'bg-white text-teal-800 shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isDiscussionsTab && (
        <section className="surface-card rounded-2xl p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
            <MessagesSquare className="h-7 w-7" />
          </div>
          <h2 className="font-display mt-4 text-lg font-bold text-slate-900">Live discussion rooms</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Each article can host a real-time room. Open a blog, then join its discussion to chat with readers and the author.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              to="/explore"
              className="inline-flex justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-700"
            >
              Browse articles
            </Link>
            <Link
              to="/blog/create"
              className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-teal-200 hover:bg-teal-50/40"
            >
              Write an article
            </Link>
          </div>
        </section>
      )}

      {!isDiscussionsTab && isLoading && (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {!isDiscussionsTab && !isLoading && (!posts || posts.length === 0) && !isError && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center">
          <p className="font-display text-base font-semibold text-slate-800">
            {activeTab === 'Posts' && 'No posts yet'}
            {activeTab === 'Blogs' && 'No blogs yet'}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            {activeTab === 'Posts' && 'Follow people or share your first update — your feed will fill up quickly.'}
            {activeTab === 'Blogs' && 'Long-form stories appear here. Publish an article or explore what others wrote.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to={activeTab === 'Blogs' ? '/blog/create' : '/post/create'}
              className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              {activeTab === 'Blogs' ? 'Write an article' : 'Create a post'}
            </Link>
            <Link to="/friendsexplore" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Find people
            </Link>
          </div>
        </div>
      )}

      {!isDiscussionsTab && !isLoading && posts?.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => {
            const isBlog = activeTab === 'Blogs' || post.feedType === 'blog';
            return isBlog ? (
              <BlogCard key={post._id || post.id} post={post} />
            ) : (
              <SimplePostCard key={post._id || post.id} post={post} />
            );
          })}
        </div>
      )}

      {!isDiscussionsTab && hasMore && posts?.length > 0 && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {isLoadingMore ? (
            <span className="text-xs text-slate-400">Loading more…</span>
          ) : (
            <span className="text-xs text-transparent">.</span>
          )}
        </div>
      )}
    </div>
  );
}