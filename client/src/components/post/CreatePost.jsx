import { useState } from 'react';
import { Image, Video, Smile, Send } from 'lucide-react';


export default function CreatePost() {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-6"
    >
      <div className="flex items-center gap-4">
        <img
          src="https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff"
          className="w-11 h-11 rounded-full object-cover border-2 border-indigo-50"
          alt="User"
        />

        <div className="flex-1 relative">
          <input
            type="text"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-gray-100 border-none rounded-full py-2.5 px-5 text-[15px] focus:ring-2 focus:ring-indigo-500 transition-all hover:bg-gray-200"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="flex items-center gap-2 px-3 py-2 hover:bg-rose-50 rounded-lg text-slate-600 transition group cursor-pointer">
            <Image className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline">
              Photo / Video
            </span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-slate-500 text-xs">
            <Smile className="w-4 h-4 text-amber-500" />
            <input
              type="text"
              placeholder="Add tags e.g. design,react"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-3 w-3"
            />
            <span>Public</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <span className="text-[11px] text-rose-500 max-w-[160px] line-clamp-2">
              {error}
            </span>
          )}

          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
}