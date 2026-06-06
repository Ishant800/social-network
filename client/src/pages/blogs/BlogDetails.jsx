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
import PostSkeleton from '@/components/ui/skeletons/PostSkeleton';
import CommentSection from '@/components/comments/CommentSection';
import { getBlogDetails, likeBlog, unlikeBlog } from '@/features/post/postSlice';
import { toggleBookmark } from '@/features/bookmarks/bookmarkSlice';
import engagementService from '@/features/engagement/engagementService';

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Component to render TipTap JSON content
function BlogContentRenderer({ content }) {
  if (!content) return null;

  // Function to render text with marks (bold, italic, etc.)
  const renderText = (textNode, key) => {
    if (!textNode.text) return null;

    let element = <span key={key}>{textNode.text}</span>;

    if (textNode.marks) {
      textNode.marks.forEach((mark, markIndex) => {
        const markKey = `${key}-${mark.type}-${markIndex}`;
        switch (mark.type) {
          case 'bold':
            element = <strong key={markKey}>{element}</strong>;
            break;
          case 'italic':
            element = <em key={markKey}>{element}</em>;
            break;
          case 'code':
            element = <code key={markKey}>{element}</code>;
            break;
          case 'link':
            element = (
              <a
                key={markKey}
                href={mark.attrs?.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {element}
              </a>
            );
            break;
          default:
            break;
        }
      });
    }

    return element;
  };

  // Function to render a single node
  const renderNode = (node, index) => {
    if (!node || !node.type) return null;

    switch (node.type) {
      case 'heading':
        const level = node.attrs?.level || 1;
        const HeadingTag = `h${level}`;
        return (
          <HeadingTag key={index} className="font-bold mt-6 mb-3">
            {node.content?.map((child, i) =>
              child.type === 'text' ? renderText(child, `${index}-h-${i}`) : null,
            )}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
            {node.content?.map((child, i) => {
              if (child.type === 'text') return renderText(child, `${index}-p-${i}`);
              if (child.type === 'hardBreak') return <br key={`${index}-br-${i}`} />;
              return null;
            })}
          </p>
        );

      case 'bulletList':
        return (
          <ul key={index} className="list-disc pl-6 mb-4 space-y-1">
            {node.content?.map((item, i) => renderNode(item, i))}
          </ul>
        );

      case 'orderedList':
        return (
          <ol key={index} className="list-decimal pl-6 mb-4 space-y-1">
            {node.content?.map((item, i) => renderNode(item, i))}
          </ol>
        );

      case 'listItem':
        return (
          <li key={index} className="text-gray-700">
            {node.content?.map((child, i) => renderNode(child, i))}
          </li>
        );

      case 'blockquote':
        return (
          <blockquote key={index} className="border-l-4 border-blue-500 pl-4 py-2 my-4 italic bg-blue-50 rounded-r">
            {node.content?.map((child, i) => renderNode(child, i))}
          </blockquote>
        );

      case 'codeBlock':
        const code = node.content?.map(c => c.text).join('\n') || '';
        return (
          <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
            <code>{code}</code>
          </pre>
        );

      case 'hardBreak':
        return <br key={index} />;

      case 'horizontalRule':
        return <hr key={index} className="my-6 border-gray-200" />;

      default:
        // For unknown types, try to render content if it exists
        if (node.content) {
          return (
            <div key={index}>
              {node.content.map((child, i) => renderNode(child, i))}
            </div>
          );
        }
        return null;
    }
  };

  // Handle different content formats
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return (
        <div className="blog-content prose max-w-none">
          {parsed.content?.map((node, index) => renderNode(node, index))}
        </div>
      );
    } catch {
      return <div className="blog-content whitespace-pre-wrap">{content}</div>;
    }
  }

  // Legacy HTML body (older create flow)
  if (content.body && typeof content.body === 'string') {
    return (
      <div
        className="blog-content prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content.body }}
      />
    );
  }

  if (content.type === 'doc' && content.content) {
    return (
      <div className="blog-content prose max-w-none">
        {content.content.map((node, index) => renderNode(node, index))}
      </div>
    );
  }

  // Fallback for plain text
  return <div className="blog-content">{JSON.stringify(content)}</div>;
}

const getAuthor = (blog) => {
  const author = blog?.author || {};

  return {
    name:
      author?.profile?.fullName ||
      author?.username ||
      'Writer',

    handle:
      author?.username ||
      'writer',

    avatar:
      author?.profile?.avatar?.url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        author?.username || 'Writer'
      )}&background=3b82f6&color=ffffff`,

    id: author?._id,
  };
};

const getStats = (blog) => ({
  views: blog?.stats?.views || 0,
  comments: blog?.stats?.comments || 0,
  likes: blog?.stats?.likes || 0,
});

const getReadTime = (blog) => blog?.readTime || 1;


const getTags = (blog) => {
  return blog?.tags || [];
};

// Combined Discussion Section (Comments + Live Discussion)
function DiscussionSection({ postId, commentsCount, onCommentCountChange }) {
  const [activeTab, setActiveTab] = useState('comments');

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
          <CommentSection
            postId={postId}
            targetType="Blog"
            onCommentCountChange={onCommentCountChange}
          />
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

  const [error, setError] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  const blog = (blogDetails?._id || blogDetails?.id) === postId ? blogDetails : null;
  const isLiked = blog?.isLiked ?? likedPostIds?.includes(postId);
  const isBookmarked = bookmarkIds?.includes(postId);

  // Fetch blog data using Redux
  useEffect(() => {
    if (postId && !blog) {
      dispatch(getBlogDetails(postId)).catch((err) => {
        setError(err.message || 'Failed to load blog');
      });
    }
  }, [dispatch, postId, blog]);

  useEffect(() => {
    if (blog?.stats?.comments != null) {
      setCommentsCount(blog.stats.comments);
    }
  }, [blog?.stats?.comments]);

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
      await engagementService.trackShare('blog', postId);
    } catch (err) {
      console.error('Share tracking failed:', err);
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog?.title,
          text: blog?.summary,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch {
      // User cancelled share dialog
    }
  };

  const handleCommentCountChange = (count) => {
    setCommentsCount(count);
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
    views: blog?.stats?.views || 0,
    comments: commentsCount || blog?.stats?.comments || 0,
    likes: blog?.likesCount ?? blog?.stats?.likes ?? 0,
  };
  const tags = blog?.tags || [];
  const readTime = blog?.readTime || 1;
  const categoryLabel =
    typeof blog?.category === 'string' ? blog.category : blog?.category?.name;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Main Content */}
      <article>
        {/* Header */}
        <header className="pb-6 border-b border-gray-100">
          {categoryLabel && (
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              {categoryLabel}
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
          <BlogContentRenderer content={blog.content} />
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
        <DiscussionSection
          postId={postId}
          commentsCount={stats.comments}
          onCommentCountChange={handleCommentCountChange}
        />
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