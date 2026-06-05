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
  'bg-teal-50 border-teal-100',
  'bg-blue-50 border-blue-100',
  'bg-emerald-50 border-emerald-100',
  'bg-cyan-50 border-cyan-100',
  'bg-sky-50 border-sky-100',
  'bg-indigo-50 border-indigo-100',
];

function TrendingCard({ confession, index }) {
  const persona = confession.anonymousPersona;
  const bg = TRENDING_BG[index % TRENDING_BG.length];
  return (
    <div className={`shrink-0 w-44 rounded-xl border p-3 ${bg} hover:shadow-sm transition-shadow cursor-pointer`}>
      <div className="flex items-center gap-2 mb-2">
        <AnonymousAvatar persona={persona} size="sm" />
        <span className="text-[11px] font-semibold text-slate-700 truncate">{persona?.name}</span>
      </div>
      <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">{confession.content}</p>
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
    <div className="max-w-2xl mx-auto space-y-4 pb-10">
      {/* Header Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
              <VenetianMask size={24} strokeWidth={2} className="text-teal-600" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900">Anonymous Confessions</h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Share your thoughts anonymously
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 shadow-sm transition-colors"
          >
            <PenLine size={16} />
            Write Confession
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <CategoryPills
        categories={categories}
        active={activeCategory}
        onSelect={(cat) => dispatch(setCategory(cat))}
        accent="teal"
      />

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-white border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 rounded-xl bg-white border border-gray-200">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3">
            <VenetianMask size={28} className="text-teal-600" />
          </div>
          <p className="font-display font-semibold text-slate-900">No confessions yet</p>
          <p className="text-sm text-slate-500 mt-1">Be the first to share anonymously</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-4 px-5 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            Write a Confession
          </button>
        </div>
      ) : (
        /* Confessions List */
        <div className="space-y-3">
          {items.map((c, i) => (
            <ConfessionCard
              key={c._id || c.id}
              confession={c}
              defaultExpanded={i === 0}
            />
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="h-2" />
      {loading && items.length > 0 && (
        <p className="text-center text-xs text-slate-400">Loading more…</p>
      )}

      {/* Trending Section */}
      {trending.length > 0 && (
        <section className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-teal-600" />
            <h2 className="font-display font-semibold text-slate-900 text-sm">Trending Confessions</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
            {trending.map((c, i) => (
              <TrendingCard key={c._id || c.id} confession={c} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Write Confession Modal */}
      <WriteConfessionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
