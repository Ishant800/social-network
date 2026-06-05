const DEFAULT_CATS = [
  'All', 'Relationships', 'College Life', 'Funny', 'Unpopular Opinions',
  'Work Life', 'Family', 'Mental Health', 'Secrets',
];

export default function CategoryPills({ categories, active, onSelect, accent = 'teal' }) {
  const activeCls = accent === 'orange'
    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
    : accent === 'purple'
    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
    : 'bg-teal-600 text-white border-teal-600 shadow-sm';
    
  const hoverCls = accent === 'orange'
    ? 'hover:border-orange-300 hover:text-orange-600'
    : accent === 'purple'
    ? 'hover:border-purple-300 hover:text-purple-600'
    : 'hover:border-teal-300 hover:text-teal-600';
    
  const list = categories?.length ? categories : DEFAULT_CATS;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
      {list.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            active === cat ? activeCls : `bg-white text-slate-600 border-gray-200 ${hoverCls}`
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
