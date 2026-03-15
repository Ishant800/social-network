import { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Edit3,
  Globe,
  Heart,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trash2,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CommentSection from '../comment/commentSection';
import { likePost, toggleBookmark, unlikePost } from '../../features/post/postSlice';

export default function PostCard({
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
  const { likedPostIds, bookmarks, isLoading } = useSelector((state) => state.posts);

  const [showComments, setShowComments] = useState(defaultShowComments);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPublic, setIsPublic] = useState(post?.isPublic ?? true);

  const dropdownRef = useRef(null);

  const postId = post?._id || post?.id;
  const images = post?.media || post?.images || [];
  const authorName = post?.user?.name || post?.author || 'Unknown User';
  const username = post?.user?.name
    ? post.user.name.toLowerCase().replace(/\s+/g, '')
    : post?.username || 'user';
  const time = post?.createdAt || post?.time;
  const avatar =
    post?.user?.profileImage?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`;

  const isOwner = currentUser?.id === post?.user;
  const isLiked = likedPostIds?.includes(postId);
  const isBookmarked = bookmarks?.some((item) => (item._id || item.id) === postId);

  const likeCount =
    typeof post?.likesCount === 'number'
      ? post.likesCount
      : typeof post?.likes === 'number'
        ? post.likes
        : Array.isArray(post?.likes)
          ? post.likes.length
          : 0;

  const commentCount =
    typeof post?.comments === 'number'
      ? post.comments
      : typeof post?.commentsCount === 'number'
        ? post.commentsCount
        : 0;

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
    navigate(`/post/${postId}`);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (!postId) return;
    if (isLiked) {
      dispatch(unlikePost(postId));
      return;
    }
    dispatch(likePost(postId));
  };

  const handleComment = (e) => {
    e.stopPropagation();
    if (enableInlineComments) {
      setShowComments(!showComments);
      return;
    }
    goToDetails();
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
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete?.(postId);
    }
    setShowDropdown(false);
  };

  const handlePrivacyToggle = (e) => {
    e.stopPropagation();
    setIsPublic(!isPublic);
    setShowDropdown(false);
  };

  return (
    <article
      className={`rounded-xl border border-slate-100 bg-white p-4 shadow-sm mb-4 ${
        disableNavigation ? '' : 'cursor-pointer'
      }`}
      onClick={goToDetails}
    >
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            className="w-10 h-10 rounded-full object-cover bg-slate-100"
            alt={authorName}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`;
            }}
          />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{authorName}</h3>
            <p className="text-xs text-slate-500">
              @{username} {time ? `- ${new Date(time).toLocaleString()}` : ''}
            </p>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-slate-100 shadow-lg z-10 py-1">
              {isOwner && (
                <>
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                  >
                    <Edit3 className="w-4 h-4" /> Edit post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                  >
                    <Trash2 className="w-4 h-4" /> Delete post
                  </button>
                  <button
                    onClick={handlePrivacyToggle}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span className="flex items-center gap-2">
                      {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      {isPublic ? 'Public' : 'Private'}
                    </span>
                    <div
                      className={`w-8 h-4 rounded-full relative transition ${
                        isPublic ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition ${
                          isPublic ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </div>
                  </button>
                </>
              )}

              <button
                onClick={handleBookmark}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
              >
                <Bookmark className="w-4 h-4" /> Save post
              </button>
            </div>
          )}
        </div>
      </header>

      <p className="text-sm text-slate-800 mb-3 leading-relaxed">{post?.content}</p>

      {post?.tags?.length > 0 && (
        <p className="text-sm text-indigo-600 mb-3">#{post.tags[0]}</p>
      )}

      {images.length > 0 && (
        <div
          className={`grid gap-1 rounded-lg overflow-hidden mb-3 ${
            images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {images.slice(0, 4).map((img, index) => {
            const isFirstOfThree = images.length === 3 && index === 0;
            return (
              <div
                key={index}
                className={`relative bg-slate-50 cursor-pointer group ${
                  isFirstOfThree ? 'row-span-2' : ''
                } ${images.length === 1 ? 'h-64' : 'h-40'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToDetails();
                }}
              >
                <img
                  src={img}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      +{images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            disabled={isLoading && !isLiked}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              isLiked
                ? 'text-rose-600 bg-rose-50'
                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">{likeCount}</span>
          </button>

          <button
            onClick={handleComment}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              showComments
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">{commentCount}</span>
          </button>

          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleBookmark}
          className={`p-2 rounded-lg transition ${
            isBookmarked
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {enableInlineComments && showComments && <CommentSection postId={postId} />}
    </article>
  );
}
