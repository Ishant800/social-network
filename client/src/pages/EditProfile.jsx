import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, MapPin, User, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../api/axios';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    address: '',
  });
  const [preview, setPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.profile?.fullName || user.name || user.username || '',
        bio: user.profile?.bio || user.bio || '',
        address: user.profile?.location || user.address || '',
      });
      setPreview(user.profile?.avatar?.url || user?.profileImage?.url || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const data = new FormData();
    data.append('fullName', formData.name.trim());
    data.append('bio', formData.bio.trim());
    data.append('location', formData.address.trim());
    if (selectedFile) data.append('profileImage', selectedFile);
    
    try {
      const response = await API.put('/user/update-profile', data);
      if (response.status === 200) {
        navigate('/profile');
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = () => {
    if (preview) return preview;
    const name = formData.name || user?.username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff&size=80`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-medium">Edit Profile</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Profile Image */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={getAvatarUrl()}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700">
                <Camera className="w-3 h-3" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-xs text-gray-500">Click camera to change</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              <User className="w-4 h-4" />
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              <Info className="w-4 h-4" />
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              maxLength={160}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{formData.bio.length}/160</p>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
