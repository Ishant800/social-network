import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Mic, Waves } from 'lucide-react';
import {
  loadVoiceFeed,
  setVoiceCategory,
} from '@/features/confession/confessionSlice';
import VoiceConfessionCard from '@/components/confessions/VoiceConfessionCard';
import WriteVoiceModal from '@/components/confessions/WriteVoiceModal';
import CategoryPills from '@/components/confessions/CategoryPills';

export default function VoiceStories() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const {
    voiceItems,
    voiceCategory,
    voiceCategories,
    voiceLoading,
    voiceHasMore,
    voicePage,
    error,
  } = useSelector((s) => s.confession);

  const [modalOpen, setModalOpen] = useState(searchParams.get('record') === '1');
  const loadMoreRef = useRef(null);

  useEffect(() => {
    dispatch(loadVoiceFeed({ page: 1, category: voiceCategory }));
  }, [dispatch, voiceCategory]);

  const loadMore = useCallback(() => {
    if (!voiceLoading && voiceHasMore) {
      dispatch(loadVoiceFeed({ page: voicePage + 1, category: voiceCategory, append: true }));
    }
  }, [dispatch, voiceLoading, voiceHasMore, voicePage, voiceCategory]);

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

  useEffect(() => {
    const open = () => setModalOpen(true);
    window.addEventListener('open-voice-modal', open);
    return () => window.removeEventListener('open-voice-modal', open);
  }, []);

  return (
    <div className="space-y-4 pb-10">
      <div className="rounded-2xl bg-gradient-to-br from-[#c2410c] via-[#ea580c] to-[#f97316] p-5 sm:p-6 text-white relative overflow-hidden shadow-lg shadow-orange-900/20">
        <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-white/10" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/25">
              <Waves size={26} />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold">Voice Stories</h1>
              <p className="text-xs sm:text-sm text-orange-100 mt-0.5">
                Record your story. Stay completely anonymous.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-600 text-sm font-bold hover:bg-orange-50 shadow-md transition-colors"
          >
            <Mic size={15} />
            Record Story
          </button>
        </div>
      </div>

      <CategoryPills
        categories={voiceCategories}
        active={voiceCategory}
        onSelect={(cat) => dispatch(setVoiceCategory(cat))}
        accent="orange"
      />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {voiceLoading && voiceItems.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-orange-50/50 border border-orange-100 animate-pulse" />
          ))}
        </div>
      ) : voiceItems.length === 0 ? (
        <div className="text-center py-14 rounded-2xl bg-orange-50/30 border border-orange-100">
          <Mic size={44} className="mx-auto text-orange-400/50 mb-3" />
          <p className="font-display font-bold text-slate-800">No voice stories yet</p>
          <p className="text-sm text-slate-400 mt-1">Be the first to share your voice</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-5 px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
          >
            Record a Story
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {voiceItems.map((c, i) => (
            <VoiceConfessionCard
              key={c._id || c.id}
              confession={c}
              defaultExpanded={i === 0}
            />
          ))}
        </div>
      )}

      <div ref={loadMoreRef} className="h-2" />
      {voiceLoading && voiceItems.length > 0 && (
        <p className="text-center text-xs text-slate-400">Loading more…</p>
      )}

      <WriteVoiceModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
