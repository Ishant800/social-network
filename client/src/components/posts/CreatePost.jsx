import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Image, X, Globe, Lock, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createpost } from '../../features/post/postSlice';

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
  const [tags, setTags] = useState('');
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
      preview: URL.createObjectURL(file)
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

    const formData = new FormData();

    formData.append('content', content);
    formData.append('tags', tags);
    formData.append('isPublic', isPublic);

    media.forEach(({ file }) => {
      formData.append('media', file);
    });

    try {
      await dispatch(createpost(formData)).unwrap();
      handleDiscard();
    } catch (err) {
      console.error(err);
    }
  };

  // cleanup previews
  useEffect(() => {
    return () => {
      media.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  }, [media]);

  return (
    <div className="min-h-full bg-[#f5f7f9]">

      {/* HEADER */}
    
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-[#f5f7f9]/95 backdrop-blur">

        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl p-2 transition hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>

          <h1 className="text-sm font-semibold text-slate-800">
            Create Post
          </h1>

          <div className="w-8"></div>

        </div>

      </div>

      <div className="mx-auto max-w-2xl px-4 py-5 pb-24">

        {/* Greeting */}

        <div className="mb-4 flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-indigo-500"/>
          <p className="text-sm text-slate-700 font-medium">{greeting}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-sm bg-slate-50 p-5 shadow-sm md:p-6">

          {/* CONTENT */}

          <textarea
            value={content}
            onChange={(e)=>setContent(e.target.value)}
            placeholder="Share something..."
            rows={10}
            className="w-full resize-none rounded-sm border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#4e44d4]"
          />

          {/* TAGS */}

          <input
            value={tags}
            onChange={(e)=>setTags(e.target.value)}
            placeholder="tags: tech, coding"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#4e44d4]"
          />

          {/* MEDIA PREVIEW */}

          {media.length > 0 && (

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

              {media.map((item,index)=>(
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
                >
                  <img src={item.preview} className="w-full h-full object-cover" />

                  <button
                    type="button"
                    onClick={()=>removeMedia(index)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                  >
                    <X className="w-3 h-3"/>
                  </button>

                </div>
              ))}

            </div>

          )}

          {/* MEDIA BUTTONS */}

          {media.length < 5 && (

            <div className="flex items-center gap-3">

              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#4e44d4] hover:text-[#4e44d4]">

                <Image className="w-4 h-4"/>

                Add Photo

                <input
                  type="file"
                  accept="image/*"
                  multiple
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

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              {isPublic
                ? <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4"/> Public post
                  </span>
                : <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4"/> Private post
                  </span>
              }
            </div>

            <input
              type="checkbox"
              checked={isPublic}
              onChange={()=>setIsPublic(!isPublic)}
              className="h-4 w-4 accent-[#4e44d4]"
            />
          </div>

          {/* ACTION BUTTONS */}

          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={handleDiscard}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Discard
            </button>

            <button
              type="submit"
              disabled={isLoading || (!content.trim() && media.length===0)}
              className="flex-1 rounded-xl bg-[#02a7ed] py-3 text-sm font-semibold text-white transition hover:bg-[#4339bb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Posting..." : "Post"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
