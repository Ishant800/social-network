import { Loader2, Pencil, Send, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
    <section className={compact ? 'space-y-5' : 'space-y-6'}>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
      </div>

      <form className="rounded-xl p-1" onSubmit={handleSubmit}>
        <div className="relative">
          <input
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Write a comment..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-11 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || submitting}
            className="absolute flex items-center gap-2 border px-2 py-2 rounded-sm right-2 top-1/2 -translate-y-1/2 text-slate-700 transition bg-blue-600 hover:text-[#4e44d4] disabled:opacity-50"
          > Send
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading comments...</span>
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-rose-500">Could not load comments right now. Please try again.</p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => {
          const commentId = comment._id || comment.id;
          const isOwner = user?._id === comment.user?._id || user?.id === comment.user?._id;
          const isEditing = editingId === commentId;
          const avatar =
            comment.user?.profileImage?.url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}`;

          return (
            <article key={commentId} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <img src={avatar} alt={comment.user?.name || 'User'} className="h-10 w-10 rounded-full object-cover" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{comment.user?.name || 'User'}</h4>
                      <p className="text-xs text-slate-400">{formatCommentTime(comment.createdAt)}</p>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2 text-slate-400">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="transition hover:text-slate-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(comment)}
                              className="transition hover:text-slate-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(commentId)}
                              className="transition hover:text-rose-600"
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
                        className="min-h-[72px] w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none"
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdate(commentId)}
                          disabled={!editingText.trim() || actionLoadingId === commentId}
                          className="rounded-lg bg-[#4e44d4] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          {actionLoadingId === commentId ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-slate-700">{comment.text}</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
