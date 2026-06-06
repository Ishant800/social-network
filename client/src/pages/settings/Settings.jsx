import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Loader2,
  Lock,
  Globe,
  Eye,
  Shield,
  Trash2,
} from 'lucide-react';
import API from '@/api/axios';
import { setUser, logout } from '@/features/auth/authSlice';
import settingsService from '@/features/users/settingsService';
import DeleteAccountModal from '@/components/settings/DeleteAccountModal';
import CATEGORIES from '@/constants/categories';

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
        on ? 'bg-teal-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          on ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [isPrivate, setIsPrivate] = useState(false);
  const [discoverable, setDiscoverable] = useState(true);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState('');

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const displayName = user?.profile?.fullName || user?.username || 'Your account';
  const email = user?.email || '—';
  const avatarUrl =
    user?.profile?.avatar?.url ||
    'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg';

  useEffect(() => {
    if (!user) return;

    setIsPrivate(!!user.privacy?.isPrivate);
    setDiscoverable(user.privacy?.discoverable !== false);
    setSelectedInterests(user.preferences?.interests || []);
  }, [user]);

  const updatePrivacySetting = async (patch, rollback) => {
    setPrivacySaving(true);
    setPrivacyMessage('');

    try {
      const data = await settingsService.updatePrivacy(patch);
      dispatch(
        setUser({
          ...user,
          privacy: {
            ...user.privacy,
            ...data.privacy,
          },
        }),
      );
      setPrivacyMessage('Privacy updated');
      setTimeout(() => setPrivacyMessage(''), 3000);
    } catch (error) {
      rollback();
      setPrivacyMessage(error.response?.data?.message || 'Failed to update privacy');
    } finally {
      setPrivacySaving(false);
    }
  };

  const handlePrivateToggle = (next) => {
    const prev = isPrivate;
    setIsPrivate(next);
    updatePrivacySetting({ isPrivate: next }, () => setIsPrivate(prev));
  };

  const handleDiscoverableToggle = (next) => {
    const prev = discoverable;
    setDiscoverable(next);
    updatePrivacySetting({ discoverable: next }, () => setDiscoverable(prev));
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
    setSaveMessage('');
  };

  const handleSaveInterests = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await API.put('/user/update-interests', {
        interests: selectedInterests,
      });

      if (response.data.success) {
        dispatch(
          setUser({
            ...user,
            preferences: {
              ...user.preferences,
              interests: response.data.interests,
            },
          }),
        );
        setSaveMessage('Interests saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      setSaveMessage(error.response?.data?.message || 'Failed to save interests');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (password) => {
    setDeleting(true);
    setDeleteError('');

    try {
      await settingsService.deleteAccount(password);
      dispatch(logout());
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Could not delete account');
    } finally {
      setDeleting(false);
    }
  };

  const hasInterestChanges =
    JSON.stringify([...selectedInterests].sort()) !==
    JSON.stringify([...(user?.preferences?.interests || [])].sort());

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="text-sm text-slate-600">Sign in to manage settings.</p>
        <Link to="/login" className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-5 pb-20 lg:pb-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Account, privacy, and preferences</p>
      </div>

      {/* Account */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</h2>
        </div>
        <Link
          to="/profile/edit"
          className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
        >
          <img src={avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="truncate text-sm text-slate-500">{email}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
        </Link>
      </section>

      {/* Privacy */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Privacy</h2>
          {privacySaving && <Loader2 size={14} className="animate-spin text-slate-400" />}
        </div>

        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Lock size={16} className="text-slate-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900">Private account</h3>
                <p className="mt-0.5 text-sm text-slate-500">Only followers can see your posts and lists.</p>
              </div>
            </div>
            <Toggle on={isPrivate} onChange={handlePrivateToggle} disabled={privacySaving} />
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Globe size={16} className="text-slate-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900">Public profile</h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  {isPrivate ? 'Name and photo visible; content hidden.' : 'Anyone can view your profile.'}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                isPrivate ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
              }`}
            >
              {isPrivate ? 'Private' : 'Public'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Eye size={16} className="text-slate-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900">Discoverable</h3>
                <p className="mt-0.5 text-sm text-slate-500">Allow others to find you in search.</p>
              </div>
            </div>
            <Toggle on={discoverable} onChange={handleDiscoverableToggle} disabled={privacySaving} />
          </div>
        </div>

        {privacyMessage && (
          <div
            className={`border-t border-slate-100 px-4 py-2 text-sm ${
              privacyMessage.includes('Failed') ? 'text-red-600' : 'text-teal-600'
            }`}
          >
            {privacyMessage}
          </div>
        )}
      </section>

      {/* Interests */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interests</h2>
        </div>

        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-md px-2.5 py-1 text-sm font-medium transition ${
                    selected
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{selectedInterests.length} selected</span>
              {saveMessage && (
                <span
                  className={`text-sm ${
                    saveMessage.includes('saved') ? 'text-teal-600' : 'text-red-600'
                  }`}
                >
                  {saveMessage}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSaveInterests}
              disabled={isSaving || !hasInterestChanges}
              className="flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving && <Loader2 size={12} className="animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="overflow-hidden rounded-lg border border-red-200 bg-red-50/30">
        <div className="flex items-center gap-2 border-b border-red-100 px-4 py-2">
          <Shield size={14} className="text-red-600" />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-red-700">Danger zone</h2>
        </div>

        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Trash2 size={14} className="text-red-600" />
              Delete account
            </h3>
            <p className="mt-0.5 text-sm text-slate-600">
              Permanently delete your account and all data. This cannot be undone.
            </p>
            {deleteError && <p className="mt-1 text-sm text-red-600">{deleteError}</p>}
          </div>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </section>

      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteError('');
        }}
        onConfirm={handleDeleteAccount}
        loading={deleting}
      />
    </div>
  );
}
