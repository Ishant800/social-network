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

export default function CommentSection({ postId, compact = false }) {
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
        const response = await API.get(`/comment/getComment/${postId}`);
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
  }, [postId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!commentText.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      const response = await API.post(`/comment/create/${postId}`, {
        text: commentText.trim(),
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
        <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-slate-900">Discussion</h3>
        <p className="mt-1 text-sm text-slate-500">Share your thoughts and manage your comments here.</p>
      </div>

      <form
        className={`rounded-[1.5rem] bg-white shadow-sm ${compact ? 'p-4' : 'p-5'}`}
        onSubmit={handleSubmit}
      >
        <textarea
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          placeholder="Write a comment..."
          className="min-h-[96px] w-full resize-none rounded-[1rem] bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={!commentText.trim() || submitting}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Post comment
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
            <article key={commentId} className="rounded-[1.5rem] bg-white p-4 shadow-sm">
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
                        className="min-h-[88px] w-full resize-none rounded-[1rem] bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdate(commentId)}
                          disabled={!editingText.trim() || actionLoadingId === commentId}
                          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
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
