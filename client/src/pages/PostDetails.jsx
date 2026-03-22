import { ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import CommentSection from '../components/comment/commentSection';
import PostSkeleton from '../components/skeleton/postSkeleton';
import { getPostDetails, likePost, unlikePost } from '../features/post/postSlice';

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { posts, postDetails, likedPostIds, isLoading, isError, message } =
    useSelector((state) => state.posts);

  const postFromList = posts?.find((item) => (item._id || item.id) === postId);
  const post =
    postFromList ||
    ((postDetails?._id || postDetails?.id) === postId ? postDetails : null);

  useEffect(() => {
    if (!postId || postFromList) return;
    dispatch(getPostDetails(postId));
  }, [dispatch, postId, postFromList]);

  if (isLoading && !post) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-4">
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-4">
        <div className="rounded-2xl border border-rose-100 bg-white p-4 text-sm text-rose-600">
          {message || 'Something went wrong while loading this post.'}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
          Post not found.
        </div>
      </div>
    );
  }

  const postKey = post._id || post.id;
  const images = post.media || post.images || [];
  const authorName = post.user?.name || post.author || 'User';
  const authorHandle = authorName.toLowerCase().replace(/\s+/g, '');
  const time = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString()
    : new Date().toLocaleDateString();
  const avatar =
    post.user?.profileImage?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`;
  const likeCount =
    typeof post.likesCount === 'number'
      ? post.likesCount
      : typeof post.likes === 'number'
        ? post.likes
        : Array.isArray(post.likes)
          ? post.likes.length
          : 0;
  const commentCount =
    typeof post.commentsCount === 'number'
      ? post.commentsCount
      : typeof post.comments === 'number'
        ? post.comments
        : Array.isArray(post.comments)
          ? post.comments.length
          : 0;
  const isLiked = likedPostIds?.includes(postKey);

  const handleLikeToggle = () => {
    if (!postKey) return;
    if (isLiked) {
      dispatch(unlikePost(postKey));
      return;
    }
    dispatch(likePost(postKey));
  };

  return (
    <div className="mx-auto w-full max-w-[920px] px-4 py-4 sm:px-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <article className="rounded-[1.75rem] bg-white p-6 shadow-sm md:p-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={avatar} alt={authorName} className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h1 className="text-base font-semibold text-slate-900">{authorName}</h1>
              <p className="mt-1 text-sm text-slate-500">@{authorHandle} · {time}</p>
            </div>
          </div>

          <button className="text-slate-400 transition hover:text-slate-700">
            <Share2 className="h-5 w-5" />
          </button>
        </header>

        {post.title && (
          <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
            {post.title}
          </h2>
        )}

        <p className={`text-[15px] leading-8 text-slate-700 ${post.title ? 'mt-4' : ''}`}>
          {post.content}
        </p>

        {images.length > 0 && (
          <div className={`mt-6 grid gap-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {images.slice(0, 4).map((image, index) => (
              <div key={index} className="overflow-hidden rounded-[1.25rem] bg-slate-100">
                <img
                  src={image}
                  alt={`Post media ${index + 1}`}
                  className="h-[240px] w-full object-cover md:h-[320px]"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center gap-6 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handleLikeToggle}
            className={`flex items-center gap-2 text-sm font-medium transition ${
              isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            {likeCount}
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <MessageCircle className="h-5 w-5" />
            {commentCount}
          </div>
        </div>
      </article>

      <div className="mt-6">
        <CommentSection postId={postId} />
      </div>
    </div>
  );
}
