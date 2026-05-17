const DEFAULT_CATS = [
  'All', 'Relationships', 'College Life', 'Funny', 'Unpopular Opinions',
  'Work Life', 'Family', 'Mental Health', 'Secrets',
];

export default function CategoryPills({ categories, active, onSelect, accent = 'purple' }) {
  const activeCls = accent === 'orange'
    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200/50'
    : 'bg-[#7B61FF] text-white border-[#7B61FF] shadow-md shadow-purple-200/50';
  const hoverCls = accent === 'orange'
    ? 'hover:border-orange-300 hover:text-orange-600'
    : 'hover:border-[#7B61FF]/40 hover:text-[#7B61FF]';
  const list = categories?.length ? categories : DEFAULT_CATS;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1">
      {list.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            active === cat ? activeCls : `bg-white text-slate-600 border-slate-200 ${hoverCls}`
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
