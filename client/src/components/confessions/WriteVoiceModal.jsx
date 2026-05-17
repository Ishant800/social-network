import { useEffect, useRef, useState } from 'react';
import { X, Mic, Square, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { submitConfession, clearConfessionError } from '../../features/confession/confessionSlice';
import VoicePlayer from './VoicePlayer';

const CATEGORIES = [
  'Relationships', 'College Life', 'Funny', 'Unpopular Opinions',
  'Work Life', 'Family', 'Mental Health', 'Secrets', 'Advice', 'Other',
];

const MAX_VOICE_SECONDS = 120;

function formatRecordTime(seconds) {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function WriteVoiceModal({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { creating, error } = useSelector((s) => s.confession);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('College Life');
  const [tags, setTags] = useState('');
  const [localError, setLocalError] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voicePreviewUrl, setVoicePreviewUrl] = useState(null);
  const [voiceDuration, setVoiceDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordSecondsRef = useRef(0);

  useEffect(() => {
    if (!open) return undefined;
    return () => {
      if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, voicePreviewUrl]);

  if (!open) return null;

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const clearVoice = () => {
    if (voicePreviewUrl) URL.revokeObjectURL(voicePreviewUrl);
    setVoiceBlob(null);
    setVoicePreviewUrl(null);
    setVoiceDuration(0);
    setRecordSeconds(0);
    recordSecondsRef.current = 0;
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const startRecording = async () => {
    setLocalError('');
    clearVoice();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stopTracks();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setVoiceBlob(blob);
        setVoiceDuration(Math.round(recordSecondsRef.current));
        setVoicePreviewUrl(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      setRecordSeconds(0);
      recordSecondsRef.current = 0;
      const started = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - started) / 1000;
        recordSecondsRef.current = elapsed;
        setRecordSeconds(elapsed);
        if (elapsed >= MAX_VOICE_SECONDS) stopRecording();
      }, 200);
    } catch {
      setLocalError('Allow microphone access to record.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!voiceBlob) {
      setLocalError('Record your voice message first.');
      return;
    }
    setLocalError('');
    dispatch(clearConfessionError());

    const tagList = tags
      .split(/[,\s]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean);

    try {
      await dispatch(submitConfession({
        content: content.trim(),
        category,
        tags: tagList,
        voiceBlob,
        duration: Math.round(voiceDuration || recordSeconds),
      })).unwrap();
      setContent('');
      setTags('');
      clearVoice();
      navigate('/voice-stories');
      onClose();
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to post.';
      setLocalError(msg);
    }
  };

  const displayError = localError || error;
  const progress = Math.min((recordSeconds / MAX_VOICE_SECONDS) * 100, 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} role="presentation" />
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl animate-fade-up overflow-hidden max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100 bg-orange-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <Mic size={16} />
            </div>
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900">Record voice</h2>
              <p className="text-[10px] text-slate-500">Anonymous · up to 2 min</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-orange-100 text-slate-500">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-3 text-center">
            {voicePreviewUrl ? (
              <div className="space-y-2">
                <VoicePlayer url={voicePreviewUrl} duration={voiceDuration} variant="voice" compact />
                <button
                  type="button"
                  onClick={clearVoice}
                  className="text-[11px] font-semibold text-red-500 hover:text-red-600"
                >
                  <Trash2 size={12} className="inline mr-1" />
                  Re-record
                </button>
              </div>
            ) : (
              <>
                <div className="relative mx-auto w-16 h-16 mb-2">
                  {recording && (
                    <span className="absolute inset-0 rounded-full bg-orange-400/25 animate-ping" />
                  )}
                  <button
                    type="button"
                    onClick={recording ? stopRecording : startRecording}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md transition-all ${
                      recording ? 'bg-red-500' : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    {recording ? <Square size={22} fill="white" /> : <Mic size={22} />}
                  </button>
                </div>
                <p className="text-xl font-mono font-bold text-orange-600 tabular-nums">
                  {formatRecordTime(recording ? recordSeconds : 0)}
                </p>
                <p className="text-[10px] text-slate-500">
                  {recording ? 'Tap to stop' : 'Tap mic to record'}
                </p>
                {recording && (
                  <div className="mt-2 h-1 rounded-full bg-orange-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-400 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Caption (optional)</label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Short caption…"
                maxLength={120}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>

          {displayError && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1.5">{displayError}</p>
          )}

          <button
            type="submit"
            disabled={creating || !voiceBlob}
            className="w-full py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Publishing…' : 'Publish'}
          </button>
        </form>
      </div>
    </div>
  );
}
