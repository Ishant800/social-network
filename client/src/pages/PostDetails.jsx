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

  const postFromList = posts?.find(
    (item) => item?.feedType !== 'blog' && (item._id || item.id) === postId
  );
  const post = postFromList || ((postDetails?._id || postDetails?.id) === postId ? postDetails : null);

  useEffect(() => {
    if (!postId || postFromList) return;
    dispatch(getPostDetails(postId));
  }, [dispatch, postId, postFromList]);

  if (isLoading && !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          {message || 'Something went wrong while loading this post.'}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-500">
          Post not found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Post Card */}
      <PostCard post={post} currentUser={user} disableNavigation />

      {/* Comments Section - Integrated */}
      <div className="mt-6">
        <CommentSection postId={postId} />
      </div>
    </div>
  );
}