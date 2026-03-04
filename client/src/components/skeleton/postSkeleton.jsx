export default function PostSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 animate-pulse">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>

        {/* Name + time */}
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
        </div>
      </div>

      {/* Text content */}
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full"></div>
        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        <div className="h-3 bg-slate-200 rounded w-4/6"></div>
      </div>

      {/* Image placeholder */}
      <div className="h-56 bg-slate-200 rounded-xl"></div>

      {/* Actions row */}
      <div className="flex justify-between pt-2">
        <div className="h-4 bg-slate-200 rounded w-12"></div>
        <div className="h-4 bg-slate-200 rounded w-12"></div>
        <div className="h-4 bg-slate-200 rounded w-12"></div>
      </div>

    </div>
  );
}