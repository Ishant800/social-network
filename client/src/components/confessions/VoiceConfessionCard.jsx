import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Mic, Send } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import AnonymousAvatar from './AnonymousAvatar';
import VoicePlayer from './VoicePlayer';
import { loadComments, submitReply } from '../../features/confession/confessionSlice';
import confessionService from '../../features/confession/confessionService';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function VoiceConfessionCard({ confession, defaultExpanded = false }) {
  const dispatch = useDispatch();
  const postId = confession._id || confession.id;
  const persona = confession.anonymousPersona;
  const { commentsByPost, commentsLoading } = useSelector((s) => s.confession);

  const [showReplies, setShowReplies] = useState(defaultExpanded);
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
    <article className="rounded-2xl bg-white border border-orange-100/80 shadow-sm overflow-hidden animate-fade-up">
      <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-2.5">
          <div className="relative shrink-0">
            <AnonymousAvatar persona={persona} size="sm" />
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 border border-white flex items-center justify-center">
              <Mic size={8} className="text-white" />
            </span>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-slate-900">{persona?.name}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-400">{timeAgo(confession.createdAt)}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                Voice
              </span>
            </div>
            {confession.category && (
              <span className="text-xs text-orange-600 font-medium">{confession.category}</span>
            )}
          </div>
        </div>

        {confession.voice?.url && (
          <div className="mt-2.5">
            <VoicePlayer
              url={confession.voice.url}
              duration={confession.voice.duration}
              variant="voice"
              compact
            />
          </div>
        )}

        {confession.content?.trim() && (
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">{confession.content}</p>
        )}

        {confession.tags?.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {confession.tags.map((tag) => (
              <span key={tag} className="text-xs font-semibold text-orange-600">#{tag}</span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              liked ? 'text-red-500' : 'text-slate-500 hover:bg-orange-50'
            }`}
          >
            <Heart size={16} className={liked ? 'fill-red-500' : ''} />
            {likeCount > 0 ? likeCount : null}
          </button>
          <button
            type="button"
            onClick={() => setShowReplies((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-orange-50 transition-colors"
          >
            <MessageCircle size={16} />
            {(confession.commentsCount || topLevel.length) > 0
              ? (confession.commentsCount || topLevel.length)
              : null}
          </button>
        </div>
      </div>

      {showReplies && (
        <div className="border-t border-orange-100 bg-orange-50/30 px-4 sm:px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400/80 mb-2">
            Replies
          </p>
          {commentsLoading[postId] ? (
            <p className="text-xs text-slate-400 py-2">Loading…</p>
          ) : topLevel.length > 0 ? (
            <div className="space-y-2 mb-2">
              {topLevel.map((c) => (
                <div key={c._id || c.id} className="flex gap-2 text-sm">
                  <AnonymousAvatar persona={c.anonymousPersona} size="sm" />
                  <div>
                    <span className="text-xs font-bold text-slate-700">{c.anonymousPersona?.name}</span>
                    <p className="text-slate-600">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <form onSubmit={handleReply} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply anonymously…"
              className="flex-1 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || replying}
              className="p-2.5 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
