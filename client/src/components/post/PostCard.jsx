import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, X, ChevronLeft, ChevronRight } from 'lucide-react';
import CommentSection from '../comment/commentSection';

export default function PostCard({ post }) {
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const images = post.images || [];
const [showComments, setShowComments] = useState(false);


  // Helper to handle lightbox navigation
  const navigateLightbox = (e, direction) => {
    e.stopPropagation();
    if (direction === 'next' && activeImageIndex < images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    } else if (direction === 'prev' && activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm mb-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} 
            className="h-11 w-11 rounded-full border border-gray-100 object-cover" 
            alt={post.author} 
          />
          <div>
            <h3 className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors">
              {post.author}
            </h3>
            <p className="text-xs text-slate-500">@{post.username} • {post.time}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      {/* Post Content */}
      <p className="text-[15px] leading-relaxed text-slate-800 mb-4">
        {post.content}
      </p>

      {/* Dynamic Image Grid */}
      {images.length > 0 && (
        <div className={`grid gap-1.5 rounded-xl overflow-hidden border border-gray-100 mb-4 ${
          images.length === 1 ? "grid-cols-1" : "grid-cols-2"
        }`}>
          {images.slice(0, 4).map((img, index) => {
            // Layout Logic:
            // 1 Image: Full width, auto height
            // 2 Images: Side by side, equal height
            // 3 Images: 1st image is tall (left), 2nd/3rd stack (right)
            // 4+ Images: 2x2 grid
            
            const isFirstOfThree = images.length === 3 && index === 0;
            
            return (
              <div 
                key={index} 
                className={`relative cursor-pointer overflow-hidden bg-gray-50 group
                  ${isFirstOfThree ? "row-span-2 h-80 sm:h-96" : "h-40 sm:h-48"} 
                  ${images.length === 1 ? "h-auto max-h-[500px]" : ""}
                `}
                onClick={() => setActiveImageIndex(index)}
              >
                <img 
                  src={img} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  alt="Post gallery" 
                />
                
                {/* Overlay for "See More" */}
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-white text-xl font-bold">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex gap-2 sm:gap-6">

            

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group">
            <Heart className="w-5 h-5 group-hover:fill-rose-600" />
            <span className="text-sm font-semibold">{post.likes}</span>
          </button>
          
        <button 
  onClick={() => setShowComments(!showComments)}
  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
    showComments ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
  }`}
>
  <MessageCircle className="w-5 h-5" />
  <span className="text-sm font-semibold">{post.comments}</span>
</button>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        
        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>


{showComments && <CommentSection postId={post.id} />}
      {/* Lightbox / Image Viewer Modal */}
      {activeImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200"
          onClick={() => setActiveImageIndex(null)}
        >
          {/* Close Button */}
          <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-[110]">
            <X className="w-8 h-8" />
          </button>

          {/* Large Image */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img 
              src={images[activeImageIndex]} 
              className="max-w-full max-h-full object-contain select-none shadow-2xl rounded-lg" 
              alt="Enlarged view"
              onClick={(e) => e.stopPropagation()} 
            />
            
            {/* Navigation Controls */}
            {images.length > 1 && (
              <>
                <button 
                  disabled={activeImageIndex === 0}
                  className="absolute left-4 p-4 text-white/50 hover:text-white disabled:opacity-10 transition-opacity"
                  onClick={(e) => navigateLightbox(e, 'prev')}
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button 
                  disabled={activeImageIndex === images.length - 1}
                  className="absolute right-4 p-4 text-white/50 hover:text-white disabled:opacity-10 transition-opacity"
                  onClick={(e) => navigateLightbox(e, 'next')}
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-10 text-white/80 font-medium text-sm">
            {activeImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </article>
  );
}