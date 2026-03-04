
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";
import { apiRequest } from "../api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest("/post/myPost", { auth: true });

        const mapped =
          data?.posts?.map((post) => ({
            id: post._id,
            author: post.user?.name || "Unknown User",
            username:
              post.user?.name?.toLowerCase().replace(/\s+/g, "") ||
              "user",
            time: new Date(post.createdAt).toLocaleString(),
            content: post.content,
            likes: Array.isArray(post.likes) ? post.likes.length : 0,
            comments:
              typeof post.commentsCount === "number"
                ? post.commentsCount
                : 0,
            images: post.media || [],
          })) || [];

        if (isMounted) {
          setPosts(mapped);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const isAuthError = error && error.status === 401;

  return (
    <>
      <CreatePost />

      {loading && (
        <div className="flex items-center justify-center py-10 text-slate-500 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">
            Loading your posts...
          </span>
        </div>
      )}

      {!loading && isAuthError && (
        <div className="bg-white border border-dashed border-indigo-200 rounded-2xl p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Sign in to see your feed
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Your personalized posts will appear here after you log in.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
            >
              Go to Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Create account
            </Link>
          </div>
        </div>
      )}

      {!loading && !isAuthError && error && (
        <div className="bg-white border border-rose-100 rounded-2xl p-4 text-sm text-rose-600">
          Something went wrong while loading your feed. Please try
          again.
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500">
          You haven&apos;t posted anything yet. Start by sharing your
          first update.
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}
