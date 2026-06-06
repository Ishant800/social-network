import { useCallback, useEffect, useState } from 'react';
import { Loader2, FileText, MessageSquare } from 'lucide-react';
import postService from '../features/post/postService';
import SimplePostCard from '../components/posts/SimplePostCard';
import BlogCard from '../components/blogs/BlogCard';

const POSTS_LIMIT = 8;
const BLOGS_LIMIT = 6;

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [postsSkip, setPostsSkip] = useState(0);
  const [blogsSkip, setBlogsSkip] = useState(0);
  const [postsHasMore, setPostsHasMore] = useState(true);
  const [blogsHasMore, setBlogsHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [loadingMoreBlogs, setLoadingMoreBlogs] = useState(false);
  const [error, setError] = useState('');

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await postService.exploreFeed({
        postsLimit: POSTS_LIMIT,
        blogsLimit: BLOGS_LIMIT,
        postsSkip: 0,
        blogsSkip: 0,
      });

      const newPosts = data.posts || [];
      const newBlogs = data.blogs || [];

      setPosts(newPosts);
      setBlogs(newBlogs);
      setPostsSkip(newPosts.length);
      setBlogsSkip(newBlogs.length);
      setPostsHasMore(Boolean(data.postsHasMore));
      setBlogsHasMore(Boolean(data.blogsHasMore));
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load explore feed.');
      setPosts([]);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleLoadMorePosts = async () => {
    if (loadingMorePosts || !postsHasMore) return;

    try {
      setLoadingMorePosts(true);
      const data = await postService.exploreFeed({
        postsLimit: POSTS_LIMIT,
        blogsLimit: 0,
        postsSkip,
        blogsSkip: 0,
      });
      const newPosts = data.posts || [];
      setPosts((prev) => [...prev, ...newPosts]);
      setPostsSkip((prev) => prev + newPosts.length);
      setPostsHasMore(Boolean(data.postsHasMore));
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load more posts.');
    } finally {
      setLoadingMorePosts(false);
    }
  };

  const handleLoadMoreBlogs = async () => {
    if (loadingMoreBlogs || !blogsHasMore) return;

    try {
      setLoadingMoreBlogs(true);
      const data = await postService.exploreFeed({
        postsLimit: 0,
        blogsLimit: BLOGS_LIMIT,
        postsSkip: 0,
        blogsSkip,
      });
      const newBlogs = data.blogs || [];
      setBlogs((prev) => [...prev, ...newBlogs]);
      setBlogsSkip((prev) => prev + newBlogs.length);
      setBlogsHasMore(Boolean(data.blogsHasMore));
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not load more blogs.');
    } finally {
      setLoadingMoreBlogs(false);
    }
  };

  const isEmpty = !loading && posts.length === 0 && blogs.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
        <p className="mt-1 text-sm text-gray-500">
          Suggested on the basis of your interests
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
        </div>
      )}

      {!loading && (
        <>
          {/* Posts section */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <MessageSquare className="h-5 w-5 text-teal-600" />
              <h2 className="text-xl font-bold text-gray-900">Posts</h2>
            </div>

            {posts.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No posts to show right now.</p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <SimplePostCard key={post._id || post.id} post={post} />
                ))}
              </div>
            )}

            {postsHasMore && posts.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMorePosts}
                  disabled={loadingMorePosts}
                  className="px-6 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loadingMorePosts ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    'Load more posts'
                  )}
                </button>
              </div>
            )}
          </section>

          {/* Blogs section */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Blogs</h2>
            </div>

            {blogs.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No blogs to show right now.</p>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <BlogCard key={blog._id || blog.id} post={blog} />
                ))}
              </div>
            )}

            {blogsHasMore && blogs.length > 0 && (
              <div className="flex justify-center mt-6 mb-4">
                <button
                  onClick={handleLoadMoreBlogs}
                  disabled={loadingMoreBlogs}
                  className="px-6 py-2.5 text-sm text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loadingMoreBlogs ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    'Load more blogs'
                  )}
                </button>
              </div>
            )}
          </section>

          {isEmpty && !error && (
            <p className="text-center text-sm text-gray-500 py-10">
              Follow people and interact with content to improve your explore feed.
            </p>
          )}
        </>
      )}
    </div>
  );
}
