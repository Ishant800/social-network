import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Loader2,
  LogOut,
  Lock,
  Globe,
  Eye,
  Shield,
  Trash2,
} from 'lucide-react';
import API from '../api/axios';
import { setUser, logout } from '../features/auth/authSlice';
import settingsService from '../features/user/settingsService';
import DeleteAccountModal from '../components/settings/DeleteAccountModal';
import CATEGORIES from '../constants/categories';

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`flex h-7 w-12 items-center rounded-full px-0.5 transition disabled:opacity-50 ${
        on ? 'bg-teal-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`h-6 w-6 rounded-full bg-white shadow transition ${on ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 px-4 hover:bg-slate-50/80 rounded-xl transition-colors">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Icon size={18} className="text-slate-600" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [isPrivate, setIsPrivate] = useState(user?.privacy?.isPrivate ?? false);
  const [discoverable, setDiscoverable] = useState(user?.privacy?.discoverable ?? true);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState('');

  const [selectedInterests, setSelectedInterests] = useState(user?.preferences?.interests || []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const displayName = user?.profile?.fullName || user?.username || 'Your account';
  const email = user?.email || '—';
  const avatarUrl =
    user?.profile?.avatar?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0d9488&color=fff`;

  useEffect(() => {
    if (user?.privacy) {
      setIsPrivate(Boolean(user.privacy.isPrivate));
      setDiscoverable(user.privacy.discoverable !== false);
    }
    if (user?.preferences?.interests) {
      setSelectedInterests(user.preferences.interests);
    }
  }, [user]);

  const savePrivacy = async (nextPrivate, nextDiscoverable) => {
    setPrivacySaving(true);
    setPrivacyMessage('');
    try {
      const { privacy } = await settingsService.updatePrivacy({
        isPrivate: nextPrivate,
        discoverable: nextDiscoverable,
      });
      dispatch(setUser({
        ...user,
        privacy: {
          isPrivate: privacy.isPrivate,
          discoverable: privacy.discoverable,
        },
      }));
      setPrivacyMessage('Privacy updated');
      setTimeout(() => setPrivacyMessage(''), 2500);
    } catch (err) {
      setPrivacyMessage(err.response?.data?.message || 'Failed to update privacy');
    } finally {
      setPrivacySaving(false);
    }
  };

  const handlePrivateToggle = (value) => {
    setIsPrivate(value);
    savePrivacy(value, discoverable);
  };

  const handleDiscoverableToggle = (value) => {
    setDiscoverable(value);
    savePrivacy(isPrivate, value);
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
    setSaveMessage('');
  };

  const handleSaveInterests = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const response = await API.put('/user/update-interests', { interests: selectedInterests });
      if (response.data.success) {
        dispatch(setUser({
          ...user,
          preferences: { ...user.preferences, interests: response.data.interests },
        }));
        setSaveMessage('Interests saved');
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8 pb-16">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Account, privacy, and preferences</p>
      </div>

      {/* Account card */}
      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Account</h2>
        </div>
        <Link
          to="/profile/edit"
          className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
        >
          <img src={avatarUrl} alt="" className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white shadow" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{displayName}</p>
            <p className="text-sm text-slate-500 truncate">{email}</p>
            <p className="text-xs text-teal-600 font-medium mt-1 group-hover:underline">Edit profile</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </Link>
      </section>

      {/* Privacy */}
      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Privacy</h2>
          {privacySaving && <Loader2 size={14} className="animate-spin text-slate-400" />}
        </div>
        <div className="divide-y divide-slate-100">
          <SettingRow
            icon={Lock}
            title="Private account"
            description="Only followers can see your posts, followers, and following lists."
          >
            <Toggle on={isPrivate} onChange={handlePrivateToggle} disabled={privacySaving} />
          </SettingRow>
          <SettingRow
            icon={Globe}
            title="Public profile"
            description={isPrivate ? 'Your name and photo stay visible; content stays hidden.' : 'Anyone can view your full profile and posts.'}
          >
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              isPrivate ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
            }`}>
              {isPrivate ? 'Private' : 'Public'}
            </span>
          </SettingRow>
          <SettingRow
            icon={Eye}
            title="Discoverable"
            description="Allow others to find you in search and friend suggestions."
          >
            <Toggle on={discoverable} onChange={handleDiscoverableToggle} disabled={privacySaving} />
          </SettingRow>
        </div>
        {privacyMessage && (
          <p className={`px-4 py-2 text-xs border-t border-slate-100 ${
            privacyMessage.includes('Failed') ? 'text-red-600' : 'text-teal-600'
          }`}>
            {privacyMessage}
          </p>
        )}
      </section>

      {/* Interests */}
      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Interests</h2>
        </div>
        <div className="p-4">
          <p className="text-xs text-slate-500 mb-3">Personalize your feed and suggestions</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
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
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500">{selectedInterests.length} selected</p>
              {saveMessage && (
                <p className={`text-xs mt-0.5 ${saveMessage.includes('saved') ? 'text-teal-600' : 'text-red-600'}`}>
                  {saveMessage}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleSaveInterests}
              disabled={isSaving || !hasInterestChanges}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 flex items-center gap-2"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              Save interests
            </button>
          </div>
        </div>
      </section>

      {/* Session */}
      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Session</h2>
        </div>
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Sign out</p>
            <p className="text-xs text-slate-500 mt-0.5">Sign in again to use this device</p>
          </div>
          <button
            type="button"
            onClick={() => { dispatch(logout()); navigate('/login', { replace: true }); }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-red-200 bg-red-50/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-red-100 flex items-center gap-2">
          <Shield size={16} className="text-red-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-red-700">Danger zone</h2>
        </div>
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Trash2 size={16} className="text-red-600" />
              Delete account
            </p>
            <p className="text-xs text-slate-600 mt-1 max-w-sm">
              Permanently delete your account, posts, and all associated data.
            </p>
            {deleteError && <p className="text-xs text-red-600 mt-2">{deleteError}</p>}
          </div>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Delete account
          </button>
        </div>
      </section>

      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteError(''); }}
        onConfirm={handleDeleteAccount}
        loading={deleting}
      />
    </div>
  );
}
