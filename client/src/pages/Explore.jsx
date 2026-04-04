import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Loader2, Newspaper, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import postService from '../features/post/postService';

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

function BlogCard({ blog }) {
  const id = blog._id || blog.id;
  const cover = blog.coverImage?.url?.trim();
  const author = blog.author?.username || 'Author';
  const readTime = blog.readTime ? `${blog.readTime} min` : '';

  return (
    <Link
      to={`/blog/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:border-teal-300/60 hover:shadow-md"
    >
      {cover ? (
        <div className="aspect-[16/9] w-full overflow-hidden bg-slate-200">
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100">
          <Newspaper className="h-12 w-12 text-teal-700/35" strokeWidth={1.25} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        {blog.category?.name && (
          <span className="mb-2 w-fit rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
            {blog.category.name}
          </span>
        )}
        <h2 className="font-display text-lg font-bold leading-snug text-slate-900 group-hover:text-teal-800">
          {blog.title}
        </h2>
        {blog.summary && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">{blog.summary}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">{author}</span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
          {readTime && (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {readTime}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Explore() {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const limit = 12;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(
    async (offset, append) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError('');
        const data = await postService.exploreBlogs({
          search: debouncedSearch,
          skip: offset,
          limit,
        });
        const list = data.blogs || [];
        setTotal(data.total ?? list.length);
        if (append) {
          setBlogs((prev) => [...prev, ...list]);
        } else {
          setBlogs(list);
        }
        setSkip(offset + list.length);
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Could not load articles.');
        if (!append) setBlogs([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, limit],
  );

  useEffect(() => {
    setSkip(0);
    load(0, false);
  }, [debouncedSearch, load]);

  const hasMore = useMemo(() => skip < total && blogs.length > 0, [skip, total, blogs.length]);

  return (
    <div className="min-h-[60vh] pb-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Explore</h1>
        <p className="mt-1 text-sm text-slate-600">Published articles from the community.</p>
      </header>

      <label className="mb-8 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 shrink-0 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, summary, or tag…"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
      </label>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        </div>
      )}

      {!loading && blogs.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-[var(--surface-muted)] px-6 py-14 text-center">
          <Newspaper className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-800">No published articles yet</p>
          <p className="mt-1 text-sm text-slate-500">Check back later or publish your first story.</p>
          <Link
            to="/blog/create"
            className="mt-5 inline-flex rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Write a blog
          </Link>
        </div>
      )}

      {!loading && blogs.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog._id || blog.id} blog={blog} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => load(skip, true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800 disabled:opacity-50"
              >
                {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
