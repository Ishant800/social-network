import { ArrowLeft, MessageCircle, Send, Trash2, MoreHorizontal, Pencil, Reply, Bookmark, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import SimplePostCard from '@/components/posts/SimplePostCard';
import PostSkeleton from '@/components/ui/skeletons/PostSkeleton';
import { getPostDetails } from '@/features/post/postSlice';
import { toggleBookmark } from '@/features/bookmarks/bookmarkSlice';
import API from '@/api/axios';

// Anonymous placeholder image

  const ANONYMOUS_AVATAR = "data:image/jpeg;base64,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";
export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { posts, postDetails, isLoading, isError, message } = useSelector((state) => state.posts);
  const { ids: bookmarkIds } = useSelector((state) => state.bookmarks);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const postFromList = posts?.find(
    (item) => item?.feedType !== 'blog' && (item._id || item.id) === postId
  );
  const post = postFromList || ((postDetails?._id || postDetails?.id) === postId ? postDetails : null);

  // Normalize post data to ensure consistent structure
  const normalizePostData = (postData) => {
    if (!postData) return null;
    
    return {
      ...postData,
      // Ensure media is always an array with url property
      media: postData.media || postData.images || [],
      // Normalize author data
      author: {
        ...postData.author,
        userId: postData.author?.userId || postData.author?._id,
        username: postData.author?.username,
        fullName: postData.author?.fullName || postData.author?.profile?.fullName || postData.author?.name,
        // Avatar can be string or object with url property
        avatar: typeof postData.author?.avatar === 'string' 
          ? postData.author.avatar 
          : postData.author?.avatar?.url || postData.author?.profile?.avatar?.url || null
      }
    };
  };

  const [currentPost, setCurrentPost] = useState(normalizePostData(post));

  useEffect(() => {
    setCurrentPost(normalizePostData(post));
    if (post && postId) {
      setIsBookmarked(bookmarkIds.includes(postId));
    }
  }, [post, postId, bookmarkIds]);

  useEffect(() => {
    if (!postId || postFromList) return;
    dispatch(getPostDetails(postId));
  }, [dispatch, postId, postFromList]);

  // Fetch comments
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await API.get(`/comment/getComment/${postId}?type=Post`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const response = await API.post(`/comment/create/${postId}`, {
        text: newComment.trim(),
        targetType: 'Post',
      });
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      setReplyingTo(null);
      // Update post comment count
      setCurrentPost((prev) => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1,
      }));
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingText.trim()) return;

    try {
      const response = await API.put(`/comment/update/${commentId}`, {
        text: editingText.trim(),
      });
      setComments((prev) =>
        prev.map((comment) => (comment._id === commentId ? response.data.comment : comment))
      );
      setEditingId(null);
      setEditingText('');
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await API.delete(`/comment/delete/${commentId}`);
      const newComments = comments.filter((c) => c._id !== commentId);
      setComments(newComments);
      // Update post comment count
      setCurrentPost((prev) => ({
        ...prev,
        commentsCount: Math.max(0, (prev.commentsCount || 0) - 1),
      }));
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const getAvatar = (userData) => {
    return userData?.profile?.avatar?.url || userData?.avatar || ANONYMOUS_AVATAR;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (isLoading && !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-4">
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="bg-red-50 border border-red-200 rounded-sm p-4 text-sm text-red-600">
          {message || 'Something went wrong while loading this post.'}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 text-sm text-gray-500">
          Post not found.
        </div>
      </div>
    );
  }

  // Only render if we have valid post data
  if (!currentPost) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 text-sm text-gray-500">
          Loading post data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-0">
        {/* Back Button */} 
         <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Post Card */}
        <div className="mb-6">
          <SimplePostCard post={currentPost} />
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comments
          </h3>

          {/* Comment Input */}
          {replyingTo && (
            <div className="mb-3 p-2 bg-gray-50 border-l-2 border-gray-900 rounded-sm text-xs text-gray-600">
              Replying to <span className="font-medium">{replyingTo.user?.username}</span>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setNewComment('');
                }}
                className="ml-2 text-gray-400 hover:text-gray-900 transition"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="mb-4">
            <div className="flex items-start gap-2">
              <img
                src={getAvatar(user)}
                alt={user?.username}
                className="w-8 h-8 rounded-full object-cover bg-gray-100 flex-shrink-0"
                onError={(e) => (e.target.src = ANONYMOUS_AVATAR)}
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? `Reply to ${replyingTo.user?.username}...` : "Write a comment..."}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 transition"
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-900 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {loadingComments ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-2 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-10 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-6">
              <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const isOwner = user?._id === comment.user?._id || user?.id === comment.user?.id;
                const isEditing = editingId === comment._id;

                return (
                  <div key={comment._id} className="flex items-start gap-2 group">
                    <Link to={`/profile/${comment.user?._id || comment.user?.id}`}>
                      <img
                        src={getAvatar(comment.user)}
                        alt={comment.user?.username}
                        className="w-8 h-8 rounded-full object-cover bg-gray-100 flex-shrink-0"
                        onError={(e) => (e.target.src = ANONYMOUS_AVATAR)}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditingText('');
                              }}
                              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleEditComment(comment._id)}
                              className="px-2 py-1 text-xs text-gray-900 hover:bg-gray-100 rounded transition font-medium"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <Link
                              to={`/profile/${comment.user?._id || comment.user?.id}`}
                              className="text-xs font-semibold text-gray-900 hover:text-gray-700 transition"
                            >
                              {comment.user?.profile?.fullName || comment.user?.name || comment.user?.username}
                            </Link>
                            {isOwner && (
                              <div className="relative opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === comment._id ? null : comment._id)}
                                  className="p-1 hover:bg-gray-200 rounded transition"
                                >
                                  <MoreHorizontal className="w-3 h-3 text-gray-600" />
                                </button>
                                {openMenuId === comment._id && (
                                  <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                    <button
                                      onClick={() => {
                                        setEditingId(comment._id);
                                        setEditingText(comment.text || comment.content);
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-900 hover:bg-gray-50 transition"
                                    >
                                      <Pencil className="w-3 h-3" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment._id)}
                                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-900 hover:bg-gray-50 transition"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-800 mt-1">{comment.text || comment.content}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1 ml-1">
                        <span className="text-[11px] text-gray-500">{formatDate(comment.createdAt)}</span>
                        {!isEditing && (
                          <button
                            onClick={() => setReplyingTo(comment)}
                            className="text-[11px] text-gray-500 hover:text-gray-900 transition flex items-center gap-1"
                          >
                            <Reply className="w-3 h-3" />
                            Reply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}