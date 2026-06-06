import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Share2, Bookmark, MoreHorizontal, Pencil, Trash2, ThumbsUp } from 'lucide-react';
import { reactToPost } from '../../features/post/postSlice';
import { toggleBookmark } from '../../features/bookmarks/bookmarkSlice';
import postService from '../../features/post/postService';
import engagementService from '../../features/engagement/engagementService';
import API from '../../api/axios';
import { getDisplayName, getAvatarUrl } from '../../utils/userDisplay';

// Anonymous placeholder image
const ANONYMOUS_AVATAR = "data:image/jpeg;base64,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";

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

const REACTION_ACTIVE_STYLES = {
  like:  'text-blue-600 bg-blue-50',
  love:  'text-red-600 bg-red-50',
  haha:  'text-amber-600 bg-amber-50',
  wow:   'text-purple-600 bg-purple-50',
  sad:   'text-slate-600 bg-slate-100',
  angry: 'text-orange-600 bg-orange-50',
};

export default function SimplePostCard({ post }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ids: bookmarkIds } = useSelector((state) => state.bookmarks);
  const { user: currentUser } = useSelector((state) => state.auth);

  // Guard against null/undefined post
  if (!post) {
    console.error('SimplePostCard: post is null or undefined');
    return null;
  }

  const postId = post._id || post.id;

  const [userReaction, setUserReaction] = useState(post.userReaction || null);
  const [localLikes, setLocalLikes] = useState(post.likesCount || 0);
  const [localReactions, setLocalReactions] = useState(post.reactions || {});
  const [showPicker, setShowPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const menuRef = useRef(null);
  const pickerRef = useRef(null);
  const hoverTimer = useRef(null);

  const isBookmarked = bookmarkIds.includes(postId);
  const authorName = getDisplayName(post.author);
  const authorAvatar = getAvatarUrl(post.author, ANONYMOUS_AVATAR);

  const isOwner = currentUser && (
    post.author?.userId === currentUser._id ||
    post.user === currentUser._id ||
    post.user?._id === currentUser._id
  );

  const createdDate = new Date(post.createdAt);
  const formattedDate = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = createdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

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
    const prevLikes = localLikes;

    if (prevReaction === type) {
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
      
      // Update interest scores based on reaction
      try {
        await postService.updateInterestScores({
          action: 'react',
          category: post.category,
          tags: post.tags || [],
          reactionType: type
        });
      } catch (err) {
        console.error('Failed to update interest scores:', err);
      }
    } catch {
      setUserReaction(prevReaction);
      setLocalLikes(prevLikes);
    } finally {
      setIsReacting(false);
    }
  };

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

  const handleBookmark = async (e) => {
    e.stopPropagation();
    dispatch(toggleBookmark({ itemId: postId, type: 'post' }));
    
    // Update interest scores for bookmark action
    try {
      await postService.updateInterestScores({
        action: 'bookmark',
        category: post.category,
        tags: post.tags || []
      });
    } catch (err) {
      console.error('Failed to update interest scores:', err);
    }
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

  const topReactions = Object.entries(localReactions)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => getReactionEmoji(type));

  const wordCount = post.content ? post.content.trim().split(/\s+/).length : 0;
  const isLongContent = wordCount > 100;
  const shouldTruncate = isLongContent && !showFullContent;
  
  const getTruncatedContent = () => {
    if (!post.content) return '';
    
    const words = post.content.trim().split(/(\s+)/);
    
    if (words.filter(word => word.trim() && !/^\s+$/.test(word)).length <= 100) {
      return post.content;
    }
    
    let count = 0;
    let truncatedContent = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      if (word.trim() && !/^\s+$/.test(word)) {
        count++;
        if (count > 100) break;
      }
      
      truncatedContent += word;
    }
    
    return truncatedContent.trim() + '...';
  };

  const displayContent = shouldTruncate ? getTruncatedContent() : post.content;

  if (deleted) return null;

  return (
    <article className="bg-white rounded-sm p-4 sm:p-5 border border-gray-200 transition hover:border-gray-300">

      {/* Author Info */}
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={authorAvatar} 

          className="h-10 w-10 cursor-pointer rounded-full object-cover bg-gray-100"
          onError={(e) => {
            e.target.src = ANONYMOUS_AVATAR;
          }}
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
          <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 transition">{authorName}</h3>
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
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg z-20 py-1">
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

      {/* Content */}
      <div className="cursor-pointer" onClick={() => navigate(`/post/${postId}`)}>
        {post.content && (
          <div className="mb-3">
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line break-words">{displayContent}</p>
            {isLongContent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullContent(!showFullContent);
                }}
                className="mt-2 text-xs text-teal-600 hover:text-teal-700 transition"
              >
                {showFullContent ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-medium text-black">
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
                  className="w-full max-h-125 object-contain bg-gray-50 rounded-lg cursor-zoom-in"
                />
              ) : (
                <div key={idx} className="h-60 bg-gray-100 overflow-hidden">
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

      {/* Actions */}
      <div className="mt-3 grid grid-cols-4 gap-1 border-t border-gray-100 pt-2">
        {/* Reaction button with picker */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={handleLikeClick}
            onMouseEnter={handleLikeMouseEnter}
            onMouseLeave={handleLikeMouseLeave}
            disabled={isReacting}
            className={`w-full h-8 text-xs gap-1.5 flex items-center justify-center rounded transition hover:bg-gray-50 ${
              userReaction
                ? REACTION_ACTIVE_STYLES[userReaction] || 'text-blue-600 bg-blue-50'
                : 'text-gray-500'
            }`}
          >
            {localLikes > 0 ? (
              <>
                <div className="flex -space-x-1">
                  {topReactions.map((emoji, i) => (
                    <span
                      key={i}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs leading-none"
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium">{localLikes}</span>
              </>
            ) : (
              <>
                <ThumbsUp className="h-4 w-4" />
                <span className="text-xs">Like</span>
              </>
            )}
          </button>

          {/* Reaction picker popup - REDUCED SIZES */}
          {showPicker && (
            <div
              className="absolute bottom-full left-0 mb-2 flex items-center gap-0.5 bg-white rounded-full border border-gray-200 p-1.5 z-30 shadow-lg"
              onMouseEnter={() => clearTimeout(hoverTimer.current)}
              onMouseLeave={() => setShowPicker(false)}
            >
              {REACTIONS.map(({ type, emoji, label, bg }) => (
                <button
                  key={type}
                  onClick={(e) => handleReact(e, type)}
                  title={label}
                  className={`relative group flex items-center justify-center w-8 h-8 rounded-full ${bg} hover:scale-110 transition-all duration-200 ${
                    userReaction === type ? 'scale-110 ring-1 ring-teal-400' : ''
                  }`}
                >
                  <span className="text-base leading-none">{emoji}</span>
                  {/* Tooltip */}
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment */}
        <button
          onClick={() => navigate(`/post/${postId}`)}
          className="h-8 text-xs gap-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded transition"
        >
          <MessageCircle className="h-4 w-4" />
          {post.commentsCount || 0}
        </button>

        {/* Share */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            const shareUrl = `${window.location.origin}/post/${postId}`;
            try {
              await engagementService.trackShare('post', postId);
            } catch (err) {
              console.error('Share tracking failed:', err);
            }
            try {
              if (navigator.share) {
                await navigator.share({ url: shareUrl });
              } else {
                await navigator.clipboard.writeText(shareUrl);
              }
            } catch {
              // User cancelled share dialog
            }
          }}
          className="h-8 text-xs gap-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded transition"
        >
          <Share2 className="h-4 w-4" />
        </button>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className="h-8 text-xs gap-1.5 flex items-center justify-center rounded transition hover:bg-gray-50"
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-teal-600 text-teal-600' : 'text-slate-500'}`} />
        </button>
      </div>
    </article>
  );
}