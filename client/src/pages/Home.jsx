import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PostCard from '../components/posts/PostCard';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { getPosts } from '../features/post/postSlice';
import { getFeedType } from '../utils/feedType';

const feedTabs = ['All', 'Posts Feed', 'Blog Feed'];

export default function Home() {
  const dispatch = useDispatch();
  const { isLoading, isError, posts } = useSelector((state) => state.posts);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    if (!isLoading && posts?.length === 0) {
      dispatch(getPosts());
    }
  }, [dispatch, isLoading, posts?.length]);

  const filteredPosts = useMemo(() => {
    if (!posts?.length || activeTab === 'All') {
      return posts;
    }

    return posts.filter((post) => getFeedType(post) === activeTab);
  }, [activeTab, posts]);

  if (isError) {
    return (
      <div className="rounded-xl   px-6 py-10 text-center shadow-[0_24px_48px_-32px_rgba(44,47,49,0.2)]">
        <p className="font-display text-xl font-bold text-slate-900">
          We&apos;re doing some maintenance
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Our server is temporarily unavailable. Please try again in a few moments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="sticky top-15 z-20 border-b border-slate-200 bg-[#f5f7f9]/95 backdrop-blur-sm">
        <div className="flex gap-6 overflow-x-auto whitespace-nowrap">
          {feedTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-6">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {!isLoading && (!filteredPosts || filteredPosts.length === 0) && !isError && (
        <div className="rounded-3xl border border-dashed border-[#d5dbe4] bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-[0_24px_48px_-12px_rgba(44,47,49,0.08)]">
          No items available in this feed right now.
        </div>
      )}

      {!isLoading &&
        filteredPosts?.length > 0 &&
        filteredPosts.map((post) => <PostCard key={post._id} post={post} />)}
    </div>
  );  
}
