import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MessageCircle,
  Share2,
  Users,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { getBlogDetails } from '../features/post/postSlice';

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
      `https://ui-avatars.com/api/?name=${encodeURIComponent(author.username || 'Writer')}`,
    id: author._id || author.id,
  };
};

const getStats = (blog) => ({
  views: blog?.stats?.views ?? 0,
  comments: blog?.stats?.comments ?? blog?.commentsCount ?? 0,
});

const getReadTime = (blog) => blog?.readTime || 1;

const getBlogBody = (blog) => {
  if (typeof blog?.content?.body === 'string' && blog.content.body.trim()) return blog.content.body;
  if (typeof blog?.content === 'string' && blog.content.trim()) return blog.content;
  if (typeof blog?.body === 'string' && blog.body.trim()) return blog.body;
  if (typeof blog?.summary === 'string' && blog.summary.trim()) return blog.summary;
  return '';
};

const parseTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags
    .flatMap((tag) => tag.split(',').map((item) => item.trim()))
    .filter(Boolean);
};

const renderBlogContent = (body) => {
  if (!body) return <p className="italic text-slate-500">No content available.</p>;

  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');

  const elements = [];
  let listItems = [];
  let inCodeBlock = false;
  let codeContent = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`list-${elements.length}`} className="ml-5 list-disc space-y-2 text-[1.02rem] leading-8 text-slate-700">
        {listItems.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  const flushCodeBlock = () => {
    if (codeContent.length === 0) return;
    elements.push(
      <pre
        key={`code-${elements.length}`}
        className="overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm text-slate-100"
      >
        <code>{codeContent.join('\n')}</code>
      </pre>,
    );
    codeContent = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={elements.length} className="mt-10 font-['Plus_Jakarta_Sans'] text-2xl font-bold text-slate-900">
          {line.replace('### ', '')}
        </h3>,
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={elements.length} className="mt-12 font-['Plus_Jakarta_Sans'] text-3xl font-bold tracking-tight text-slate-900">
          {line.replace('## ', '')}
        </h2>,
      );
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      listItems.push(line.replace(/^[-*]\s|^(\d+\.\s)/, ''));
      continue;
    }

    flushList();

    const formattedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-indigo-600">$1</code>');

    elements.push(
      <p
        key={elements.length}
        className="text-[1.06rem] leading-8 text-slate-700"
        dangerouslySetInnerHTML={{ __html: formattedLine }}
      />,
    );
  }

  flushList();
  flushCodeBlock();

  return <div className="space-y-6">{elements}</div>;
};

const DiscussionCard = ({ postId, comments, views }) => (
  <section className="rounded-2xl border border-[#d9ddff] bg-[linear-gradient(180deg,#f7f8ff_0%,#eef1ff_100%)] p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5c61d9]">
          Live Discussion
        </p>
        <h3 className="mt-2 text-base font-bold text-slate-900">
          Join the real-time reader room
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Readers can jump into a focused discussion room while reading, share reactions, and
          continue the conversation live.
        </p>
      </div>
      <div className="rounded-2xl bg-white/80 p-2 text-[#5c61d9]">
        <Users className="h-5 w-5" />
      </div>
    </div>

    <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
      <span className="inline-flex items-center gap-1.5">
        <MessageCircle className="h-4 w-4" />
        {comments} active replies
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Users className="h-4 w-4" />
        {Math.max(3, Math.min(views, 28))} readers online
      </span>
    </div>

    <Link
      to={`/discussionroom/${postId}`}
      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      Open Discussion Room
      <ChevronRight className="h-4 w-4" />
    </Link>
  </section>
);

const SuggestedBlogCard = ({ blog }) => (
  <Link
    to={`/blog/${blog._id || blog.id}`}
    className="group block rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-slate-300 hover:shadow-md"
  >
    {blog.coverImage?.url && (
      <div className="mb-3 overflow-hidden rounded-xl bg-slate-100">
        <img
          src={blog.coverImage.url.trim()}
          alt={blog.title}
          className="h-24 w-full object-cover transition group-hover:scale-105"
        />
      </div>
    )}
    <h4 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
      {blog.title}
    </h4>
    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{blog.summary}</p>
    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
      <CalendarDays className="h-3 w-3" />
      {formatDate(blog.publishedAt || blog.createdAt)}
    </div>
  </Link>
);

