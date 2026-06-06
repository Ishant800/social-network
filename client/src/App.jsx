import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';

import { getMe } from '@/features/auth/authSlice';
import { fetchBookmarkIds } from '@/features/bookmarks/bookmarkSlice';
import { fetchNotifications } from '@/features/notifications/notificationSlice';
import logo from '@/assets/logo.png';
import Layout from '@/components/layout/Layout';
import AppRoutes from '@/app/routes/AppRoutes';

export default function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAuthPage =
      location.pathname === '/login' ||
      location.pathname === '/signup';

    if (token && !isAuthPage) {
      dispatch(getMe())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });

      dispatch(fetchBookmarkIds());
      dispatch(fetchNotifications(1));
    } else {
      setLoading(false);
    }
  }, [dispatch, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-teal-50/40 via-white to-slate-50 px-6">
        <div className="animate-fade-up text-center">
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div
              className="loader-ring absolute inset-0 rounded-full border-2 border-teal-100 border-t-teal-600"
              aria-hidden
            />
            <div className="absolute inset-[10px] flex items-center justify-center">
              <img src={logo} alt="" className="h-10 w-auto max-w-[3rem] object-contain" />
            </div>
          </div>
          <p className="font-display text-sm font-semibold text-slate-800">Loading your space</p>
          <p className="mt-1 text-xs text-slate-500">Fetching profile and notifications…</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}
