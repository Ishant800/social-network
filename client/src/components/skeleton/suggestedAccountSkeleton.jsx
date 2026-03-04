export function SuggestedAccountsSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 space-y-4 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>

      {[1,2,3].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-20"></div>
              <div className="h-3 bg-slate-200 rounded w-16"></div>
            </div>
          </div>
          <div className="h-8 w-16 bg-slate-200 rounded-full"></div>
        </div>
      ))}
    </div>
  );
}