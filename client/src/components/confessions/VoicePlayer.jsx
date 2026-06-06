import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { getPlayableVoiceUrl } from '@/utils/voice';

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

const THEMES = {
  default: {
    wrap: 'bg-violet-50 border-violet-100',
    barActive: 'bg-[#7B61FF]',
    barIdle: 'bg-[#7B61FF]/35',
    btn: 'bg-[#7B61FF] hover:bg-[#6a52e8]',
    time: 'text-slate-500',
  },
  voice: {
    wrap: 'bg-white/95 border-white/40 shadow-sm',
    barActive: 'bg-orange-500',
    barIdle: 'bg-orange-300/60',
    btn: 'bg-orange-500 hover:bg-orange-600',
    time: 'text-slate-600',
  },
  dark: {
    wrap: 'bg-white/15 border-white/25 backdrop-blur',
    barActive: 'bg-white',
    barIdle: 'bg-white/40',
    btn: 'bg-white text-orange-600 hover:bg-orange-50',
    time: 'text-white/80',
  },
};

export default function VoicePlayer({
  url,
  duration = 0,
  compact = false,
  variant = 'default',
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const theme = THEMES[variant] || THEMES.default;
  const total = duration || 0;
  const playableUrl = getPlayableVoiceUrl(url);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    setPlaying(false);
    setCurrent(0);
    audio.load();

    const onTime = () => setCurrent(audio.currentTime);
    const onEnd = () => {
      setPlaying(false);
      setCurrent(0);
    };
    const onError = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('error', onError);
    };
  }, [playableUrl]);

  const toggle = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !playableUrl) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const displayDuration = total || audioRef.current?.duration || 0;
  const bars = compact ? 20 : 28;

  return (
    <div className={compact ? '' : 'mt-3'} onClick={(e) => e.stopPropagation()}>
      <audio ref={audioRef} src={playableUrl} preload="metadata" className="hidden" />
      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${theme.wrap}`}>
        <button
          type="button"
          onClick={toggle}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${theme.btn} ${
            variant === 'dark' ? '' : 'text-white'
          }`}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <Pause size={15} fill={variant === 'dark' ? 'currentColor' : 'white'} />
          ) : (
            <Play size={15} fill={variant === 'dark' ? 'currentColor' : 'white'} className="ml-0.5" />
          )}
        </button>
        <div className="flex-1 flex items-end gap-0.5 h-7 min-w-0">
          {Array.from({ length: bars }).map((_, i) => {
            const progress = displayDuration ? current / displayDuration : 0;
            const active = i / bars <= progress;
            return (
              <div
                key={i}
                className={`w-0.5 rounded-full transition-colors ${
                  active ? theme.barActive : theme.barIdle
                }`}
                style={{ height: `${8 + Math.abs(Math.sin(i * 0.45)) * 16}px` }}
              />
            );
          })}
        </div>
        <span className={`text-[10px] font-medium shrink-0 tabular-nums ${theme.time}`}>
          {formatTime(playing || current > 0 ? current : displayDuration)}
        </span>
      </div>
    </div>
  );
}
