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
    <div className="flex gap-2.5 py-2.5 border-b border-slate-100 last:border-0">
      <AnonymousAvatar persona={persona} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-800">{persona?.name}</span>
          <span className="text-[10px] text-slate-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{comment.content}</p>
        <button type="button" className="mt-1 text-[10px] font-semibold text-slate-400 hover:text-[#7B61FF]">
          Reply
        </button>
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
    <article className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden animate-fade-up">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <AnonymousAvatar persona={persona} size="md" />
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-slate-900">{persona?.name}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-400">{timeAgo(confession.createdAt)}</span>
            </div>
            {confession.category && (
              <span className="text-xs text-[#7B61FF] font-medium">
                in {confession.category}
              </span>
            )}
          </div>
        </div>

        <p className="mt-3 text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap">
          {confession.content}
        </p>

        {confession.tags?.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {confession.tags.map((tag) => (
              <span key={tag} className="text-xs font-semibold text-[#7B61FF]">#{tag}</span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              liked ? 'text-red-500' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Heart size={16} className={liked ? 'fill-red-500' : ''} />
            {likeCount > 0 ? likeCount : null}
          </button>
          <button
            type="button"
            onClick={() => setShowReplies((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <MessageCircle size={16} />
            {(confession.commentsCount || topLevel.length) > 0
              ? (confession.commentsCount || topLevel.length)
              : null}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <Share2 size={16} />
          </button>
          <button
            type="button"
            className="ml-auto flex items-center px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
          >
            <Bookmark size={16} />
          </button>
        </div>
      </div>

      {showReplies && (
        <div className="border-t border-slate-100 bg-[#faf9ff] px-4 sm:px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Anonymous Replies
          </p>

          {commentsLoading[postId] ? (
            <p className="text-xs text-slate-400 py-2">Loading replies…</p>
          ) : topLevel.length > 0 ? (
            <div>{topLevel.map((c) => <ReplyItem key={c._id || c.id} comment={c} />)}</div>
          ) : null}

          <form onSubmit={handleReply} className="mt-2 flex items-center gap-2">
            <AnonymousAvatar persona={persona} size="sm" />
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write an anonymous reply…"
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF]/50"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || replying}
              className="p-2.5 rounded-full bg-[#7B61FF] text-white hover:bg-[#6a52e8] disabled:opacity-40 transition-colors"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
