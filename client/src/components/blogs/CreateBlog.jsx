import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  BookOpen, 
  ImagePlus, 
  Tag, 
  X, 
  Globe2,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Code,
  Quote,
  Eye,
  Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { getMe } from '../../features/auth/authSlice';

export default function CreateBlog() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const textareaRef = useRef(null);

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
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    return () => {
      if (coverImage?.preview) {
        URL.revokeObjectURL(coverImage.preview);
      }
    };
  }, [coverImage]);

  // ============ TEXT FORMATTING FUNCTIONS ============
  
  const getSelectionStartEnd = (textarea) => {
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      text: textarea.value,
      selectedText: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
    };
  };

  const insertFormatting = (before, after, formatText = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end, text, selectedText } = getSelectionStartEnd(textarea);
    const newSelectedText = selectedText || formatText;
    
    const newText = text.substring(0, start) + before + newSelectedText + after + text.substring(end);
    
    setForm(prev => ({ ...prev, body: newText }));
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + newSelectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleBold = () => insertFormatting('**', '**', 'bold text');
  const handleItalic = () => insertFormatting('*', '*', 'italic text');
  const handleHeading1 = () => insertFormatting('# ', '', 'Heading 1');
  const handleHeading2 = () => insertFormatting('## ', '', 'Heading 2');
  const handleBulletList = () => insertFormatting('- ', '', 'list item');
  const handleCode = () => insertFormatting('`', '`', 'code');
  const handleQuote = () => insertFormatting('> ', '', 'quote');

  // ============ CONVERT USER INPUT TO HTML ============
  
  const formatContentToHTML = (text) => {
    if (!text) return '';
    
    let html = text;
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Headings
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    
    // Blockquotes
    html = html.replace(/^> (.*?)$/gm, '<blockquote><p>$1</p></blockquote>');
    
    // Lists
    let inList = false;
    const lines = html.split('\n');
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/^- /) || line.match(/^\* /)) {
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        processedLines.push(`<li>${line.replace(/^- /, '').replace(/^\* /, '')}</li>`);
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(line);
      }
    }
    if (inList) processedLines.push('</ul>');
    html = processedLines.join('\n');
    
    // Paragraphs
    const paragraphs = html.split(/\n\n/);
    html = paragraphs
      .map(para => {
        if (!para.trim()) return '';
        if (para.startsWith('<h1>') || para.startsWith('<h2>') || para.startsWith('<h3>') ||
            para.startsWith('<ul>') || para.startsWith('<blockquote>') || para.startsWith('<pre>')) {
          return para;
        }
        return `<p>${para.replace(/\n/g, '<br>')}</p>`;
      })
      .join('');
    
    return html;
  };

  // ============ PREVIEW HTML ============
  
  const getPreviewHTML = () => {
    if (!form.body) return '<p class="text-gray-400">Nothing to preview yet...</p>';
    return formatContentToHTML(form.body);
  };

  // ============ FORM HANDLERS ============
  
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.body.trim()) newErrors.body = 'Content is required';
    if (form.title.length > 200) newErrors.title = 'Title must be less than 200 characters';
    if (form.summary.length > 500) newErrors.summary = 'Summary must be less than 500 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);

    const htmlContent = formatContentToHTML(form.body);

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('body', htmlContent);
    formData.append('summary', form.summary.trim());
    formData.append('categoryName', form.categoryName.trim());
    formData.append('tags', form.tags.trim());
    formData.append('status', form.status);
    formData.append('isFeatured', form.isFeatured);

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

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900">You don't have an account yet</h2>
        <p className="mt-2 text-gray-600">Create an account to continue and start writing.</p>
        <Link to="/signup" className="mt-4 inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/95 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white transition">
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>
          <h1 className="text-sm font-semibold text-gray-800">Write Article</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 pb-24">
        {/* Info Banner */}
        <div className="mb-4 flex items-center gap-2 px-1">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <p className="text-sm text-gray-600">
            {"Use **bold**, *italic*, `code`, # headings, - lists, and > quotes"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl p-5 shadow-sm">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Write a clear article title"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            <p className="mt-1 text-right text-xs text-gray-400">{form.title.length}/200</p>
          </div>

          {/* Summary - Important for SEO */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Summary <span className="text-gray-400 text-xs font-normal">(optional but recommended)</span>
            </label>
            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              placeholder="Write a short summary that captures the essence of your article. This appears in search results and social shares."
              rows={3}
              maxLength={500}
              className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 ${
                errors.summary ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-400">Max 500 characters</p>
              <p className="text-xs text-gray-400">{form.summary.length}/500</p>
            </div>
            {errors.summary && <p className="mt-1 text-xs text-red-500">{errors.summary}</p>}
          </div>

          {/* Content Editor with Toolbar */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Content <span className="text-red-500">*</span>
            </label>
            
            {/* Preview Toggle */}
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition"
              >
                <Eye className="h-3.5 w-3.5" />
                {showPreview ? 'Back to Edit' : 'Preview'}
              </button>
            </div>

            {/* Toolbar */}
            {!showPreview && (
              <div className="flex flex-wrap gap-1 mb-2 p-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <button type="button" onClick={handleBold} className="p-1.5 rounded hover:bg-gray-200 transition" title="Bold (**text**)">
                  <Bold className="h-4 w-4 text-gray-600" />
                </button>
                <button type="button" onClick={handleItalic} className="p-1.5 rounded hover:bg-gray-200 transition" title="Italic (*text*)">
                  <Italic className="h-4 w-4 text-gray-600" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1 self-center" />
                <button type="button" onClick={handleHeading1} className="p-1.5 rounded hover:bg-gray-200 transition" title="Heading 1 (# Heading)">
                  <Heading1 className="h-4 w-4 text-gray-600" />
                </button>
                <button type="button" onClick={handleHeading2} className="p-1.5 rounded hover:bg-gray-200 transition" title="Heading 2 (## Heading)">
                  <Heading2 className="h-4 w-4 text-gray-600" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1 self-center" />
                <button type="button" onClick={handleBulletList} className="p-1.5 rounded hover:bg-gray-200 transition" title="Bullet List (- item)">
                  <List className="h-4 w-4 text-gray-600" />
                </button>
                <button type="button" onClick={handleCode} className="p-1.5 rounded hover:bg-gray-200 transition" title="Code (`code`)">
                  <Code className="h-4 w-4 text-gray-600" />
                </button>
                <button type="button" onClick={handleQuote} className="p-1.5 rounded hover:bg-gray-200 transition" title="Quote (> quote)">
                  <Quote className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            )}

            {/* Editor or Preview */}
            {showPreview ? (
              <div 
                className="w-full min-h-[400px] rounded-xl border border-gray-200 p-4 bg-gray-50 overflow-auto prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getPreviewHTML() }}
              />
            ) : (
              <textarea
                ref={textareaRef}
                name="body"
                value={form.body}
                onChange={handleChange}
                placeholder="Write your article here...&#10;&#10;**bold** *italic* `code`&#10;# Heading 1&#10;## Heading 2&#10;- bullet list&#10;> quote&#10;&#10;Double Enter for new paragraph"
                rows={18}
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm leading-7 text-gray-700 font-mono outline-none transition focus:border-blue-500 ${
                  errors.body ? 'border-red-500' : 'border-gray-200'
                }`}
              />
            )}
            {errors.body && <p className="mt-1 text-xs text-red-500">{errors.body}</p>}
          </div>

          {/* Category & Tags */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Category</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  name="categoryName"
                  value={form.categoryName}
                  onChange={handleChange}
                  placeholder="e.g., Technology, Design, Lifestyle"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm text-gray-700 outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Tags</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="react, design, frontend (comma separated)"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 transition"
              />
              <p className="mt-1 text-xs text-gray-400">Separate tags with commas</p>
            </div>
          </div>

          {/* Cover Image & Settings */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Cover Image */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Cover Image</p>
                  <p className="text-xs text-gray-500">Optional, but recommended for better engagement</p>
                </div>
                {coverImage && (
                  <button type="button" onClick={handleRemoveCover} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {coverImage?.preview ? (
                <div className="relative">
                  <img src={coverImage.preview} alt="Cover preview" className="h-48 w-full rounded-xl object-cover" />
                </div>
              ) : (
                <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition">
                  <ImagePlus className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Click to upload</span>
                  <span className="text-xs mt-1">PNG, JPG, WebP up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-4 rounded-xl border border-gray-200 p-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, status: 'draft' }))}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      form.status === 'draft'
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    📝 Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, status: 'published' }))}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      form.status === 'published'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🚀 Publish
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Feature Article</p>
                  <p className="text-xs text-gray-500">Mark this article as featured</p>
                </div>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Info className="h-4 w-4 text-blue-600" />
                  Formatting Guide
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p><code className="bg-gray-200 px-1 rounded">**bold**</code> → <strong>bold text</strong></p>
                  <p><code className="bg-gray-200 px-1 rounded">*italic*</code> → <em>italic text</em></p>
                  <p><code className="bg-gray-200 px-1 rounded">`code`</code> → <code>code snippet</code></p>
                  <p><code className="bg-gray-200 px-1 rounded"># Heading</code> → Large heading</p>
                  <p><code className="bg-gray-200 px-1 rounded">## Heading</code> → Medium heading</p>
                  <p><code className="bg-gray-200 px-1 rounded">- item</code> → Bullet point</p>
                  <p><code className="bg-gray-200 px-1 rounded">&gt; quote</code> → Blockquote</p>
                  <p className="mt-1 text-gray-400">💡 Double Enter = new paragraph</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : form.status === 'published' ? 'Publish Article' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}