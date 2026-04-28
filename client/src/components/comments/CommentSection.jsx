import { Loader2, Pencil, Send, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

function formatCommentTime(value) {
  if (!value) return '';

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function CommentSection({ postId, compact = false, targetType = 'Post' }) {
  const { user } = useSelector((state) => state.auth);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadComments = async () => {
      try {
        setLoading(true);
        setError(null);
          const response = await API.get(`/comment/getComment/${postId}?type=${targetType}`);
        if (isMounted) {
          setComments(response.data?.comments || []);
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

    if (postId) {
      loadComments();
    }

    return () => {
      isMounted = false;
    };
  }, [postId, targetType]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!commentText.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      const response = await API.post(`/comment/create/${postId}`, {
        text: commentText.trim(),
        targetType,
      });
      setComments((prev) => [response.data.comment, ...prev]);
      setCommentText('');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (comment) => {
    setEditingId(comment._id || comment.id);
    setEditingText(comment.text || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleUpdate = async (commentId) => {
    if (!editingText.trim()) return;

    try {
      setActionLoadingId(commentId);
      setError(null);
      const response = await API.put(`/comment/update/${commentId}`, {
        text: editingText.trim(),
      });
      setComments((prev) =>
        prev.map((comment) =>
          (comment._id || comment.id) === commentId ? response.data.comment : comment,
        ),
      );
      cancelEditing();
    } catch (err) {
      setError(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      setActionLoadingId(commentId);
      setError(null);
      await API.delete(`/comment/delete/${commentId}`);
      setComments((prev) => prev.filter((comment) => (comment._id || comment.id) !== commentId));
      if (editingId === commentId) {
        cancelEditing();
      }
    } catch (err) {
      setError(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <section className={compact ? 'space-y-4' : 'space-y-6'}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
      </div>

      <form className="mb-6" onSubmit={handleSubmit}>
        <div className="relative">
          <input
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Write a comment..."
            className="h-10 w-full rounded-lg border border-gray-200 pl-3 pr-11 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || submitting}
            className="absolute flex items-center gap-2 right-2 top-1/2 -translate-y-1/2 text-gray-600 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading comments...</span>
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-gray-500">Could not load comments right now. Please try again.</p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => {
          const commentId = comment._id || comment.id;
          const isOwner = user?._id === comment.user?._id || user?.id === comment.user?._id;
          const isEditing = editingId === commentId;
          
          // Get avatar with proper fallback chain
          const avatar = 
            comment.user?.profile?.avatar?.url ||
            comment.user?.profileImage?.url ||
            comment.user?.avatar?.url ||
            'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg';
          
          const userName = comment.user?.profile?.fullName || comment.user?.name || comment.user?.username || 'User';
          const userId = comment.user?._id || comment.user?.id;

          return (
            <div key={commentId} className="border-b border-gray-200 pb-4">
              <div className="flex items-start gap-3">
                <Link to={`/profile/${userId}`} onClick={(e) => e.stopPropagation()}>
                  <img 
                    src={avatar} 
                    alt={userName} 
                    className="h-10 w-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg';
                    }}
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Link 
                        to={`/profile/${userId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition"
                      >
                        {userName}
                      </Link>
                      <p className="text-xs text-gray-400">{formatCommentTime(comment.createdAt)}</p>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2 text-gray-400">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(comment)}
                              className="transition"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(commentId)}
                              className="transition"
                              disabled={actionLoadingId === commentId}
                            >
                              {actionLoadingId === commentId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-3">
                      <textarea
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        className="min-h-[72px] w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500"
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdate(commentId)}
                          disabled={!editingText.trim() || actionLoadingId === commentId}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {actionLoadingId === commentId ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-gray-700">{comment.text}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
