import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Send } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import AnonymousAvatar from './AnonymousAvatar';
import { loadComments, submitReply } from '../../features/confession/confessionSlice';
import confessionService from '../../features/confession/confessionService';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function ReplyItem({ comment }) {
  const persona = comment.anonymousPersona;
  return (
    <div className="flex gap-2 py-2 border-b border-gray-200 last:border-0">
      <AnonymousAvatar persona={persona} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-800">{persona?.name}</span>
          <span className="text-[10px] text-slate-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{comment.content}</p>
      </div>
    </div>
  );
}

export default function ConfessionCard({ confession, defaultExpanded = false }) {
  const dispatch = useDispatch();
  const postId = confession._id || confession.id;
  const persona = confession.anonymousPersona;
  const { commentsByPost, commentsLoading } = useSelector((s) => s.confession);

  const [showReplies, setShowReplies] = useState(
    defaultExpanded || (confession.commentsCount || 0) > 0,
  );
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(confession.likesCount || 0);
  const [replying, setReplying] = useState(false);

  const comments = commentsByPost[postId] || [];
  const topLevel = comments.filter((c) => !c.parentComment);

  useEffect(() => {
    if (showReplies && !commentsByPost[postId] && !commentsLoading[postId]) {
      dispatch(loadComments(postId));
    }
  }, [showReplies, postId, commentsByPost, commentsLoading, dispatch]);

  const handleLike = async () => {
    try {
      if (liked) {
        await confessionService.unlikeConfession(postId);
        setLikeCount((n) => Math.max(0, n - 1));
        setLiked(false);
      } else {
        await confessionService.likeConfession(postId);
        setLikeCount((n) => n + 1);
        setLiked(true);
      }
    } catch { /* ignore */ }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || replying) return;
    setReplying(true);
    try {
      await dispatch(submitReply({ postId, text: replyText.trim() })).unwrap();
      setReplyText('');
      setShowReplies(true);
    } finally {
      setReplying(false);
    }
  };

  return (
    <article className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <AnonymousAvatar persona={persona} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-slate-900">{persona?.name}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">{timeAgo(confession.createdAt)}</span>
            </div>
            {confession.category && (
              <span className="text-xs text-teal-600 font-medium">
                {confession.category}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {confession.content}
        </p>

        {/* Tags */}
        {confession.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {confession.tags.map((tag) => (
              <span key={tag} className="text-xs font-medium text-teal-600">#{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-1">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              liked 
                ? 'text-red-600 bg-red-50' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart size={16} className={liked ? 'fill-red-600' : ''} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button
            type="button"
            onClick={() => setShowReplies((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <MessageCircle size={16} />
            {(confession.commentsCount || topLevel.length) > 0 && (
              <span>{confession.commentsCount || topLevel.length}</span>
            )}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Share2 size={16} />
          </button>
          <button
            type="button"
            className="ml-auto flex items-center px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <Bookmark size={16} />
          </button>
        </div>
      </div>

      {/* Replies Section */}
      {showReplies && (
        <div className="border-t border-gray-200 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Replies
          </p>

          {commentsLoading[postId] ? (
            <p className="text-xs text-slate-400 py-2">Loading replies…</p>
          ) : topLevel.length > 0 ? (
            <div className="space-y-3 mb-3">
              {topLevel.map((c) => <ReplyItem key={c._id || c.id} comment={c} />)}
            </div>
          ) : null}

          {/* Reply Input */}
          <form onSubmit={handleReply} className="flex items-center gap-2">
            <AnonymousAvatar persona={persona} size="sm" />
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write an anonymous reply…"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || replying}
              className="p-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
