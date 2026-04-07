import { memo, useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Edit3,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trash2,
  Eye,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CommentSection from '../comments/CommentSection';
import { likePost, toggleBookmark, unlikePost } from '../../features/post/postSlice';
import { isBlogPost } from '../../utils/feedType';

// ============ HELPER FUNCTIONS ============

function formatMetaTime(time) {
  if (!time) return '';
  const date = new Date(time);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / 3600000));
  if (diffHours < 1) {
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatCount(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `${value}`;
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Strip HTML tags for preview text
const stripHTML = (html) => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

// Get display content based on post type
const getDisplayContent = (post) => {
  // For blogs
  if (isBlogPost(post)) {
    if (post?.summary) return post.summary;
    if (typeof post?.content === 'string') return stripHTML(post.content).substring(0, 200);
    if (post?.content?.body) return stripHTML(post.content.body).substring(0, 200);
    return '';
  }
  
  // For regular posts
  if (post?.content) return post.content;
  return '';
};

// Get preview for blog cards
const getBlogPreview = (post) => {
  if (post?.summary?.trim()) return post.summary.trim();
  if (typeof post?.content === 'string') return stripHTML(post.content).substring(0, 150);
  if (post?.content?.body) return stripHTML(post.content.body).substring(0, 150);
  return '';
};

function PostCard({
  post,
  currentUser,
  onEdit,
  onDelete,
  disableNavigation = false,
  enableInlineComments = false,
  defaultShowComments = false,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { likedPostIds, bookmarks } = useSelector((state) => state.posts);
  const authUser = useSelector((state) => state.auth.user);

  const [showComments, setShowComments] = useState(defaultShowComments);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const postId = post?._id || post?.id;
  const isBlog = isBlogPost(post);
  
  // Get owner ID from different structures
  const ownerId = post?.user?._id || post?.user || post?.author?._id;
  const viewerId = currentUser?._id || currentUser?.id || authUser?._id || authUser?.id;
  const isOwner = !isBlog && ownerId && viewerId && String(ownerId) === String(viewerId);
  const isLiked = likedPostIds?.includes(postId);
  const isBookmarked = bookmarks?.some((item) => (item._id || item.id) === postId);
  
  // Get author info from different structures
  const authorName = post?.user?.name || post?.user?.username || post?.author?.username || 'Unknown';
  const authorHandle = post?.user?.username || post?.author?.username || 'user';
  const authorAvatar = post?.user?.profileImage?.url || post?.user?.profileImage || post?.author?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=3b82f6&color=ffffff`;
  
  // Blog specific
  const blogCover = post?.coverImage?.url?.trim();
  const blogPreview = getBlogPreview(post);
  const readTime = post?.readTime ? `${post.readTime} min read` : '';
  const blogTitle = post?.title;
  
  // Get stats from different possible structures
  const views = post?.stats?.views || post?.views || 0;
  const likes = post?.stats?.likes || post?.likesCount || 0;
  const comments = post?.stats?.comments || post?.commentsCount || 0;
  
  // Get display content
  const displayContent = getDisplayContent(post);
  
  // Get creation date
  const createdAt = post?.publishedAt || post?.createdAt;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToDetails = () => {
    if (disableNavigation || !postId) return;
    navigate(isBlog ? `/blog/${postId}` : `/post/${postId}`);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (isBlog) return goToDetails();
    if (isLiked) dispatch(unlikePost(postId));
    else dispatch(likePost(postId));
  };

  const handleComment = (e) => {
    e.stopPropagation();
    if (enableInlineComments) setShowComments(!showComments);
    else goToDetails();
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    dispatch(toggleBookmark(post));
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(post);
    setShowDropdown(false);
    navigate('/post/edit');
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this post?')) onDelete?.(postId);
    setShowDropdown(false);
  };

  // ============ BLOG CARD DESIGN ============
  if (isBlog) {
    return (
      <article className="group bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="flex gap-4 p-4">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            {/* Author Row */}
            <div className="flex items-center gap-2 mb-2">
              <img src={authorAvatar} alt={authorName} className="w-6 h-6 rounded-full object-cover" />
              <span className="text-sm font-medium text-gray-900">{authorName}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">{formatDate(createdAt)}</span>
            </div>

            {/* Title */}
            <h2 
              onClick={goToDetails}
              className="text-lg font-bold text-gray-900 hover:text-blue-600 cursor-pointer leading-tight mb-2 line-clamp-2"
            >
              {blogTitle}
            </h2>

            {/* Preview */}
            {blogPreview && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{blogPreview}</p>
            )}

            {/* Meta Row */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {readTime && (
                <>
                  <span>{readTime}</span>
                  <span>·</span>
                </>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {comments}
              </span>
            </div>
          </div>

          {/* Right Thumbnail */}
          {blogCover && (
            <div 
              onClick={goToDetails}
              className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
            >
              <img 
                src={blogCover} 
                alt={blogTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
        </div>
      </article>
    );
  }

  // ============ REGULAR POST CARD DESIGN ============
  return (
    <article className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{authorName}</h3>
            <p className="text-xs text-gray-400">
              @{authorHandle} · {formatMetaTime(createdAt)}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1">
                <button onClick={handleEdit} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={handleDelete} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div onClick={goToDetails} className="cursor-pointer">
        {displayContent && (
          <p className="text-gray-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
            {displayContent}
          </p>
        )}
        
        {post?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              #{post.tags[0]}
            </span>
          </div>
        )}

        {/* Images */}
        {post?.media?.length > 0 && (
          <div className={`grid gap-1 mb-3 rounded-lg overflow-hidden ${
            post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            {post.media.slice(0, 4).map((img, idx) => (
              <div key={idx} className={`bg-gray-100 ${post.media.length === 1 ? 'aspect-video' : 'h-32'}`}>
                <img src={img?.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
        <div className="flex items-center gap-1">
          <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
          }`}>
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{formatCount(likes)}</span>
          </button>

          <button onClick={handleComment} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
            showComments ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
          }`}>
            <MessageCircle className="h-4 w-4" />
            <span>{formatCount(comments)}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition">
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <button onClick={handleBookmark} className={`p-2 rounded-lg transition ${
          isBookmarked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
        }`}>
          <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Comments Section */}
      {enableInlineComments && showComments && (
        <CommentSection postId={postId} targetType="Post" />
      )}
    </article>
  );
}

export default memo(PostCard);