import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Share2, Bookmark, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { reactToPost } from '../../features/post/postSlice';
import { toggleBookmark } from '../../features/bookmarks/bookmarkSlice';
import API from '../../api/axios';

const REACTIONS = [
  { type: 'like',  emoji: '👍', label: 'Like',  bg: 'bg-blue-50 hover:bg-blue-100' },
  { type: 'love',  emoji: '❤️', label: 'Love',  bg: 'bg-red-50 hover:bg-red-100' },
  { type: 'haha',  emoji: '😂', label: 'Haha',  bg: 'bg-yellow-50 hover:bg-yellow-100' },
  { type: 'wow',   emoji: '😮', label: 'Wow',   bg: 'bg-purple-50 hover:bg-purple-100' },
  { type: 'sad',   emoji: '😢', label: 'Sad',   bg: 'bg-gray-50 hover:bg-gray-100' },
  { type: 'angry', emoji: '😡', label: 'Angry', bg: 'bg-orange-50 hover:bg-orange-100' },
];

const getReactionEmoji = (type) => {
  const reaction = REACTIONS.find(r => r.type === type);
  return reaction?.emoji || '👍';
};

export default function SimplePostCard({ post }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ids: bookmarkIds } = useSelector((state) => state.bookmarks);
  const { user: currentUser } = useSelector((state) => state.auth);

  const postId = post._id || post.id;

  const [userReaction, setUserReaction]   = useState(post.userReaction || null);
  const [localLikes, setLocalLikes]       = useState(post.likesCount || 0);
  const [localReactions, setLocalReactions] = useState(post.reactions || {});
  const [showPicker, setShowPicker]       = useState(false);
  const [showMenu, setShowMenu]           = useState(false);
  const [deleted, setDeleted]             = useState(false);
  const [isReacting, setIsReacting]       = useState(false);

  const menuRef    = useRef(null);
  const pickerRef  = useRef(null);
  const hoverTimer = useRef(null);

  const isBookmarked = bookmarkIds.includes(postId);
  const authorName   = post.author?.fullName || post.author?.username || 'Unknown';
  const authorAvatar =
    post.author?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=f0fdfa&color=0f766e`;

  const isOwner = currentUser && (
    post.author?.userId === currentUser._id ||
    post.user === currentUser._id ||
    post.user?._id === currentUser._id
  );

  const createdDate   = new Date(post.createdAt);
  const formattedDate = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = createdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // Close menu/picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleReact = async (e, type) => {
    e.stopPropagation();
    if (isReacting) return;
    setShowPicker(false);

    const prevReaction = userReaction;
    const prevLikes    = localLikes;

    // Optimistic update
    if (prevReaction === type) {
      // Toggle off
      setUserReaction(null);
      setLocalLikes(prev => Math.max(0, prev - 1));
    } else {
      setUserReaction(type);
      setLocalLikes(prev => prevReaction ? prev : prev + 1);
    }

    setIsReacting(true);
    try {
      const result = await dispatch(reactToPost({ postId, reactionType: type })).unwrap();
      setLocalLikes(result.likesCount);
      setLocalReactions(result.reactions || {});
      setUserReaction(result.userReaction);
    } catch {
      // Revert on error
      setUserReaction(prevReaction);
      setLocalLikes(prevLikes);
    } finally {
      setIsReacting(false);
    }
  };

  // Quick click = like, hover = show picker
  const handleLikeClick = (e) => {
    e.stopPropagation();
    handleReact(e, 'like');
  };

  const handleLikeMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setShowPicker(true), 500);
  };

  const handleLikeMouseLeave = () => {
    clearTimeout(hoverTimer.current);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    dispatch(toggleBookmark({ itemId: postId, type: 'post' }));
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    navigate('/post/edit', { state: { post } });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/post/delete/${postId}`);
      setDeleted(true);
    } catch {
      alert('Failed to delete post');
    }
  };

  // Top 3 reactions to show as summary
  const topReactions = Object.entries(localReactions)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => getReactionEmoji(type));

  if (deleted) return null;

  return (
    <article className="surface-card rounded-2xl p-4 sm:p-5 transition hover:shadow-[var(--shadow-float)]">

      {/* Author Info */}
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={authorAvatar} 
          alt={authorName} 
          className="h-10 w-10 cursor-pointer rounded-full object-cover ring-2 ring-transparent transition hover:ring-teal-400/80"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${post.author?.userId || post.user?._id || post.user}`);
          }}
        />
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${post.author?.userId || post.user?._id || post.user}`);
          }}
        >
          <h3 className="text-sm font-medium text-slate-900 transition hover:text-teal-700">{authorName}</h3>
          <p className="text-xs text-gray-500">{formattedDate} at {formattedTime}</p>
        </div>

        {isOwner && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                <button onClick={handleEdit} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={handleDelete} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content - clickable to navigate */}
      <div className="cursor-pointer" onClick={() => navigate(`/post/${postId}`)}>
        {post.content && (
          <p className="text-gray-800 text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">
              #{post.tags[0]}
            </span>
          </div>
        )}

        {post.media && post.media.length > 0 && (
          <div className={`grid gap-1 mb-3 rounded-lg overflow-hidden ${
            post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            {post.media.slice(0, 4).map((img, idx) => (
              post.media.length === 1 ? (
                <img
                  key={idx}
                  src={img.url}
                  alt=""
                  onClick={(e) => { e.stopPropagation(); window.open(img.url, '_blank'); }}
                  className="w-full max-h-[500px] object-contain bg-gray-50 rounded-lg cursor-zoom-in"
                />
              ) : (
                <div key={idx} className="h-[240px] bg-gray-100 overflow-hidden">
                  <img
                    src={img.url}
                    alt=""
                    onClick={(e) => { e.stopPropagation(); window.open(img.url, '_blank'); }}
                    className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition"
                  />
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Reaction summary */}
      {localLikes > 0 && (
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <div className="flex -space-x-1">
            {topReactions.map((emoji, i) => (
              <span key={i} className="text-lg leading-none">{emoji}</span>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">{localLikes}</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 grid grid-cols-4 gap-1 border-t border-slate-100 pt-3">

        {/* Reaction button with picker */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={handleLikeClick}
            onMouseEnter={handleLikeMouseEnter}
            onMouseLeave={handleLikeMouseLeave}
            disabled={isReacting}
            className={`flex h-8 w-full items-center justify-center gap-1.5 rounded text-xs transition hover:bg-teal-50/60 ${
              userReaction ? 'font-medium text-teal-700' : 'text-slate-500'
            }`}
          >
            <span className="text-lg leading-none">
              {userReaction ? getReactionEmoji(userReaction) : '👍'}
            </span>
            <span className="text-xs">
              {userReaction
                ? REACTIONS.find(r => r.type === userReaction)?.label
                : 'Like'}
            </span>
          </button>

          {/* Reaction picker popup */}
          {showPicker && (
            <div
              className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-white rounded-full shadow-xl border border-gray-200 p-2 z-30"
              onMouseEnter={() => clearTimeout(hoverTimer.current)}
              onMouseLeave={() => setShowPicker(false)}
            >
              {REACTIONS.map(({ type, emoji, label, bg }) => (
                <button
                  key={type}
                  onClick={(e) => handleReact(e, type)}
                  title={label}
                  className={`relative group flex items-center justify-center w-12 h-12 rounded-full ${bg} hover:scale-125 transition-all duration-200 ${
                    userReaction === type ? 'scale-125 ring-2 ring-teal-400' : ''
                  }`}
                >
                  <span className="text-2xl leading-none">{emoji}</span>
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment - navigates to post */}
        <button
          onClick={() => navigate(`/post/${postId}`)}
          className="h-8 text-xs gap-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded transition"
        >
          <MessageCircle className="h-5 w-5" />
          {post.commentsCount || 0}
        </button>

        {/* Share */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigator.share?.({ url: `${window.location.origin}/post/${postId}` });
          }}
          className="h-8 text-xs gap-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded transition"
        >
          <Share2 className="h-5 w-5" />
        </button>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className="h-8 text-xs gap-1.5 flex items-center justify-center rounded transition hover:bg-gray-50"
        >
          <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-teal-600 text-teal-600' : 'text-slate-500'}`} />
        </button>
      </div>
    </article>
  );
}
