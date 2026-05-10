import { ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { setUser } from '../features/auth/authSlice';
import CATEGORIES from '../constants/categories';

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
    </div>
  );
}