const SuggestionsSection = ({ currentBlog }) => {
  const suggestions = useMemo(() => {
    const category = currentBlog?.category?.name;
    return [
      {
        _id: 'dummy-1',
        title: 'Mastering Spring Security in 2026',
        summary: 'A practical guide to securing your Spring Boot applications with modern best practices.',
        coverImage: { url: 'https://res.cloudinary.com/djh5owgby/image/upload/v1774365121/meroroom/cn9v9kzyqpe51cve3etl.png' },
        publishedAt: '2026-03-20T10:00:00Z',
        category: { name: category },
      },
      {
        _id: 'dummy-2',
        title: 'React Performance Optimization Tips',
        summary: 'Learn how to make your React apps faster with memoization, code splitting, and more.',
        coverImage: { url: 'https://res.cloudinary.com/djh5owgby/image/upload/v1774363609/meroroom/oimoljbgdewkbmybpnbg.jpg' },
        publishedAt: '2026-03-18T14:30:00Z',
        category: { name: 'Web Development' },
      },
      {
        _id: 'dummy-3',
        title: 'Building Scalable APIs with Node.js',
        summary: 'Architecture patterns and tools for creating production-ready backend services.',
        coverImage: { url: 'https://res.cloudinary.com/djh5owgby/image/upload/v1774205447/meroroom/nvxc9kkcnvyc1uy1d17v.jpg' },
        publishedAt: '2026-03-15T09:15:00Z',
        category: { name: category },
      },
    ]
      .filter((item) => item.category?.name === category)
      .slice(0, 3);
  }, [currentBlog]);

  if (suggestions.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900">You may also like</h3>
      <p className="mt-1 text-sm text-slate-500">More articles in {currentBlog?.category?.name}</p>
      <div className="mt-4 space-y-3">
        {suggestions.map((blog) => (
          <SuggestedBlogCard key={blog._id} blog={blog} />
        ))}
      </div>
    </section>
  );
};

export default function BlogDetails() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { posts, blogDetails, isLoading, isError, message } = useSelector((state) => state.posts);

  const blog = useMemo(() => {
    const fromList = posts?.find(
      (item) => item?.feedType === 'blog' && (item._id || item.id) === postId,
    );
    if (fromList) return fromList;
    if ((blogDetails?._id || blogDetails?.id) === postId) return blogDetails;
    return null;
  }, [posts, blogDetails, postId]);

  useEffect(() => {
    if (!postId || blog) return;
    dispatch(getBlogDetails(postId));
  }, [dispatch, postId, blog]);

  if (isLoading && !blog) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-4">
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-4">
        <div className="rounded-2xl border border-rose-100 bg-white p-4 text-sm text-rose-600">
          {message || 'Something went wrong while loading this blog.'}
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
          Blog not found.
        </div>
      </div>
    );
  }

  const author = getAuthor(blog);
  const stats = getStats(blog);
  const tags = parseTags(blog.tags);
  const readTime = getReadTime(blog);
  const articleBody = getBlogBody(blog);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: blog.title,
        text: blog.summary,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1380px] px-3 py-3 sm:px-6">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <header className="mx-auto max-w-[760px] border-b border-slate-200/80 pb-8">
            {blog?.category?.name && (
              <span className="inline-flex rounded-full bg-[#eef1ff] px-3 py-1 text-xs font-semibold text-[#5b61d6]">
                {blog.category.name}
              </span>
            )}

            <h1 className="mt-4 max-w-[16ch] font-['Plus_Jakarta_Sans'] text-[2.1rem] font-bold leading-[1.08] tracking-[-0.03em] text-slate-950 sm:text-[3.5rem]">
              {blog?.title}
            </h1>

            {blog?.summary && (
              <p className="mt-5 max-w-[680px] text-lg leading-8 text-slate-600">
                {blog.summary}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <img src={author.avatar} alt={author.name} className="h-11 w-11 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{author.name}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4" />
                      {readTime} min read
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/discussionroom/${postId}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#eef1ff] px-4 py-2 text-sm font-semibold text-[#5057d6] transition hover:bg-[#e3e8ff]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Discuss Live
                </Link>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </header>

          {blog?.coverImage?.url && (
            <div className="mx-auto my-10 max-w-[980px] overflow-hidden rounded-[28px] bg-slate-100 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.35)]">
              <img
                src={blog.coverImage.url.trim()}
                alt={blog.title || 'Blog cover'}
                className="h-[260px] w-full object-cover sm:h-[420px]"
              />
            </div>
          )}

          <div className="mx-auto max-w-[760px]">
            <div className="mt-10">
              {renderBlogContent(articleBody)}
            </div>

            {tags.length > 0 && (
              <div className="mt-10 border-t border-slate-200/80 pt-6">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </article>

        <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <DiscussionCard postId={postId} comments={stats.comments} views={stats.views} />
          <SuggestionsSection currentBlog={blog} />
        </aside>
      </div>
    </div>
  );
}
