import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, MessageCircle, ArrowLeft } from "lucide-react";
import {
  getPostDetails,
  likePost,
  unlikePost,
} from "../features/post/postSlice";
import CommentSection from "../components/comment/commentSection";
import PostSkeleton from "../components/skeleton/postSkeleton";

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { posts, postDetails, likedPostIds, isLoading, isError, message } =
    useSelector((state) => state.posts);

  const postFromList = posts?.find((p) => (p._id || p.id) === postId);
  const post =
    postFromList ||
    ((postDetails?._id || postDetails?.id) === postId ? postDetails : null);

  useEffect(() => {
    if (!postId) return;
    if (!postFromList) {
      dispatch(getPostDetails(postId));
    }
  }, [dispatch, postId, postFromList]);

  if (isLoading && !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4">
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-white border border-rose-100 rounded-2xl p-4 text-sm text-rose-600">
          {message || "Something went wrong while loading the post."}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 text-sm text-slate-600">
          Post not found.
          <button
            onClick={() => navigate(-1)}
            className="ml-2 underline text-indigo-600"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const images = post.media || post.images || [];
  const authorName = post.user?.name || "User";
  const time = post.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : "";
  const likeCount =
    typeof post.likesCount === "number"
      ? post.likesCount
      : typeof post.likes === "number"
        ? post.likes
        : Array.isArray(post.likes)
          ? post.likes.length
          : 0;
  const commentCount =
    typeof post.comments === "number"
      ? post.comments
      : typeof post.commentsCount === "number"
        ? post.commentsCount
        : 0;
  const isLiked = likedPostIds?.includes(post._id || post.id);

  const handleLikeToggle = () => {
    if (!postId) return;
    if (isLiked) {
      dispatch(unlikePost(postId));
      return;
    }
    dispatch(likePost(postId));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">{authorName}</p>
            <p className="text-xs text-slate-500">{time}</p>
          </div>
        </div>

        <p className="text-sm text-slate-800 leading-relaxed mb-4">
          {post.content}
        </p>

        {post.tags?.length > 0 && (
          <p className="text-xs text-indigo-600 mb-4">#{post.tags[0]}</p>
        )}

        {images.length > 0 && (
          <div
            className={`grid gap-2 mb-4 ${
              images.length === 1
                ? "grid-cols-1"
                : images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
            }`}
          >
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Post image ${index + 1}`}
                className="w-full h-40 md:h-48 object-cover rounded-lg bg-slate-50"
                loading="lazy"
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              isLiked
                ? "text-rose-600 bg-rose-50"
                : "text-slate-600 hover:text-rose-600 hover:bg-rose-50"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {likeCount}
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MessageCircle className="w-4 h-4" />
            {commentCount}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <CommentSection postId={postId} />
      </div>
    </div>
  );
}
