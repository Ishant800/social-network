import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Messages() {
  return (
    <div className="flex min-h-[calc(100dvh-12rem)] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <MessageCircle className="h-8 w-8" strokeWidth={1.75} />
      </div>
      <h1 className="mt-6 font-display text-xl font-bold text-slate-900">Messages</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
        Direct messaging is not enabled yet. Use blog discussion rooms to chat around articles, or check back after
        messaging is connected to the server.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
      >
        Back to home
      </Link>
    </div>
  );
}
