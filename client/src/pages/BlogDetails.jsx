import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MessageCircle,
  Share2,
  Heart,
  Eye,
  Bookmark,
  Users,
  MessageSquare,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import CommentSection from '../components/comments/CommentSection';
import { getBlogDetails, likeBlog, unlikeBlog } from '../features/post/postSlice';
import { toggleBookmark } from '../features/bookmarks/bookmarkSlice';
import { getcomments } from '../features/comment/commentSlice';

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const getAuthor = (blog) => {
  const author = blog?.author || blog?.user || {};
  return {
    name: author.username || author.name || 'Writer',
    handle: author.username || 'writer',
    avatar:
      author.avatar?.trim() ||
      author.profileImage?.url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(author.username || 'Writer')}&background=3b82f6&color=ffffff`,
    id: author._id || author.id,
  };
};

const getStats = (blog) => ({
  views: blog?.stats?.views ?? blog?.views ?? 0,
  comments: blog?.stats?.comments ?? blog?.commentsCount ?? blog?.comments?.length ?? 0,
  likes: blog?.stats?.likes ?? blog?.likesCount ?? 0,
});

const getReadTime = (blog) => blog?.readTime || 1;

const getBlogBody = (blog) => {
  if (typeof blog?.content === 'string' && blog.content.trim()) return blog.content;
  if (typeof blog?.content?.body === 'string' && blog.content.body.trim()) return blog.content.body;
  if (typeof blog?.body === 'string' && blog.body.trim()) return blog.body;
  return '';
};

const parseTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags
    .flatMap((tag) => tag.split(',').map((item) => item.trim()))
    .filter(Boolean);
};

// Render HTML content directly
const renderBlogContent = (htmlContent) => {
  if (!htmlContent) return <p className="text-gray-500">No content available.</p>;
  
  let formattedContent = htmlContent;
  
  formattedContent = formattedContent.replace(/<p>/g, '<p class="mb-4 leading-relaxed">');
  formattedContent = formattedContent.replace(/<h1>/g, '<h1 class="text-3xl font-bold mt-8 mb-4">');
  formattedContent = formattedContent.replace(/<h2>/g, '<h2 class="text-2xl font-bold mt-8 mb-3">');
  formattedContent = formattedContent.replace(/<h3>/g, '<h3 class="text-xl font-bold mt-6 mb-3">');
  formattedContent = formattedContent.replace(/<ul>/g, '<ul class="list-disc ml-6 mb-4 space-y-1">');
  formattedContent = formattedContent.replace(/<ol>/g, '<ol class="list-decimal ml-6 mb-4 space-y-1">');
  formattedContent = formattedContent.replace(/<li>/g, '<li class="text-gray-700">');
  formattedContent = formattedContent.replace(/<blockquote>/g, '<blockquote class="border-l-4 border-blue-500 bg-blue-50 p-4 my-4 italic rounded-r-lg">');
  formattedContent = formattedContent.replace(/<code>/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-blue-600">');
  formattedContent = formattedContent.replace(/<pre>/g, '<pre class="bg-gray-900 rounded-lg p-4 my-4 overflow-x-auto">');
  formattedContent = formattedContent.replace(/<strong>/g, '<strong class="font-bold text-gray-900">');
  formattedContent = formattedContent.replace(/<em>/g, '<em class="italic text-gray-700">');
  
  return (
    <div 
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
};

// Combined Discussion Section (Comments + Live Discussion)
function DiscussionSection({ postId }) {
  const [activeTab, setActiveTab] = useState('comments');
  const commentState = useSelector((state) => state.comment);
  const comments = commentState?.comments || [];
  const commentsCount = Array.isArray(comments) ? comments.length : 0;

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      {/* Tab Buttons */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'comments'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Comments ({commentsCount})
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'live'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4" />
          Live Discussion
          <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
        </button>
      </div>

      {/* Comments Tab Content */}
      {activeTab === 'comments' && (
        <div>
          <CommentSection postId={postId} targetType="Blog" />
        </div>
      )}

      {/* Live Discussion Tab Content */}
      {activeTab === 'live' && (
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Live Now</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-gray-900">Join the Live Discussion</h3>
              <p className="mt-1 text-sm text-gray-600">
                Chat in real-time with readers and the author
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-2.5">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {commentsCount} people discussing
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              12 active now
            </span>
          </div>

          <Link
            to={`/discussionroom/${postId}`}
            className="mt-5 flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition"
          >
            Join live discussion room
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function BlogDetails() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { blogDetails, likedPostIds, isLoading } = useSelector((state) => state.posts);
  const { ids: bookmarkIds } = useSelector((state) => state.bookmarks);
  const commentState = useSelector((state) => state.comment);
  const comments = commentState?.comments || [];
  
  const [error, setError] = useState(null);
  const [isLiking, setIsLiking] = useState(false);

  const blog = (blogDetails?._id || blogDetails?.id) === postId ? blogDetails : null;
  const isLiked = likedPostIds?.includes(postId);
  const isBookmarked = bookmarkIds?.includes(postId);

  // Fetch blog data using Redux
  useEffect(() => {
    if (postId && !blog) {
      dispatch(getBlogDetails(postId)).catch((err) => {
        setError(err.message || 'Failed to load blog');
      });
    }
  }, [dispatch, postId, blog]);

  // Fetch comments for this blog
  useEffect(() => {
    if (postId) {
      dispatch(getcomments(postId));
    }
  }, [dispatch, postId]);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      if (isLiked) {
        await dispatch(unlikeBlog(postId)).unwrap();
      } else {
        await dispatch(likeBlog(postId)).unwrap();
      }
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = () => {
    dispatch(toggleBookmark({ itemId: postId, type: 'blog' }));
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: blog?.title,
        text: blog?.summary,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading && !blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PostSkeleton />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          {error || 'Blog not found'}
        </div>
      </div>
    );
  }

  const author = getAuthor(blog);
  const stats = {
    views: blog?.stats?.views ?? blog?.views ?? 0,
    comments: comments?.length ?? blog?.stats?.comments ?? blog?.commentsCount ?? 0,
    likes: blog?.stats?.likes ?? blog?.likesCount ?? 0,
  };
  const tags = parseTags(blog.tags);
  const readTime = getReadTime(blog);
  const articleBody = getBlogBody(blog);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Main Content */}
      <article>
        {/* Header */}
        <header className="pb-6 border-b border-gray-100">
          {blog?.category?.name && (
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              {blog.category.name}
            </span>
          )}

          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {blog?.title}
          </h1>

          {/* Summary */}
          {blog?.summary && (
            <div className="mt-4 text-lg text-gray-600 leading-relaxed border-l-4 border-blue-500 pl-4 italic">
              {blog.summary}
            </div>
          )}

          {/* Author & Meta */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{author.name}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(blog.publishedAt || blog.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {readTime} min read
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-600' : ''}`} />
                {stats.likes}
              </button>
              <button
                onClick={handleBookmark}
                className={`p-1.5 rounded-full transition ${
                  isBookmarked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 transition"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {blog?.coverImage?.url && (
          <div className="my-8 rounded-xl overflow-hidden bg-gray-100 shadow-md">
            <img
              src={blog.coverImage.url.trim()}
              alt={blog.title}
              className="w-full h-auto object-cover max-h-125"
            />
          </div>
        )}

        {/* Blog Body */}
        <div className="mt-8">
          {renderBlogContent(articleBody)}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="mt-6 flex items-center gap-6 text-sm text-gray-500 py-4 border-t border-gray-100">
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            {stats.views} views
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            {stats.likes} likes
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {stats.comments} comments
          </span>
        </div>

        {/* Discussion Section (Comments + Live Discussion Tabs) */}
        <DiscussionSection postId={postId} />
      </article>

      {/* Custom CSS for blog content */}
      <style>{`
        .blog-content p {
          margin-bottom: 1.5rem;
          line-height: 1.75;
          color: #374151;
        }
        .blog-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #111827;
        }
        .blog-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          color: #111827;
        }
        .blog-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #111827;
        }
        .blog-content ul, .blog-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.25rem;
          color: #374151;
        }
        .blog-content blockquote {
          border-left: 4px solid #3b82f6;
          background-color: #eff6ff;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          border-radius: 0.5rem;
        }
        .blog-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: monospace;
          color: #2563eb;
        }
        .blog-content pre {
          background-color: #111827;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          overflow-x: auto;
        }
        .blog-content pre code {
          background-color: transparent;
          color: #f3f4f6;
          padding: 0;
        }
      `}</style>
    </div>
  );
}