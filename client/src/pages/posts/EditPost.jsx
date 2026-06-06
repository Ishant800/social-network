import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Image as ImageIcon, Tag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { updatePost } from '@/features/post/postSlice';
import CATEGORIES from '@/constants/categories';


// Tag suggestions based on category
const getTagSuggestions = (category) => {
  const suggestions = {
    'Programming': ['JavaScript', 'Python', 'React', 'Node.js', 'Web Development', 'Backend', 'Frontend', 'Full-Stack'],
    'AI': ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Neural Networks', 'Data Science'],
    'Technology': ['Startup', 'Innovation', 'Tech Trends', 'Software', 'Hardware', 'Cloud'],
    'Business': ['Entrepreneurship', 'Strategy', 'Marketing', 'Finance', 'Leadership', 'Growth'],
    'Startups': ['Funding', 'MVP', 'Product', 'Scaling', 'Team', 'Pitch'],
    'Finance': ['Investment', 'Crypto', 'Stock Market', 'Economics', 'Banking', 'Trading'],
    'Science': ['Research', 'Physics', 'Chemistry', 'Biology', 'Discovery', 'Experiment'],
    'Education': ['Learning', 'Tutorial', 'Course', 'Skill', 'Development', 'Training'],
    'Gaming': ['Console', 'PC Gaming', 'Mobile Games', 'Esports', 'Game Dev', 'Streaming'],
    'Sports': ['Fitness', 'Training', 'Athletes', 'Competition', 'Health', 'Wellness'],
    'Movies': ['Cinema', 'Reviews', 'Production', 'Acting', 'Directors', 'Series'],
    'Music': ['Production', 'Artists', 'Concerts', 'Genres', 'Streaming', 'Cover'],
    'Travel': ['Adventure', 'Destinations', 'Culture', 'Photography', 'Budget', 'Guides'],
    'Lifestyle': ['Wellness', 'Fashion', 'Food', 'Home', 'Mindfulness', 'Hobbies'],
    'Health': ['Fitness', 'Nutrition', 'Mental Health', 'Wellness', 'Medical', 'Exercise'],
    'Politics': ['News', 'Policy', 'Elections', 'Government', 'Activism', 'Opinion']
  };
  return suggestions[category] || [];
};

export default function EditPost() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const post = location.state?.post;
  const { isLoading } = useSelector((state) => state.posts);
  
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTagsPicker, setShowTagsPicker] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setSelectedCategory(post.category || '');
      setSelectedTags(post.tags || []);
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

    const newImagePreviews = files.slice(0, remainingSlots).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImagePreviews]);
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const imageItem = images[index];
      URL.revokeObjectURL(imageItem.preview);
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryPicker(false);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : prev.length < 5
        ? [...prev, tag]
        : prev
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0 && existingImages.length === 0) {
      alert('Please add some content or images');
      return;
    }

    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    if (selectedTags.length === 0) {
      alert('Please add at least one tag');
      return;
    }

    if (!post?._id && !post?.id) {
      alert('Post ID not found');
      return;
    }

    setSaving(true);
    
    // Send FormData with files (only new images)
    const formData = new FormData();
    formData.append('content', content);
    formData.append('category', selectedCategory);
    formData.append('tags', selectedTags.join(','));
    formData.append('keepExisting', 'true'); // Keep existing images
    
    images.forEach(({ file }) => {
      formData.append('files', file);
    });

    try {
      const postId = post._id || post.id;
      await dispatch(updatePost({ postId, postData: formData })).unwrap();
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update post:', error);
      alert(error || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const totalImages = images.length + existingImages.length;

  return (
    <div className="min-h-screen bg-slate-100">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-3.5 h-3.5 text-black" />
          </button>
          <h1 className="text-xs font-semibold text-black">Edit Post</h1>
          <button
            onClick={handleSubmit}
            disabled={isLoading || saving || (!content.trim() && totalImages === 0)}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading || saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-3 py-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200 resize-none placeholder:text-slate-500 text-black bg-slate-50"
          />

          {/* CATEGORY - SINGLE SELECT */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-black transition hover:border-blue-400 hover:bg-slate-50 w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Tag className="w-3 h-3" />
                {selectedCategory ? selectedCategory : 'Select Category'}
              </span>
            </button>

            {/* Category Picker */}
            {showCategoryPicker && (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-600 mb-2">
                  Select one category (required)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(category => {
                    const isSelected = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium transition ${
                          isSelected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-100 text-black hover:bg-slate-200'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* TAGS - MULTIPLE SELECT */}
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setShowTagsPicker(!showTagsPicker)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-black transition hover:border-blue-400 hover:bg-slate-50 w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Tag className="w-3 h-3" />
                Add Tags {selectedTags.length > 0 && `(${selectedTags.length}/5)`}
              </span>
            </button>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="hover:text-green-900"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tags Picker */}
            {showTagsPicker && (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-600 mb-2">
                  Add up to 5 tags (helps categorize your post)
                </p>
                <div className="space-y-2">
                  {/* Popular tags suggestion based on category */}
                  {selectedCategory && (
                    <div>
                      <p className="text-xs font-medium text-slate-700 mb-1.5">Suggested for {selectedCategory}:</p>
                      <div className="flex flex-wrap gap-1">
                        {getTagSuggestions(selectedCategory).map(tag => {
                          const isSelected = selectedTags.includes(tag);
                          const isDisabled = !isSelected && selectedTags.length >= 5;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => !isDisabled && toggleTag(tag)}
                              disabled={isDisabled}
                              className={`px-1.5 py-0.5 rounded-full text-xs font-medium transition ${
                                isSelected
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : isDisabled
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-slate-100 text-black hover:bg-slate-200'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Or create custom tags */}
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-1">Or add custom tags:</p>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        id="customTagInputEdit"
                        placeholder="Enter tag and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            const newTag = e.target.value.trim();
                            if (!selectedTags.includes(newTag) && selectedTags.length < 5) {
                              toggleTag(newTag);
                              e.target.value = '';
                            }
                            e.preventDefault();
                          }
                        }}
                        className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Image Previews */}
          {totalImages > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {/* Existing Images */}
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={img?.url || img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index, true)}
                    className="absolute top-1.5 right-1.5 p-0.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              
              {/* New Images */}
              {images.map(({ preview }, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 p-0.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {totalImages < 5 && (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/20 transition">
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="text-xs text-slate-700 font-medium">
                  {totalImages === 0 ? 'Add photos' : `Add ${5 - totalImages} more`}
                </span>
                <span className="text-xs text-slate-500">PNG, JPG up to 10MB</span>
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
            <p className="text-xs text-slate-600 text-center">
              {totalImages} of 5 images used
            </p>
          )}
        </form>
      </div>
    </div>
  );
}