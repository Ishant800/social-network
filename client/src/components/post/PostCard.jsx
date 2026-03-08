import { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  Edit3,
  Trash2,
  Globe,
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import CommentSection from '../comment/commentSection';
import { useNavigate } from 'react-router-dom';

export default function PostCard({ post, currentUser, onEdit, onDelete }) {
  const navigate =useNavigate()
  const [showComments, setShowComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [isPublic, setIsPublic] = useState(post?.isPublic ?? true);
  const dropdownRef = useRef(null);

  const images = post.images || post.media || [];
  const authorName = post.author || post.user?.name || 'Unknown User';
  const username = post.username || (post.user?.name && post.user.name.toLowerCase().replace(/\s+/g, '')) || 'user';
  const time = post.time || post.createdAt;
  
  const likeCount = typeof post.likes === 'number' ? post.likes : Array.isArray(post.likes) ? post.likes.length : 0;
  const commentCount = typeof post.comments === 'number' ? post.comments : typeof post.commentsCount === 'number' ? post.commentsCount : 0;
  
  const isOwner = currentUser?.id === post.user;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete?.(post.id || post._id);
    }
    setShowDropdown(false);
  };

  const handleEdit = () => {
    onEdit?.(post);

    setShowDropdown(false);
    navigate("/post/edit")
  };

  const handlePrivacyToggle = () => {
    setIsPublic(!isPublic);
    setShowDropdown(false);
  };

  const navigateLightbox = (e, direction) => {
    e.stopPropagation();
    if (direction === 'next' && activeImageIndex < images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    } else if (direction === 'prev' && activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  return (
    <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm mb-4">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${authorName}&background=random`}
            className="w-10 h-10 rounded-full object-cover"
            alt={authorName}
          />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{authorName}</h3>
            <p className="text-xs text-slate-500">@{username} • {time}</p>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-slate-100 shadow-lg z-10 py-1">
              {isOwner && (
                <>
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                  >
                    <Edit3 className="w-4 h-4" /> Edit post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                  >
                    <Trash2 className="w-4 h-4" /> Delete post
                  </button>

                  <button
                onClick={handlePrivacyToggle}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <span className="flex items-center gap-2">
                  {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {isPublic ? 'Public' : 'Private'}
                </span>
                <div className={`w-8 h-4 rounded-full relative transition ${isPublic ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition ${isPublic ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left">
                <Bookmark className="w-4 h-4" /> Save post
              </button>
                  {/* <div className="border-t border-slate-100 my-1"></div> */}
                </>
              )}
              
              
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <p className="text-sm text-slate-800 mb-3 leading-relaxed">{post.content}</p>
      
      {post.tags?.length > 0 && (
        <p className="text-sm text-indigo-600 mb-3">#{post.tags[0]}</p>
      )}

      {/* Images Grid - Clickable */}
      {images.length > 0 && (
        <div className={`grid gap-1 rounded-lg overflow-hidden mb-3 ${
          images.length === 1 ? 'grid-cols-1' : 
          images.length === 2 ? 'grid-cols-2' : 
          images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
        }`}>
          {images.slice(0, 4).map((img, index) => {
            const isFirstOfThree = images.length === 3 && index === 0;
            return (
              <div 
                key={index} 
                className={`relative bg-slate-50 cursor-pointer group ${
                  isFirstOfThree ? 'row-span-2' : ''
                } ${images.length === 1 ? 'h-64' : 'h-40'}`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img 
                  src={img} 
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
            <Heart className="w-4 h-4" />
            <span className="text-xs font-medium">{likeCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              showComments ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">{commentCount}</span>
          </button>
          
          <button className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
          <Bookmark className="w-4 h-4"/>
        </button>
      </div>

      {showComments && <CommentSection postId={post.id || post._id} />}

      {/* Lightbox Modal */}
      {activeImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveImageIndex(null)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
            onClick={() => setActiveImageIndex(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            <img 
              src={images[activeImageIndex]} 
              alt="Full size view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button 
                  disabled={activeImageIndex === 0}
                  className="absolute left-4 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition disabled:opacity-30"
                  onClick={(e) => navigateLightbox(e, 'prev')}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  disabled={activeImageIndex === images.length - 1}
                  className="absolute right-4 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition disabled:opacity-30"
                  onClick={(e) => navigateLightbox(e, 'next')}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 text-white/80 text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full">
            {activeImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </article>
  );
}