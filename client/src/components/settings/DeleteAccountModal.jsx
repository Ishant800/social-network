import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export default function DeleteAccountModal({ open, onClose, onConfirm, loading }) {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  if (!open) return null;

  const canDelete = password.length >= 1 && confirmText === 'DELETE';

  const handleClose = () => {
    setPassword('');
    setConfirmText('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canDelete || loading) return;
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} role="presentation" />
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={20} />
            <h2 className="font-display font-bold text-base">Delete account</h2>
          </div>
          <button type="button" onClick={handleClose} className="p-1.5 rounded-lg hover:bg-red-100 text-red-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            This permanently removes your profile, posts, and data. This cannot be undone.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-700">Your password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Type <span className="font-mono text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              placeholder="DELETE"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canDelete || loading}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Delete forever
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
