import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import CommentSection from '../components/comments/CommentSection';
import PostCard from '../components/posts/PostCard';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { getPostDetails } from '../features/post/postSlice';

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { posts, postDetails, isLoading, isError, message } = useSelector((state) => state.posts);

  const postFromList = posts?.find((item) => item?.feedType !== 'blog' && (item._id || item.id) === postId);
  const post =
    postFromList ||
    ((postDetails?._id || postDetails?.id) === postId ? postDetails : null);

  useEffect(() => {
    if (!postId || postFromList) return;
    dispatch(getPostDetails(postId));
  }, [dispatch, postId, postFromList]);

  if (isLoading && !post) {
    return (
      <div className="mx-auto max-w-230 px-4 py-4">
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[920px] px-4 py-4">
        <div className="rounded-2xl border border-rose-100 bg-white p-4 text-sm text-rose-600">
          {message || 'Something went wrong while loading this post.'}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-[920px] px-4 py-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
          Post not found.
        </div>
      </div>
    );
  }

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

      <PostCard post={post} currentUser={user} disableNavigation />

      <section className="mt-6 rounded-[1.5rem] bg-white p-5 shadow-sm">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
          <p className="mt-1 text-sm text-slate-500">
            Join the conversation and see all replies for this post.
          </p>
        </div>

        <CommentSection postId={postId} title="All Comments" />
      </section>
    </div>
  );
}
