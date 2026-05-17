import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VenetianMask, PenLine, TrendingUp } from 'lucide-react';
import {
  loadConfessions,
  loadTrending,
  setCategory,
} from '../features/confession/confessionSlice';
import ConfessionCard from '../components/confessions/ConfessionCard';
import WriteConfessionModal from '../components/confessions/WriteConfessionModal';
import AnonymousAvatar from '../components/confessions/AnonymousAvatar';
import CategoryPills from '../components/confessions/CategoryPills';

const TRENDING_BG = [
  'bg-violet-50 border-violet-100',
  'bg-emerald-50 border-emerald-100',
  'bg-orange-50 border-orange-100',
  'bg-pink-50 border-pink-100',
  'bg-sky-50 border-sky-100',
  'bg-amber-50 border-amber-100',
];

function TrendingCard({ confession, index }) {
  const persona = confession.anonymousPersona;
  const bg = TRENDING_BG[index % TRENDING_BG.length];
  return (
    <div className={`shrink-0 w-44 rounded-2xl border p-3.5 ${bg} hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-2 mb-2">
        <AnonymousAvatar persona={persona} size="sm" />
        <span className="text-[11px] font-bold text-slate-700 truncate">{persona?.name}</span>
      </div>
      <p className="text-[11px] text-slate-600 line-clamp-4 leading-relaxed">{confession.content}</p>
    </div>
  );
}

export default function Confessions() {
  const dispatch = useDispatch();
  const {
    items,
    trending,
    activeCategory,
    categories,
    loading,
    hasMore,
    page,
    error,
  } = useSelector((s) => s.confession);

  const [modalOpen, setModalOpen] = useState(false);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    dispatch(loadConfessions({ page: 1, category: activeCategory }));
    dispatch(loadTrending());
  }, [dispatch, activeCategory]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      dispatch(loadConfessions({ page: page + 1, category: activeCategory, append: true }));
    }
  }, [dispatch, loading, hasMore, page, activeCategory]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  return (
    <div className="space-y-4 pb-10">
      <div className="rounded-2xl bg-gradient-to-r from-[#3d2a7a] via-[#5b3fb8] to-[#4a2d8f] p-5 sm:p-6 text-white relative overflow-hidden shadow-lg shadow-purple-900/20">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <VenetianMask size={26} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold">Text Confessions</h1>
              <p className="text-xs sm:text-sm text-purple-200/90 mt-0.5">
                Write anonymously. No names, ever.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#5b3fb8] text-sm font-bold hover:bg-purple-50 shadow-md transition-colors"
          >
            <PenLine size={15} />
            Write Confession
          </button>
        </div>
      </div>

      <CategoryPills
        categories={categories}
        active={activeCategory}
        onSelect={(cat) => dispatch(setCategory(cat))}
        accent="purple"
      />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-14 rounded-2xl bg-white border border-slate-100">
          <VenetianMask size={44} className="mx-auto text-[#7B61FF]/40 mb-3" />
          <p className="font-display font-bold text-slate-800">No confessions yet</p>
          <p className="text-sm text-slate-400 mt-1">Be the first to share anonymously</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-5 px-6 py-2.5 rounded-xl bg-[#7B61FF] text-white text-sm font-bold hover:bg-[#6a52e8] transition-colors"
          >
            Write a Confession
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((c, i) => (
            <ConfessionCard
              key={c._id || c.id}
              confession={c}
              defaultExpanded={i === 0}
            />
          ))}
        </div>
      )}

      <div ref={loadMoreRef} className="h-2" />
      {loading && items.length > 0 && (
        <p className="text-center text-xs text-slate-400">Loading more…</p>
      )}

      {trending.length > 0 && (
        <section className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={17} className="text-[#FF8A00]" />
            <h2 className="font-display font-bold text-slate-800 text-sm">Trending Confessions</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
            {trending.map((c, i) => (
              <TrendingCard key={c._id || c.id} confession={c} index={i} />
            ))}
          </div>
        </section>
      )}

      <WriteConfessionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
