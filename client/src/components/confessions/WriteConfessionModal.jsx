import { useState } from 'react';
import { X, VenetianMask } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { submitConfession, clearConfessionError } from '../../features/confession/confessionSlice';

const CATEGORIES = [
  'Relationships', 'College Life', 'Funny', 'Unpopular Opinions',
  'Work Life', 'Family', 'Mental Health', 'Secrets', 'Advice', 'Other',
];

export default function WriteConfessionModal({ open, onClose }) {
  const dispatch = useDispatch();
  const { creating, error } = useSelector((s) => s.confession);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('College Life');
  const [tags, setTags] = useState('');
  const [localError, setLocalError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLocalError('');
    dispatch(clearConfessionError());

    const tagList = tags
      .split(/[,\s]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean);

    try {
      await dispatch(submitConfession({ content: content.trim(), category, tags: tagList })).unwrap();
      setContent('');
      setTags('');
      onClose();
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to post. Is the server running?';
      setLocalError(msg);
    }
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" onClick={onClose} role="presentation" />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-fade-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#3d2a7a] via-[#5b3fb8] to-[#4a2d8f] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
                <VenetianMask size={22} />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">Write a Confession</h2>
                <p className="text-xs text-purple-200 mt-0.5">Text only · identity hidden</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/40"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Your confession</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what's on your mind… nobody will know it's you."
              rows={6}
              maxLength={5000}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/40"
              required
              autoFocus
            />
            <p className="text-right text-xs text-slate-400 mt-1">{content.length}/5000</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Hashtags (optional)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#college #secrets"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/40"
            />
          </div>

          {displayError && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">
              {displayError}
            </div>
          )}

          <button
            type="submit"
            disabled={creating || !content.trim()}
            className="w-full py-3 rounded-xl bg-[#7B61FF] text-white font-bold text-sm hover:bg-[#6a52e8] disabled:opacity-50 transition-all shadow-lg shadow-purple-200/50"
          >
            {creating ? 'Posting…' : 'Post Anonymously'}
          </button>
        </form>
      </div>
    </div>
  );
}
