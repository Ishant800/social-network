import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function EditPost() {
  const navigate = useNavigate();
  const location = useLocation();
  const post = location.state?.post;

  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setExistingImages(post.images || post.media || []);
    }
  }, [post]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - (images.length + existingImages.length);
    
    if (remainingSlots <= 0) {
      alert('You can only upload up to 5 images');
      return;
    }

    const newImages = files.slice(0, remainingSlots).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      URL.revokeObjectURL(images[index].preview);
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0 && existingImages.length === 0) {
      alert('Please add some content or images');
      return;
    }

    setSaving(true);
    
    const formData = new FormData();
    formData.append('content', content);
    
    // Append existing images to keep
    existingImages.forEach((img, index) => {
      formData.append(`existingImages[${index}]`, img);
    });
    
    // Append new images
    images.forEach(({ file }) => {
      formData.append('images', file);
    });

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Post updated:', { content, existingImages, newImages: images });
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update post:', error);
    } finally {
      setSaving(false);
    }
  };

  const totalImages = images.length + existingImages.length;

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="text-sm font-semibold text-slate-900">Edit Post</h1>
          <button
            onClick={handleSubmit}
            disabled={saving || (!content.trim() && totalImages === 0)}
            className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
          />

          {/* Image Previews */}
          {totalImages > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {/* Existing Images */}
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index, true)}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-lg hover:bg-black/80 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              
              {/* New Images */}
              {images.map(({ preview }, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-lg hover:bg-black/80 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {totalImages < 5 && (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-slate-500" />
                </div>
                <span className="text-sm text-slate-600 font-medium">
                  {totalImages === 0 ? 'Add photos' : `Add ${5 - totalImages} more`}
                </span>
                <span className="text-xs text-slate-400">PNG, JPG up to 10MB</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}

          {/* Image Count */}
          {totalImages > 0 && (
            <p className="text-xs text-slate-500 text-center">
              {totalImages} of 5 images used
            </p>
          )}
        </form>
      </div>
    </div>
  );
}