import { useEffect, useState } from 'react';
import { Send, Smile, MoreHorizontal, Heart, Loader2 } from 'lucide-react';


export default function CommentSection({ postId }) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest(`/comment/getComment/${postId}`);
        if (isMounted) {
          setComments(data?.comments || []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    try {
      setSubmitting(true);
      const data = await apiRequest(`/comment/create/${postId}`, {
        method: 'POST',
        body: { text: commentText.trim() },
        auth: true,
      });
      setComments((prev) => [data.comment, ...prev]);
      setCommentText('');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
      
      {/* 1. Write a Comment Input */}
      <form className="flex gap-3 mb-6" onSubmit={handleSubmit}>
        <img 
          src="https://ui-avatars.com/api/?name=Ishant&background=4f46e5&color=fff" 
          className="w-8 h-8 rounded-full flex-shrink-0"
          alt="My Profile"
        />
        <div className="flex-1 relative group">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-gray-50 border-none rounded-2xl py-2 px-4 pr-20 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="text-gray-400 hover:text-amber-500 transition-colors">
              <Smile className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="text-indigo-600 disabled:text-gray-300 p-1 hover:bg-indigo-50 rounded-full transition-all flex items-center justify-center"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </form>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Loading comments...</span>
        </div>
      )}

      {!loading && error && (
        <p className="text-xs text-rose-500 mb-3">
          Could not load comments. Please try again.
        </p>
      )}

      {/* 2. Comments List */}
      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment._id || comment.id} className="flex gap-3 group">
            <img 
              src={`https://ui-avatars.com/api/?name=${comment.user?.name || 'User'}`} 
              className="w-8 h-8 rounded-full flex-shrink-0"
              alt={comment.user}
            />
            <div className="flex-1">
              <div className="bg-gray-50 rounded-2xl px-4 py-2 relative">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-900 hover:underline cursor-pointer">
                    {comment.user?.name || 'User'}
                  </span>
                  <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-700 leading-snug mt-0.5">
                  {comment.text}
                </p>
                
                {/* Like Badge (Floating) */}
                {comment.likes > 0 && (
                  <div className="absolute -right-2 -bottom-2 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow-sm">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span className="text-[10px] font-bold text-slate-500">{comment.likes}</span>
                  </div>
                )}
              </div>

              {/* Comment Actions */}
              <div className="flex items-center gap-4 mt-1 ml-2 text-[11px] font-bold text-slate-500">
                <button className="hover:text-indigo-600 transition-colors uppercase tracking-wider">
                  Like
                </button>
                <button className="hover:text-indigo-600 transition-colors uppercase tracking-wider">
                  Reply
                </button>
                <span className="font-normal text-slate-400 lowercase">
                  {/* No time field from API yet; placeholder */}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View more button (future pagination) */}
    </div>
  );
}