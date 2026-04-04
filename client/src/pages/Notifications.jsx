import { Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function Notifications() {
  const token = useSelector((s) => s.auth.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl bg-white px-6 py-12 text-center shadow-md shadow-slate-900/5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
        <Bell className="h-8 w-8" strokeWidth={1.75} />
      </div>
      <h1 className="mt-4 font-display text-lg font-bold text-slate-900">Notifications</h1>
      <p className="mt-2 max-w-xs text-sm text-slate-600">
        Push and in-app alerts will show here when you connect a notification service.
      </p>
    </div>
  );
}
