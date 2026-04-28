import { useState } from 'react';
import { Bookmark, Heart, MessageCircle, Eye } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { likeBlog, unlikeBlog } from '../../features/post/postSlice';
import { toggleBookmark } from '../../features/bookmarks/bookmarkSlice';

export default function BlogCard({ post }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { likedPostIds } = useSelector((state) => state.posts);
  const { ids: bookmarkIds } = useSelector((state) => state.bookmarks);

  const postId = post._id || post.id;
  const [localLiked, setLocalLiked] = useState(post.isLiked || likedPostIds.includes(postId));
  const [localLikes, setLocalLikes] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);

  const isBookmarked = bookmarkIds.includes(postId);
  const authorName = post.author?.fullName || post.author?.username || 'Unknown';
  const authorAvatar = post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=3b82f6&color=ffffff`;

  // Format date: "Jan 15, 2024"
  const createdDate = new Date(post.publishedAt || post.createdAt);
  const formattedDate = createdDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });

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
    <article 
      onClick={() => navigate(`/blog/${postId}`)}
      className="bg-white rounded-lg border border-gray-200 cursor-pointer"
    >
      <div className="flex gap-4 p-4">
        <div className="flex-1 min-w-0">
          {/* Author Info */}
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="w-6 h-6 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${post.author?.userId || post.author?._id}`);
              }}
            />
            <span 
              className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${post.author?.userId || post.author?._id}`);
              }}
            >
              {authorName}
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </h2>

          {/* Summary */}
          {post.summary && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.summary}</p>
          )}

          <button className="text-sm text-gray-900 mb-3 font-medium">
            Read more
          </button>

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
              <Eye className="h-3.5 w-3.5" />
              {post.views || 0}
            </button>

            <button
              onClick={handleBookmark}
              className="h-8 text-xs gap-1.5 flex items-center justify-center rounded transition hover:bg-gray-50"
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-blue-600 text-blue-600' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage?.url && (
          <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={post.coverImage.url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </article>
  );
}
