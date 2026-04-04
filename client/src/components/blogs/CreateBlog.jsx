import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, BookOpen, FileText, Globe2, ImagePlus, Tag, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { getMe } from '../../features/auth/authSlice';

export default function CreateBlog() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    title: '',
    summary: '',
    body: '',
    categoryName: '',
    tags: '',
    status: 'draft',
    isFeatured: false,
  });
  const [coverImage, setCoverImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (coverImage?.preview) {
        URL.revokeObjectURL(coverImage.preview);
      }
    };
  }, [coverImage]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">You don't have an account yet</h2>
        <p className="mt-2 text-slate-600">Create an account to continue and start writing.</p>
        <Link
          to="/signup"
          className="mt-4 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Create account
        </Link>
      </div>
    );
  }

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

  const handleDiscard = () => {
    setForm({
      title: '',
      summary: '',
      body: '',
      categoryName: '',
      tags: '',
      status: 'draft',
      isFeatured: false,
    });
    handleRemoveCover();
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.body.trim()) {
      alert('Title and article content are required');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('body', form.body.trim());
    formData.append('summary', form.summary.trim());
    formData.append('categoryName', form.categoryName.trim());
    formData.append('tags', form.tags.trim());
    formData.append('status', form.status);
    formData.append('isFeatured', String(form.isFeatured));

    if (coverImage?.file) {
      formData.append('coverImage', coverImage.file);
    }

    try {
      await API.post('/blog/create', formData);
      await dispatch(getMe());
      navigate('/profile');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to create article');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f5f7f9]">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-[#f5f7f9]/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl p-2 transition hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </button>

          <h1 className="text-sm font-semibold text-slate-800">Write Article</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-5 pb-24">
        <div className="mb-4 flex items-center gap-2 px-1">
          <BookOpen className="h-4 w-4 text-[#4e44d4]" />
          <p className="text-sm font-medium text-slate-700">
            Turn your ideas into a longer story with a title, summary, and polished body.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-800">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Write a clear article title"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#4e44d4]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-800">Summary</label>
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleChange}
                placeholder="Write a short summary"
                rows={3}
                maxLength={500}
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#4e44d4]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Article Body</label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              placeholder="Write your article here..."
              rows={16}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-7 text-slate-700 outline-none transition focus:border-[#4e44d4]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Category</label>
              <div className="relative">
                <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="categoryName"
                  value={form.categoryName}
                  onChange={handleChange}
                  placeholder="Design, Tech, Lifestyle..."
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#4e44d4]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Tags</label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="react, design, frontend"
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#4e44d4]"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-[1.5rem] border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Cover Image</p>
                  <p className="text-xs text-slate-500">Add one strong image for the article header.</p>
                </div>
                {coverImage && (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {coverImage?.preview ? (
                <img
                  src={coverImage.preview}
                  alt="Cover preview"
                  className="h-56 w-full rounded-[1.25rem] object-cover"
                />
              ) : (
                <label className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-[#4e44d4] hover:text-[#4e44d4]">
                  <ImagePlus className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Upload cover image</span>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              )}
            </div>

            <div className="space-y-4 rounded-[1.5rem] border border-slate-200 p-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, status: 'draft' }))}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      form.status === 'draft'
                        ? 'border-[#4e44d4] bg-[#f1efff] text-[#4e44d4]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, status: 'published' }))}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      form.status === 'published'
                        ? 'border-[#4e44d4] bg-[#4e44d4] text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Published
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Feature Article</p>
                  <p className="text-xs text-slate-500">Mark this article as featured.</p>
                </div>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#4e44d4]"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Globe2 className="h-4 w-4 text-[#4e44d4]" />
                  Ready to publish
                </div>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Title and content are required. Slugs, read time, and publish date are handled automatically by the server.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Discard
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-[#4e44d4] py-3 text-sm font-semibold text-white transition hover:bg-[#4339bb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Saving...' : form.status === 'published' ? 'Publish Article' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
