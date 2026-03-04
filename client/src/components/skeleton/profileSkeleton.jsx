export function ProfileSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto p-4 animate-pulse space-y-6">
      
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-slate-200 rounded-2xl"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
      </div>

      <div className="h-8 bg-slate-200 rounded w-full"></div>
    </div>
  );
}