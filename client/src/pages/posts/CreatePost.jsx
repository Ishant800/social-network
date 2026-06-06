import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Image, X, Globe, Lock, Sparkles, Tag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createpost } from '@/features/post/postSlice';
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

export default function CreatePostPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.posts);

  if(!user) return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          You don't have an account yet
        </h2>
        <p className="text-slate-600 mt-2">
          Create an account to continue and access your profile.
        </p>
        <Link
          to="/signup"
          className="inline-flex mt-4 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
        >
          Create account
        </Link>
      </div>
    );
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // Single category
  const [selectedTags, setSelectedTags] = useState([]); // Tags array
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTagsPicker, setShowTagsPicker] = useState(false);
  const [media, setMedia] = useState([]);
  const [isPublic, setIsPublic] = useState(true);

  const firstName = user?.profile?.fullName?.split(' ')[0] || user?.username || 'there';

  const greetings = [
    `Hey ${firstName}, what's on your mind?`,
    `${firstName}, got something interesting to share?`,
    `Tell your story, ${firstName}`,
    `What's happening, ${firstName}?`,
    `Feeling creative, ${firstName}?`,
  ];

  const [greeting] = useState(
    greetings[Math.floor(Math.random() * greetings.length)]
  );

  const toggleCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryPicker(false); // Close picker after selecting
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

  // MEDIA HANDLER - Store files for upload
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - media.length;

    if (files.length > remainingSlots) {
      alert(`You can upload only ${remainingSlots} more files`);
      return;
    }

    const newMediaPreviews = files.slice(0, remainingSlots).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setMedia(prev => [...prev, ...newMediaPreviews]);
  };

  const removeMedia = (index) => {
    const mediaItem = media[index];
    URL.revokeObjectURL(mediaItem.preview);
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleDiscard = () => {
    media.forEach(({ preview }) => URL.revokeObjectURL(preview));
    setContent('');
    setSelectedCategory('');
    setSelectedTags([]);
    setMedia([]);
    navigate('/');
  };

  // SUBMIT - Send FormData with files
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && media.length === 0) {
      alert('Add some content or media');
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

    // Send FormData with files
    const formData = new FormData();
    formData.append('content', content);
    formData.append('category', selectedCategory);
    formData.append('tags', selectedTags.join(','));
    
    media.forEach(({ file }) => {
      formData.append('files', file);
    });

    try {
      await dispatch(createpost(formData)).unwrap();
      media.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setContent('');
      setSelectedCategory('');
      setSelectedTags([]);
      setMedia([]);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to create post');
    }
  };

  // cleanup previews
  useEffect(() => {
    return () => {
      media.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  }, [media]);

  return (
    <div className="min-h-full bg-slate-100">

      {/* HEADER */}
    
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100/95 backdrop-blur">

        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg p-1.5 transition hover:bg-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-black" />
          </button>

          <h1 className="text-xs font-semibold text-black">
            Create Post
          </h1>

          <div className="w-6"></div>

        </div>

      </div>

      <div className="mx-auto max-w-2xl px-3 py-3 pb-20">

        {/* Greeting */}

        <div className="mb-3 flex items-center gap-2 px-0.5">
          <Sparkles className="w-3 h-3 text-blue-600"/>
          <p className="text-xs text-black font-medium">{greeting}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg bg-white p-3 shadow-sm border border-slate-200">

          {/* CONTENT */}

          <textarea
            value={content}
            onChange={(e)=>setContent(e.target.value)}
            placeholder="Share something..."
            rows={6}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs text-black outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-slate-50 placeholder:text-slate-500"
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
                        id="customTagInput"
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

          {/* MEDIA PREVIEW */}

          {media.length > 0 && (

            <div className="grid grid-cols-3 gap-2">

              {media.map((item,index)=>(
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 border border-slate-200"
                >
                  <img src={item.preview} className="w-full h-full object-cover" alt="" />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={()=>removeMedia(index)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80 transition"
                  >
                    <X className="w-2.5 h-2.5"/>
                  </button>

                </div>
              ))}

            </div>

          )}

          {/* MEDIA BUTTONS */}

          {media.length < 5 && (

            <div className="flex items-center gap-2">

              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-black transition hover:border-blue-400 hover:bg-slate-50">

                <Image className="w-3 h-3"/>

                Add Photo

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMediaChange}
                  className="hidden"
                />

              </label>

              <span className="text-xs text-slate-500 ml-auto">
                {media.length}/5
              </span>

            </div>

          )}

          {/* SIMPLE PRIVACY */}

          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs text-black bg-slate-50">
            <div className="flex items-center gap-2">
              {isPublic
                ? <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3"/> Public
                  </span>
                : <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3"/> Private
                  </span>
              }
            </div>

            <input
              type="checkbox"
              checked={isPublic}
              onChange={()=>setIsPublic(!isPublic)}
              className="h-3 w-3 accent-blue-600"
            />
          </div>

          {/* ACTION BUTTONS */}

          <div className="flex gap-2 pt-1">

            <button
              type="button"
              onClick={handleDiscard}
              className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-black transition hover:bg-slate-100"
            >
              Discard
            </button>

            <button
              type="submit"
              disabled={isLoading || (!content.trim() && media.length===0)}
              className="flex-1 rounded-lg bg-teal-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Posting..." : "Post"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
