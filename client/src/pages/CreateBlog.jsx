import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ImagePlus, Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { getMe } from '../features/auth/authSlice';
import BlogEditor, { isTipTapContentEmpty } from '../components/blogs/BlogEditor';

const BLOG_CATEGORIES = [
  'Technology',
  'Programming',
  'Design',
  'Business',
  'AI',
  'Lifestyle',
  'Education',
  'Science',
  'Startups',
  'Finance',
];

const labelClass = 'mb-1 block text-sm font-medium text-slate-700';
const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-teal-600';
const hintClass = 'mt-1 text-sm text-slate-400';
const errorClass = 'mt-1 text-sm text-red-500';

export default function CreateBlog() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [contentJson, setContentJson] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showMeta, setShowMeta] = useState(true);

  useEffect(() => {
    return () => {
      if (coverImage?.preview) {
        URL.revokeObjectURL(coverImage.preview);
      }
    };
  }, [coverImage]);

  const handleContentChange = useCallback((json) => {
    setContentJson(json);
    setErrors((prev) => (prev.content ? { ...prev, content: '' } : prev));
  }, []);

  const validateForm = () => {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Title is required';
    if (title.length > 200) nextErrors.title = 'Title must be under 200 characters';
    if (summary.length > 500) nextErrors.summary = 'Summary must be under 500 characters';
    if (!contentJson || isTipTapContentEmpty(contentJson)) {
      nextErrors.content = 'Write something before publishing';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (coverImage?.preview) {
      URL.revokeObjectURL(coverImage.preview);
    }

    setCoverImage({
      file,
      preview: URL.createObjectURL(file),
    });
  };

  const handleRemoveCover = () => {
    if (coverImage?.preview) {
      URL.revokeObjectURL(coverImage.preview);
    }
    setCoverImage(null);
  };

  const handleSubmit = async (publishStatus) => {
    const nextStatus = publishStatus || status;
    setStatus(nextStatus);

    if (!validateForm()) return;

    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('summary', summary.trim());
    formData.append('categoryName', categoryName.trim());
    formData.append('tags', tags.trim());
    formData.append('status', nextStatus);
    formData.append('content', JSON.stringify(contentJson));

    if (coverImage?.file) {
      formData.append('coverImage', coverImage.file);
    }

    try {
      const { data } = await API.post('/blog/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await dispatch(getMe());
      const blogId = data?.blog?._id || data?.blog?.slug;
      navigate(blogId ? `/blog/${blogId}` : '/profile');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to save blog');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <h2 className="text-sm font-semibold text-slate-900">Sign in to write</h2>
        <p className="mt-2 text-sm text-slate-600">Create an account to publish blogs.</p>
        <Link
          to="/signup"
          className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] w-full bg-white pb-20 lg:pb-6">
      {/* Action bar sits below app navbar (top-16) */}
      <div className="sticky top-16 z-10 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex shrink-0 items-center gap-1 rounded-lg p-1.5 text-sm text-slate-600 hover:bg-slate-50"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <span className="truncate text-sm font-medium text-slate-800">Write a blog</span>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('draft')}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Draft
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('published')}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-5">
        {/* Cover */}
        <section>
          {coverImage?.preview ? (
            <div className="group relative overflow-hidden rounded-lg bg-slate-100">
              <img
                src={coverImage.preview}
                alt="Cover preview"
                className="max-h-56 w-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveCover}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
                aria-label="Remove cover"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
              <ImagePlus className="h-4 w-4 shrink-0" />
              Add cover image
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
          )}
        </section>

        {/* Title */}
        <section>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="Title"
            maxLength={200}
            className="blog-title-input w-full border-none bg-transparent text-2xl font-bold leading-snug text-slate-900 outline-none placeholder:text-slate-300 sm:text-3xl"
          />
          {errors.title && <p className={errorClass}>{errors.title}</p>}
          <p className="mt-1 text-right text-sm text-slate-400">{title.length}/200</p>
        </section>

        {/* Summary */}
        <section>
          <textarea
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              if (errors.summary) setErrors((prev) => ({ ...prev, summary: '' }));
            }}
            placeholder="Write a subtitle or short summary…"
            maxLength={500}
            rows={2}
            className="w-full resize-none border-none bg-transparent text-sm leading-relaxed text-slate-600 outline-none placeholder:text-slate-400"
          />
          {errors.summary && <p className={errorClass}>{errors.summary}</p>}
          <p className="mt-1 text-right text-sm text-slate-400">{summary.length}/500</p>
        </section>

        {/* Editor */}
        <section>
          <BlogEditor onChange={handleContentChange} />
          {errors.content && <p className={errorClass}>{errors.content}</p>}
        </section>

        {/* Blog settings */}
        <section className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowMeta((open) => !open)}
            className="flex w-full items-center justify-between text-sm font-medium text-slate-800"
          >
            Blog settings
            {showMeta ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showMeta && (
            <div className="mt-4 space-y-4 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="blog-category" className={labelClass}>
                    Category
                  </label>
                  <div className="relative">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="blog-category"
                      list="blog-categories"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="Technology"
                      className={`${inputClass} pl-9`}
                    />
                    <datalist id="blog-categories">
                      {BLOG_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label htmlFor="blog-tags" className={labelClass}>
                    Tags
                  </label>
                  <input
                    id="blog-tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="react, javascript"
                    className={inputClass}
                  />
                  <p className={hintClass}>Comma-separated</p>
                </div>
              </div>

              <div>
                <span className={labelClass}>Visibility</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      status === 'draft'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      status === 'published'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Published
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
