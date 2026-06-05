import { ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
<<<<<<< Updated upstream
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { setUser } from '../features/auth/authSlice';
import CATEGORIES from '../constants/categories';

=======
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
import API from '../api/axios';
import { setUser } from '../features/auth/authSlice';
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
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
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

>>>>>>> Stashed changes
export default function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [discoverability, setDiscoverability] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState(
    user?.preferences?.interests || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const displayName = user?.profile?.fullName || user?.username || 'Your account';
  const email = user?.email || '—';
  const avatarUrl =
    user?.profile?.avatar?.url ||
    `https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg`;

  // Use shared categories
  const availableInterests = CATEGORIES;

  // Load user interests on mount
  useEffect(() => {
    if (user?.preferences?.interests) {
      setSelectedInterests(user.preferences.interests);
    }
  }, [user]);

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
    setSaveMessage(''); // Clear message when user makes changes
  };

  const handleSaveInterests = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const response = await API.put('/user/update-interests', {
        interests: selectedInterests
      });

      if (response.data.success) {
        // Update user in Redux store
        dispatch(setUser({
          ...user,
          preferences: {
            ...user.preferences,
            interests: response.data.interests
          }
        }));
        
        setSaveMessage('Interests saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      setSaveMessage(error.response?.data?.message || 'Failed to save interests');
    } finally {
      setIsSaving(false);
    }
  };

<<<<<<< Updated upstream
  const hasChanges = JSON.stringify([...selectedInterests].sort()) !== JSON.stringify([...(user?.preferences?.interests || [])].sort());

  return (
    <div className="max-w-3xl mx-auto px-6 py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account preferences and security
        </p>
      </div>

      {/* Settings List - Clean, No Boxes */}
      <div className="space-y-6">
        
        {/* Account Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Account</h2>
          <div className="space-y-1">
            <Link
              to="/profile/edit"
              className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition group"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Update profile</h3>
                  <p className="text-xs text-gray-500">Photo, name, and bio</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </Link>

            <div className="flex items-center justify-between py-3 px-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email address</h3>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Privacy</h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Discoverability</h3>
                <p className="text-xs text-gray-500">Allow others to find your profile</p>
              </div>
              <button
                type="button"
                onClick={() => setDiscoverability(!discoverability)}
                className={`flex h-6 w-11 items-center rounded-full px-1 transition ${
                  discoverability ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white transition ${discoverability ? 'ml-auto' : ''}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition group">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Mentions and tags</h3>
                <p className="text-xs text-gray-500">Configure who can tag you</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Security</h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition group">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Password</h3>
                <p className="text-xs text-gray-500">Change your password</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </div>

            <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition group">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Active sessions</h3>
                <p className="text-xs text-gray-500">Review your devices</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Interests</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-3">
              Choose your interests to personalize your feed and discover relevant content
            </p>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            
            {/* Save Section */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">
                  Selected: <span className="font-medium text-gray-900">{selectedInterests.length}</span> {selectedInterests.length === 1 ? 'interest' : 'interests'}
                </p>
                {saveMessage && (
                  <p className={`text-xs mt-1 ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                    {saveMessage}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveInterests}
                disabled={isSaving || !hasChanges}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
                  hasChanges && !isSaving
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-red-600 mb-2 uppercase tracking-wide">Danger Zone</h2>
          <div className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Deactivate account</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Permanently delete your account and all of your data
              </p>
            </div>
            <button
              type="button"
              disabled
              className="px-4 py-1.5 bg-gray-200 text-gray-400 rounded-lg text-xs font-medium cursor-not-allowed"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>
=======
  const handleDeleteAccount = async (password) => {
    setDeleting(true);
    setDeleteError('');
    try {
      await settingsService.deleteAccount(password);
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
    <div className="max-w-5xl mx-auto px-6 py-1">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Account, privacy, and preferences</p>
      </div>

      {/* Account Section */}
      <section className="border border-gray-200 rounded-lg mb-6 bg-white">
        <div className="border-b border-gray-100 px-4 py-2.5 bg-gray-50">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Account</h2>
        </div>
        <Link
          to="/profile/edit"
          className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group"
        >
          <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-sm text-gray-500 truncate">{email}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>
      </section>

      {/* Privacy Section */}
      <section className="border border-gray-200 rounded-lg mb-6 bg-white">
        <div className="border-b border-gray-100 px-4 py-2.5 bg-gray-50 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Privacy</h2>
          {privacySaving && <Loader2 size={14} className="animate-spin text-gray-400" />}
        </div>
        
        <div className="divide-y divide-gray-100">
          {/* Private Account */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Lock size={16} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Private account</h3>
                <p className="text-xs text-gray-500 mt-0.5">Only followers can see your posts and lists.</p>
              </div>
            </div>
            <Toggle on={isPrivate} onChange={handlePrivateToggle} disabled={privacySaving} />
          </div>

          {/* Public Profile Status */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Globe size={16} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Public profile</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isPrivate ? 'Name and photo visible; content hidden.' : 'Anyone can view your profile.'}
                </p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isPrivate ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
            }`}>
              {isPrivate ? 'Private' : 'Public'}
            </span>
          </div>

          {/* Discoverable */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Eye size={16} className="text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Discoverable</h3>
                <p className="text-xs text-gray-500 mt-0.5">Allow others to find you in search.</p>
              </div>
            </div>
            <Toggle on={discoverable} onChange={handleDiscoverableToggle} disabled={privacySaving} />
          </div>
        </div>

        {privacyMessage && (
          <div className={`px-4 py-2 text-xs border-t border-gray-100 ${
            privacyMessage.includes('Failed') ? 'text-red-600' : 'text-teal-600'
          }`}>
            {privacyMessage}
          </div>
        )}
      </section>

      {/* Interests Section */}
      <section className="border border-gray-200 rounded-lg mb-6 bg-white">
        <div className="border-b border-gray-100 px-4 py-2.5 bg-gray-50">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Interests</h2>
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
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                    selected
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{selectedInterests.length} selected</span>
              {saveMessage && (
                <span className={`text-xs ${saveMessage.includes('saved') ? 'text-teal-600' : 'text-red-600'}`}>
                  {saveMessage}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSaveInterests}
              disabled={isSaving || !hasInterestChanges}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {isSaving && <Loader2 size={12} className="animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="border border-red-200 rounded-lg bg-red-50/30">
        <div className="border-b border-red-100 px-4 py-2.5 flex items-center gap-2">
          <Shield size={14} className="text-red-600" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-red-700">Danger zone</h2>
        </div>
        
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Trash2 size={14} className="text-red-600" />
              Delete account
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 max-w-md">
              Permanently delete your account and all data. This cannot be undone.
            </p>
            {deleteError && <p className="text-xs text-red-600 mt-1">{deleteError}</p>}
          </div>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </section>

      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteError(''); }}
        onConfirm={handleDeleteAccount}
        loading={deleting}
      />
>>>>>>> Stashed changes
    </div>
  );
}