import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
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
import CommentSection from '../comments/CommentSection';
import { likePost, toggleBookmark, unlikePost } from '../../features/post/postSlice';
import { isBlogPost } from '../../utils/feedType';

function formatMetaTime(time) {
  if (!time) return '';

  const date = new Date(time);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / 3600000));

  if (diffHours < 1) {
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatCount(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `${value}`;
}

function getBlogPreviewText(post) {
  if (post?.summary?.trim()) return post.summary.trim();
  if (typeof post?.content === 'string') return post.content.trim();
  if (post?.content?.body) return post.content.body.trim();
  return '';
}

function getBlogCover(post) {
  return (
    post?.coverImage?.url?.trim() ||
    post?.media?.[0]?.url ||
    ''
  );
}

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
  const authUser = useSelector((state) => state.auth.user);

  const [showComments, setShowComments] = useState(defaultShowComments);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isPublic, setIsPublic] = useState(post?.isPublic ?? true);

  const dropdownRef = useRef(null);

  const postId = post?._id || post?.id;
  const isBlog = isBlogPost(post);
  const ownerId = post?.user?._id || post?.user;
  const viewerId = currentUser?._id || currentUser?.id || authUser?._id || authUser?.id;
  const isOwner = !isBlog && ownerId && viewerId && ownerId === viewerId;
  const isLiked = likedPostIds?.includes(postId);
  const isBookmarked = bookmarks?.some((item) => (item._id || item.id) === postId);
  const authorName = post?.user?.name || 'Unknown User';
  const authorHandle = post?.user?.username || post?.username || 'user';
  const authorAvatar =
    post?.user?.profileImage?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=f0d9c9&color=4f3427`;
  const blogPreview = getBlogPreviewText(post);
  const blogCover = getBlogCover(post);
  const primaryTag = post?.tags?.[0];

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
    navigate(isBlogPost(post) ? `/blog/${postId}` : `/post/${postId}`);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (!postId) return;
    if (isBlog) {
      goToDetails();
      return;
    }

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

  if (isBlog) {
    return (
      <article
        className={`overflow-hidden rounded-[20px] bg-[#f7f8fd] p-4 shadow-[0_16px_40px_-24px_rgba(44,47,49,0.22)] transition-all duration-300 sm:p-5 ${
          disableNavigation ? '' : 'cursor-pointer'
        }`}
        onClick={goToDetails}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={authorAvatar}
              className="h-10 w-10 rounded-full object-cover bg-[#f0d9c9]"
              alt={authorName}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`;
              }}
            />
            <div className="min-w-0">
              <h3 className="truncate font-display text-sm font-semibold text-slate-900">
                {authorName}
              </h3>
              <p className="truncate text-xs text-slate-500">
                {post?.createdAt ? formatMetaTime(post.createdAt) : `@${authorHandle}`}
              </p>
            </div>
          </div>

          <span className="shrink-0 text-xs text-slate-400">
            {post?.createdAt ? formatMetaTime(post.createdAt) : `@${authorHandle}`}
          </span>
        </div>

        <div className="mt-4 rounded-[16px] bg-[#eef0ff] p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {blogCover && (
              <div className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-[12px] bg-slate-200 sm:block">
                <img
                  src={blogCover}
                  alt={post?.title || 'Blog preview'}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {primaryTag && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b6fe3]">
                    {primaryTag}
                  </span>
                )}
                <span className="rounded bg-[#6b6fe3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Featured Read
                </span>
              </div>

              {post?.title && (
                <h2 className="mt-2 line-clamp-2 text-[1.15rem] font-bold leading-6 text-slate-900">
                  {post.title}
                </h2>
              )}

              {blogPreview && (
                <p className="mt-2 min-h-[3.75rem] line-clamp-2 text-sm leading-6 text-slate-600">
                  {blogPreview}
                </p>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToDetails();
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5a5ee6] transition hover:text-[#474bcf]"
              >
                Read Article
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#e7eaf3] pt-4">
          <div className="flex flex-wrap gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                isLiked ? 'text-[#4e44d4]' : 'text-slate-500 hover:text-[#4e44d4]'
              }`}
            >
              <Heart className={`h-[18px] w-[18px] ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {formatCount(post?.likesCount || 0)}
              </span>
            </button>

            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-slate-500 transition-colors hover:text-[#4e44d4]"
            >
              <Share2 className="h-[18px] w-[18px]" />
              <span className="text-xs font-bold uppercase tracking-wider">Share</span>
            </button>
          </div>

          <button
            onClick={handleBookmark}
            className={`transition-colors ${
              isBookmarked ? 'text-[#4e44d4]' : 'text-slate-500 hover:text-[#4e44d4]'
            }`}
          >
            <Bookmark className={`h-[18px] w-[18px] ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`rounded-xl bg-slate-50 p-6 shadow-[0_24px_48px_-12px_rgba(44,47,49,0.08)] transition-all duration-300  sm:p-7 ${
        disableNavigation ? '' : 'cursor-pointer'
      }`}
      onClick={goToDetails}
    >
      <header className="mb-5 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={authorAvatar}
            className="h-10 w-10 rounded-full object-cover bg-[#f0d9c9]"
            alt={authorName}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`;
            }}
          />
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-bold text-slate-900">
              {authorName}
            </h3>
            <p className="truncate text-xs text-slate-500">
              @{authorHandle}{' '}
              {post?.createdAt ? ` - ${formatMetaTime(post.createdAt)}` : ''}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="text-slate-400 transition hover:text-slate-700"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showDropdown && (
            <div className="absolute right-0 top-full z-10 mt-2 w-52 rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
              {isOwner && (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete post
                  </button>
                  <button
                    onClick={handlePrivacyToggle}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      {isPublic ? 'Public' : 'Private'}
                    </span>
                    <div className={`h-4 w-8 rounded-full ${isPublic ? 'bg-[#4e44d4]' : 'bg-slate-300'}`}>
                      <div
                        className={`relative top-0.5 h-3 w-3 rounded-full bg-white transition ${
                          isPublic ? 'left-4.5' : 'left-0.5'
                        }`}
                      />
                    </div>
                  </button>
                </>
              )}

              <button
                onClick={handleBookmark}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Bookmark className="h-4 w-4" />
                Save post
              </button>
            </div>
            )}
          </div>
        )}
      </header>

      <p className="mb-5 text-[16px] leading-6 text-slate-900">{post?.content}</p>

      {post?.tags?.length > 0 && (
        <p className="mb-5 text-sm font-medium text-[#4e44d4]">#{primaryTag}</p>
      )}

      {post?.media?.length > 0 && (
        <div
          className={`mb-6 grid gap-1 overflow-hidden rounded-[18px] ${
            post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {post.media.slice(0, 4).map((img, index) => {
            const isFirstOfThree = post.media.length === 3 && index === 0;
            return (
              <div
                key={index}
                className={`relative cursor-pointer bg-slate-50 ${
                  isFirstOfThree ? 'row-span-2' : ''
                } ${post.media.length === 1 ? 'aspect-video' : 'h-44 sm:h-56'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToDetails();
                }}
              >
                <img
                  src={img?.url}
                  alt={`Post image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 3 && post.media.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-lg font-semibold text-white">+{post.media.length - 4}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#eef1f3] pt-5">
        <div className="flex flex-wrap gap-6">
          <button
            onClick={handleLike}
            disabled={isLoading && !isLiked}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? 'text-[#4e44d4]' : 'text-slate-500 hover:text-[#4e44d4]'
            }`}
          >
            <Heart className={`h-[18px] w-[18px] ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {formatCount(post?.likesCount || 0)}
            </span>
          </button>

          <button
            onClick={handleComment}
            className={`flex items-center gap-2 transition-colors ${
              showComments ? 'text-[#4e44d4]' : 'text-slate-500 hover:text-[#4e44d4]'
            }`}
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {formatCount(post?.commentsCount || 0)}
            </span>
          </button>

          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-slate-500 transition-colors hover:text-[#4e44d4]"
          >
            <Share2 className="h-[18px] w-[18px]" />
            <span className="text-xs font-bold uppercase tracking-wider">Share</span>
          </button>
        </div>

        <button
          onClick={handleBookmark}
          className={`transition-colors ${
            isBookmarked ? 'text-[#4e44d4]' : 'text-slate-500 hover:text-[#4e44d4]'
          }`}
        >
          <Bookmark className={`h-[18px] w-[18px] ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {enableInlineComments && showComments && (
        <CommentSection postId={postId} targetType={isBlog ? 'Blog' : 'Post'} />
      )}
    </article>
  );
}
