import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, MapPin, User, Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function EditProfile({ onSave }) {
  const navigate = useNavigate();
  const {user}= useSelector((state)=> state.auth)
  
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
        name: user.name || '',
        bio: user.bio || '',
        address: user.address || '',
      });
      setPreview(user?.profileImage?.url?.trim() || '');
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
    data.append('name', formData.name);
    data.append('bio', formData.bio);
    data.append('address', formData.address);
    if (selectedFile) data.append('profileImage', selectedFile);

    try {
      await onSave?.(data);
      navigate('/profile');
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="text-sm font-semibold text-slate-900">Edit Profile</h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Make it yours
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Tell your story</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Update your profile to help others connect with you better. 
          A great profile opens doors.
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 p-5 space-y-5">
          
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-3 pb-4 border-b border-slate-100">
            <div className="relative group">
              <img
                src={preview || 'https://ui-avatars.com/api/?name=User&size=128'}
                alt="Profile preview"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100"
              />
              <label className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-700 transition shadow-lg">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-slate-500">
              {selectedFile ? selectedFile.name : 'Click to upload a new photo'}
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-2">
              <User className="w-4 h-4" /> Your Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="How should we call you?"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-2">
              <Info className="w-4 h-4" /> Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Share a bit about yourself... (max 160 chars)"
              maxLength={160}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1 text-right">
              {formData.bio.length}/160
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-2">
              <MapPin className="w-4 h-4" /> Location
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="City, Country"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Helper Text */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Your profile is public. Be thoughtful about what you share.
        </p>
      </div>
    </div>
  );
}
