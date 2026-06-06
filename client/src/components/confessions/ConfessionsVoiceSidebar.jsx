import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Mic, Waves } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loadVoiceFeed } from '@/features/confession/confessionSlice';
import AnonymousAvatar from './AnonymousAvatar';
import VoicePlayer from './VoicePlayer';

export default function ConfessionsVoiceSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { voiceItems, voiceLoading } = useSelector((s) => s.confession);

  const onVoicePage = pathname === '/voice-stories';

  useEffect(() => {
    if (voiceItems.length === 0) {
      dispatch(loadVoiceFeed({ page: 1, limit: 8 }));
    }
  }, [dispatch, voiceItems.length]);

  const preview = voiceItems.slice(0, 6);
  const featured = voiceItems[0];

  const goVoicePage = () => navigate('/voice-stories');
  const openRecord = () => {
    navigate('/voice-stories?record=1');
    window.dispatchEvent(new CustomEvent('open-voice-modal'));
  };

  return (
    <div className="p-4">
      <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Waves size={16} className="text-orange-600" />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-sm">Voice Stories</h3>
          </div>
          <button
            type="button"
            onClick={openRecord}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-bold hover:bg-orange-600 transition-colors"
          >
            <Plus size={12} />
            Record
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
          <button
            type="button"
            onClick={openRecord}
            className="shrink-0 flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-orange-300 flex items-center justify-center bg-orange-50 hover:bg-orange-100 transition-colors">
              <Plus size={18} className="text-orange-500" />
            </div>
            <span className="text-[9px] text-slate-500 font-medium">New</span>
          </button>
          {voiceLoading && preview.length === 0 ? (
            <p className="text-[10px] text-slate-400 self-center px-2">Loading…</p>
          ) : (
            preview.map((story) => {
              const persona = story.anonymousPersona;
              const color = persona?.avatarColor || '#f97316';
              return (
                <button
                  key={story._id || story.id}
                  type="button"
                  onClick={goVoicePage}
                  className="shrink-0 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-12 h-12 rounded-full p-0.5"
                    style={{ background: `linear-gradient(135deg, ${color}, #f97316)` }}
                  >
                    <AnonymousAvatar persona={persona} size="sm" />
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium w-12 truncate text-center">
                    {persona?.animal || 'Voice'}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {featured?.voice?.url ? (
          <button
            type="button"
            onClick={goVoicePage}
            className="mt-3 w-full rounded-xl overflow-hidden relative text-left bg-gradient-to-br from-orange-500 to-amber-500 p-4 hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center gap-2 mb-3">
              <AnonymousAvatar persona={featured.anonymousPersona} size="sm" />
              <span className="text-xs font-semibold text-white truncate">
                {featured.anonymousPersona?.name}
              </span>
            </div>
            <VoicePlayer
              url={featured.voice.url}
              duration={featured.voice.duration}
              compact
              variant="dark"
            />
            {featured.category && (
              <span className="inline-block mt-2 text-[10px] font-medium text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                {featured.category}
              </span>
            )}
          </button>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-orange-200 bg-orange-50/60 p-5 text-center">
            <Mic size={24} className="mx-auto text-orange-400/60 mb-2" />
            <p className="text-xs text-slate-500">No voice stories yet</p>
            <button
              type="button"
              onClick={openRecord}
              className="mt-2 text-xs font-bold text-orange-600 hover:underline"
            >
              Record the first one
            </button>
          </div>
        )}

        {!onVoicePage && preview.length > 0 && (
          <button
            type="button"
            onClick={goVoicePage}
            className="mt-3 w-full py-2 rounded-lg text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            View all voice stories →
          </button>
        )}
      </section>
    </div>
  );
}
