import { memo, useEffect, useRef, useState } from 'react';
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
        className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-md shadow-slate-900/5 transition active:scale-[0.99] ${
          disableNavigation ? '' : 'cursor-pointer'
        }`}
        onClick={goToDetails}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={authorAvatar}
              className="h-11 w-11 rounded-full object-cover bg-slate-200"
              alt={authorName}
              loading="lazy"
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

        <div className="mt-3 rounded-xl bg-teal-50/90 p-4">
          <div className="flex items-start gap-4">
            {blogCover && (
              <div className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-[12px] bg-slate-200 sm:block">
                <img
                  src={blogCover}
                  alt={post?.title || 'Blog preview'}
                  className="h-full w-full object-cover"
                  loading="lazy"
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
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToDetails();
                }}
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-semibold text-teal-700 transition active:text-teal-900"
              >
                Read Article
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex flex-wrap gap-5">
            <button
              type="button"
              onClick={handleLike}
              className={`flex min-h-11 min-w-11 items-center gap-2 rounded-xl px-2 py-2 transition-colors active:bg-slate-50 ${
                isLiked ? 'text-teal-700' : 'text-slate-500 hover:text-teal-700'
              }`}
            >
              <Heart className={`h-[18px] w-[18px] ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {formatCount(post?.likesCount || 0)}
              </span>
            </button>

            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="flex min-h-11 items-center gap-2 rounded-xl px-2 py-2 text-slate-500 transition-colors active:bg-slate-50"
            >
              <Share2 className="h-[18px] w-[18px]" />
              <span className="text-xs font-bold uppercase tracking-wider">Share</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleBookmark}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-colors active:bg-slate-50 ${
              isBookmarked ? 'text-teal-700' : 'text-slate-500 hover:text-teal-700'
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
      className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-md shadow-slate-900/5 transition active:scale-[0.99] ${
        disableNavigation ? '' : 'cursor-pointer'
      }`}
      onClick={goToDetails}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={authorAvatar}
            className="h-11 w-11 shrink-0 rounded-full object-cover bg-slate-200"
            alt={authorName}
            loading="lazy"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`;
            }}
          />
          <div className="min-w-0">
            <h3 className="truncate font-display text-[0.95rem] font-bold text-slate-900">
              {authorName}
            </h3>
            <p className="truncate text-xs text-slate-500">
              @{authorHandle}
              {post?.createdAt ? ` · ${formatMetaTime(post.createdAt)}` : ''}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition active:bg-slate-100"
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
                    <div className={`h-4 w-8 rounded-full ${isPublic ? 'bg-teal-600' : 'bg-slate-300'}`}>
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

      <p className="mb-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-slate-800">
        {post?.content}
      </p>

      {post?.tags?.length > 0 && (
        <p className="mb-3 text-sm font-semibold text-teal-700">#{primaryTag}</p>
      )}

      {post?.media?.length > 0 && (
        <div
          className={`mb-3 grid max-h-[min(70vh,420px)] gap-1 overflow-hidden rounded-xl ${
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
                } ${post.media.length === 1 ? 'aspect-[4/3]' : 'h-36'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToDetails();
                }}
              >
                <img
                  src={img?.url}
                  alt={`Post image ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
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

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={handleLike}
            className={`flex min-h-11 items-center gap-2 rounded-xl px-2 py-2 transition-colors active:bg-slate-50 ${
              isLiked ? 'text-teal-700' : 'text-slate-600'
            }`}
          >
            <Heart className={`h-[18px] w-[18px] ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {formatCount(post?.likesCount || 0)}
            </span>
          </button>

          <button
            type="button"
            onClick={handleComment}
            className={`flex min-h-11 items-center gap-2 rounded-xl px-2 py-2 transition-colors active:bg-slate-50 ${
              showComments ? 'text-teal-700' : 'text-slate-600'
            }`}
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {formatCount(post?.commentsCount || 0)}
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex min-h-11 items-center gap-2 rounded-xl px-2 py-2 text-slate-600 transition-colors active:bg-slate-50"
          >
            <Share2 className="h-[18px] w-[18px]" />
            <span className="text-xs font-bold uppercase tracking-wider">Share</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleBookmark}
          className={`flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-colors active:bg-slate-50 ${
            isBookmarked ? 'text-teal-700' : 'text-slate-600'
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

export default memo(PostCard);
