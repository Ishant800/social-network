import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { likePost, unlikePost } from '../../features/post/postSlice';
import { toggleBookmark } from '../../features/bookmarks/bookmarkSlice';
import API from '../../api/axios';

export default function SimplePostCard({ post }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { likedPostIds } = useSelector((state) => state.posts);
  const { ids: bookmarkIds } = useSelector((state) => state.bookmarks);
  const { user: currentUser } = useSelector((state) => state.auth);

  const postId = post._id || post.id;
  const [localLiked, setLocalLiked] = useState(post.isLiked || likedPostIds.includes(postId));
  const [localLikes, setLocalLikes] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const menuRef = useRef(null);

  const isBookmarked = bookmarkIds.includes(postId);
  const authorName = post.author?.fullName || post.author?.username || 'Unknown';
  const authorAvatar = post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=3b82f6&color=ffffff`;

  // Check if current user owns this post
  const isOwner = currentUser && (
    post.author?.userId === currentUser._id ||
    post.user === currentUser._id ||
    post.user?._id === currentUser._id
  );

  // Format date
  const createdDate = new Date(post.createdAt);
  const formattedDate = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = createdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    const wasLiked = localLiked;
    setLocalLiked(!wasLiked);
    setLocalLikes(wasLiked ? localLikes - 1 : localLikes + 1);
    setIsLiking(true);
    try {
      if (wasLiked) {
        await dispatch(unlikePost(postId)).unwrap();
      } else {
        await dispatch(likePost(postId)).unwrap();
      }
    } catch {
      setLocalLiked(wasLiked);
      setLocalLikes(wasLiked ? localLikes : localLikes - 1);
    } finally {
      setIsLiking(false);
    }
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
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  if (deleted) return null;

  return (
    <article
      onClick={() => navigate(`/post/${postId}`)}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer"
    >
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-3">
        <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900">{authorName}</h3>
          <p className="text-xs text-gray-500">{formattedDate} at {formattedTime}</p>
        </div>

        {/* Three dots menu - only for post owner */}
        {isOwner && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-gray-800 text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            #{post.tags[0]}
          </span>
        </div>
      )}

      {/* Media */}
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

      {/* Actions */}
      <div className="grid grid-cols-4 gap-1 mt-3">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="h-8 text-xs gap-1.5 flex items-center justify-center rounded transition hover:bg-gray-50"
        >
          <Heart className={`h-3.5 w-3.5 ${localLiked ? 'fill-black text-black' : 'text-gray-500'}`} />
          <span className="text-gray-500">{localLikes}</span>
        </button>

        <button className="h-8 text-xs gap-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded transition">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.commentsCount || 0}
        </button>

        <button className="h-8 text-xs gap-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded transition">
          <Share2 className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={handleBookmark}
          className="h-8 text-xs gap-1.5 flex items-center justify-center rounded transition hover:bg-gray-50"
        >
          <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-blue-600 text-blue-600' : 'text-gray-500'}`} />
        </button>
      </div>
    </article>
  );
}