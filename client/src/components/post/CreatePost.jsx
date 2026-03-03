import { Image, Video, Smile, Send } from 'lucide-react';

export default function CreatePost() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-6">
      <div className="flex items-center gap-4">
        {/* User Avatar */}
        <img 
          src="https://ui-avatars.com/api/?name=Ishant&background=4f46e5&color=fff" 
          className="w-11 h-11 rounded-full object-cover border-2 border-indigo-50"
          alt="User"
        />
        
        {/* Input Trigger */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="What's on your mind, Ishant?"
            className="w-full bg-gray-100 border-none rounded-full py-2.5 px-5 text-[15px] focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-rose-50 rounded-lg text-slate-600 transition group">
            <Image className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline">Photo</span>
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 rounded-lg text-slate-600 transition group">
            <Video className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline">Video</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 hover:bg-amber-50 rounded-lg text-slate-600 transition group">
            <Smile className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline">Feeling</span>
          </button>
        </div>

        <button className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}