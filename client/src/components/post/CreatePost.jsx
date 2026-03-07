import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ArrowLeft, Image, Video, X, Globe, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreatePostPage({ onPost }) {

  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [media, setMedia] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'there';

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

  // MEDIA HANDLER
  const handleMediaChange = (e) => {

    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - media.length;

    if (files.length > remainingSlots) {
      alert(`You can upload only ${remainingSlots} more files`);
      return;
    }

    const newMedia = files.slice(0, remainingSlots).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));

    setMedia(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (index) => {
    URL.revokeObjectURL(media[index].preview);
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  // DISCARD
  const handleDiscard = () => {
    setContent('');
    setTags('');
    setMedia([]);
    navigate('/');
  };

  // SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!content.trim() && media.length === 0) {
      alert('Add some content or media');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();

    formData.append('content', content);
    formData.append('tags', tags);
    formData.append('isPublic', isPublic);

    media.forEach(({ file }) => {
      formData.append('media', file);
    });

    try {

      await onPost?.(formData);

      handleDiscard();

    } catch (err) {
      console.error(err);
    }

    setSubmitting(false);
  };

  // cleanup previews
  useEffect(() => {
    return () => {
      media.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  }, [media]);

  return (
    <div className="min-h-screen bg-white">

      {/* HEADER */}

      <div className="sticky top-0 bg-white border-b border-slate-100">

        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">

          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>

          <h1 className="text-sm font-semibold text-slate-800">
            Create Post
          </h1>

          <div className="w-8"></div>

        </div>

      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-28">

        {/* Greeting */}

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-indigo-500"/>
          <p className="text-sm text-slate-700 font-medium">{greeting}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* CONTENT */}

          <textarea
            value={content}
            onChange={(e)=>setContent(e.target.value)}
            placeholder="Share something..."
            rows={4}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />

          {/* TAGS */}

          <input
            value={tags}
            onChange={(e)=>setTags(e.target.value)}
            placeholder="tags: tech, coding"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* MEDIA PREVIEW */}

          {media.length > 0 && (

            <div className="grid grid-cols-3 gap-2">

              {media.map((item,index)=>(
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden"
                >

                  {item.type === "video"
                    ? <video src={item.preview} className="w-full h-full object-cover"/>
                    : <img src={item.preview} className="w-full h-full object-cover"/>
                  }

                  <button
                    type="button"
                    onClick={()=>removeMedia(index)}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                  >
                    <X className="w-3 h-3"/>
                  </button>

                </div>
              ))}

            </div>

          )}

          {/* MEDIA BUTTONS */}

          {media.length < 5 && (

            <div className="flex gap-2">

              <label className="flex items-center gap-2 text-sm border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50">

                <Image className="w-4 h-4"/>

                Photo

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMediaChange}
                  className="hidden"
                />

              </label>

              <label className="flex items-center gap-2 text-sm border border-slate-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50">

                <Video className="w-4 h-4"/>

                Video

                <input
                  type="file"
                  accept="video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                />

              </label>

              <span className="text-xs text-slate-400 ml-auto">
                {media.length}/5
              </span>

            </div>

          )}

          {/* SIMPLE PRIVACY */}

          <div className="flex items-center gap-2 text-sm text-slate-600">

            <input
              type="checkbox"
              checked={isPublic}
              onChange={()=>setIsPublic(!isPublic)}
              className="w-4 h-4 accent-indigo-600"
            />

            {isPublic
              ? <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4"/> Public post
                </span>
              : <span className="flex items-center gap-1">
                  <Lock className="w-4 h-4"/> Private post
                </span>
            }

          </div>

          {/* ACTION BUTTONS */}

          <div className="flex gap-3 pt-4">

            <button
              type="button"
              onClick={handleDiscard}
              className="flex-1 py-2.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Discard
            </button>

            <button
              type="submit"
              disabled={submitting || (!content.trim() && media.length===0)}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {submitting ? "Posting..." : "Post"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}