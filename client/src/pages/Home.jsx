import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import SimplePostCard from '../components/posts/SimplePostCard';
import BlogCard from '../components/blogs/BlogCard';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { getFeed, resetFeed, setLikedPosts } from '../features/post/postSlice';
import { fetchActiveDiscussions } from '../features/discussions/discussionSlice';
import { MessagesSquare, Sparkles, Users, MessageCircle, Clock } from 'lucide-react';

const feedTabs = ['Posts', 'Blogs', 'Discussions'];

// Helper function to format time ago
const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);
  const { user } = useSelector((s) => s.auth);
  const { isLoading, isError, posts, hasMore, isLoadingMore, currentPage, message } = useSelector(
    (s) => s.posts,
  );
  const { activeDiscussions, isLoading: discussionsLoading } = useSelector((s) => s.discussions);
  const [activeTab, setActiveTab] = useState('Posts');
  const [showInterestBanner, setShowInterestBanner] = useState(false);
  const sentinelRef = useRef(null);
  const isFirstMount = useRef(true);

  const feedType = activeTab === 'Blogs' ? 'blogs' : 'posts';
  const isDiscussionsTab = activeTab === 'Discussions';

  // Check if user has interests
  const hasInterests = user?.preferences?.interests && user.preferences.interests.length > 0;

  useEffect(() => {
    if (!token) return;

    if (isFirstMount.current) {
      // On first mount - always fetch fresh data for variety
      isFirstMount.current = false;
      dispatch(getFeed({ feedType, page: 1, append: false, force: true }));
    }

    // Show interest banner if user has no interests
    if (!hasInterests && posts && posts.length > 0) {
      setShowInterestBanner(true);
    }
  }, [token, hasInterests, posts, feedType, dispatch]);

  // When tab changes - force fresh fetch for new tab
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    if (tab === 'Discussions') {
      dispatch(resetFeed());
      dispatch(fetchActiveDiscussions());
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
    <div className="max-w-2xl mx-auto space-y-5">
      {showInterestBanner && !hasInterests && !isDiscussionsTab && (
        <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/90 to-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Personalize your feed
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Select your interests to see posts tailored to your preferences. We'll show you the most relevant and trending content based on what you love.
              </p>
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Select Interests
              </button>
            </div>
            <button
              onClick={() => setShowInterestBanner(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-1 border-b border-gray-200">
        {feedTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isDiscussionsTab && (
        <>
          {discussionsLoading && (
            <div className="space-y-3">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          )}

          {!discussionsLoading && activeDiscussions.length === 0 && (
            <section className="rounded-2xl p-6 sm:p-8 text-center border border-gray-200 bg-white">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <MessagesSquare className="h-7 w-7" />
              </div>
              <h2 className="font-display mt-4 text-lg font-bold text-slate-900">No active discussions</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                No discussions in the last 24 hours. Open a blog and start a conversation!
              </p>
              <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/explore"
                  className="inline-flex justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
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

          {!discussionsLoading && activeDiscussions.length > 0 && (
            <div className="space-y-3">
              {activeDiscussions.map((discussion) => (
                <div
                  key={discussion.blogId}
                  onClick={() => navigate(`/discussionroom/${discussion.blogId}`)}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-teal-300 hover:shadow-sm transition cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <MessagesSquare className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                        {discussion.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <img
                          src={discussion.author.avatar || '/default-avatar.png'}
                          alt={discussion.author.username}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-xs text-gray-600">
                          {discussion.author.fullName || discussion.author.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {discussion.participantCount} {discussion.participantCount === 1 ? 'participant' : 'participants'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {discussion.messageCount} {discussion.messageCount === 1 ? 'message' : 'messages'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimeAgo(discussion.lastActivity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!isDiscussionsTab && isLoading && (
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
            {activeTab === 'Blogs' && 'No blogs found'}
            {activeTab === 'Discussions' && 'No discussions found'}
          </p>
        </div>
      )}

      {/* Posts Feed */}
      {!isLoading && posts?.length > 0 && (
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