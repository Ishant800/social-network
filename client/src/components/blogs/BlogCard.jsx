import { useState } from 'react';
import { Bookmark, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { likeBlog, unlikeBlog } from '@/features/post/postSlice';
import { toggleBookmark } from '@/features/bookmarks/bookmarkSlice';
import { getDisplayName, getAvatarUrl } from '@/utils/userDisplay';

export default function BlogCard({ post }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { likedPostIds } = useSelector((state) => state.posts);
  const { ids: bookmarkIds } = useSelector((state) => state.bookmarks);

  const postId = post._id || post.id;
  const [localLiked, setLocalLiked] = useState(post.isLiked || likedPostIds.includes(postId));
  const [localLikes, setLocalLikes] = useState(post.likesCount || post.likes?.length || 0);
  const [isLiking, setIsLiking] = useState(false);

  const isBookmarked = bookmarkIds.includes(postId);
  const authorName = getDisplayName(post.author);
  const authorId = post.author?.userId || post.author?._id;
  const authorAvatar =
    getAvatarUrl(post.author) ||
    'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg';

  const createdDate = new Date(post.publishedAt || post.createdAt);
  const formattedDate = createdDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });

  const readTime = post.readTime || Math.ceil((post.content?.length || 0) / 1000) || 5;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isLiking) return;

    const wasLiked = localLiked;
    setLocalLiked(!wasLiked);
    setLocalLikes(wasLiked ? localLikes - 1 : localLikes + 1);
    setIsLiking(true);

    try {
      if (wasLiked) {
        await dispatch(unlikeBlog(postId)).unwrap();
      } else {
        await dispatch(likeBlog(postId)).unwrap();
      }
    } catch (error) {
      setLocalLiked(wasLiked);
      setLocalLikes(wasLiked ? localLikes : localLikes - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    dispatch(toggleBookmark({ itemId: postId, type: 'blog' }));
  };

  return (
    <article className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex gap-6">
        {/* Left Content Section */}
        <div className="flex-1 min-w-0">
          {/* Author Row */}
          <div className="flex items-center gap-2 mb-2">
            <Link to={`/profile/${authorId}`} onClick={(e) => e.stopPropagation()}>
              <img 
                src={authorAvatar} 
                alt={authorName} 
                className="w-6 h-6 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
              />
            </Link>
            <Link 
              to={`/profile/${authorId}`} 
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium text-gray-900 hover:text-gray-700 transition"
            >
              {authorName}
            </Link>
          </div>

          {/* Title */}
          <div onClick={() => navigate(`/blog/${postId}`)} className="cursor-pointer">
            <h2 className="text-xl font-bold text-gray-900 hover:text-gray-700 leading-tight mb-2 line-clamp-2">
              {post.title}
            </h2>
          </div>

          {/* Summary */}
          {post.summary && (
            <div onClick={() => navigate(`/blog/${postId}`)} className="cursor-pointer">
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.summary}</p>
            </div>
          )}

          {/* Bottom Metadata Row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span>{formattedDate}</span>
            <span>·</span>
            <span>{readTime} min read</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition"
            >
              <Heart className={`h-4 w-4 ${localLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-xs">{localLikes}</span>
            </button>

            <button
              onClick={handleBookmark}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition"
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage?.url && (
          <div 
            onClick={() => navigate(`/blog/${postId}`)} 
            className="shrink-0 cursor-pointer"
          >
            <div className="w-32 h-32 rounded overflow-hidden bg-gray-100">
              <img
                src={post.coverImage.url}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
