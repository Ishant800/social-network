import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import CommentSection from '../components/comments/CommentSection';
import SimplePostCard from '../components/posts/SimplePostCard';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { getPostDetails } from '../features/post/postSlice';

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { posts, postDetails, likedPostIds, isLoading, isError, message } = useSelector((state) => state.posts);

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
      <div className="max-w-4xl mx-auto px-4 py-4">
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          {message || 'Something went wrong while loading this post.'}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-500">
          Post not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Post Card */}
        <SimplePostCard post={post} />

        {/* Comments Section - Integrated */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <CommentSection postId={postId} />
        </div>
      </div>
    </div>
  );
}