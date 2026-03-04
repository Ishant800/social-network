import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

import CreatePost from "../components/post/CreatePost";
import PostCard from "../components/post/PostCard";
import API from "../api/axios";
import PostSkeleton from "../components/skeleton/postSkeleton";
 // use your axios instance

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await API.get("/post/randomposts", {
          signal: controller.signal,
        });

        const postsData = response.data?.posts ?? [];

        const mappedPosts = postsData.map((post) => ({
          id: post._id,
          author: post.user?.name ?? "Unknown User",
          username:
            post.user?.name?.toLowerCase().replace(/\s+/g, "") ??
            "user",
          time: post.createdAt
            ? new Date(post.createdAt).toLocaleString()
            : "Just now",
          content: post.content ?? "",
          likes: Array.isArray(post.likes)
            ? post.likes.length
            : 0,
          comments:
            typeof post.commentsCount === "number"
              ? post.commentsCount
              : 0,
          images: Array.isArray(post.media)
            ? post.media
            : [],
        }));

        setPosts(mappedPosts);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError(err.response || err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPosts();

    return () => {
      controller.abort();
    };
  }, []);

  const isAuthError = error?.status === 401;

  return (
    <>
      <CreatePost />

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
        <PostSkeleton/>
        <PostSkeleton/>
        <PostSkeleton/>
        <PostSkeleton/>
        <PostSkeleton/>
        </div>
      )}

      {/* Auth Error */}
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

      {/* General Error */}
      {!loading && !isAuthError && error && (
        <div className="bg-white border border-rose-100 rounded-2xl p-4 text-sm text-rose-600">
          Something went wrong while loading your feed. Please try again.
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500">
          No posts available right now. Be the first to share something!
        </div>
      )}

      {/* Posts */}
      {!loading &&
        !error &&
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
    </>
  );
}