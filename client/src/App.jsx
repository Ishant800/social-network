import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';

import { getMe } from './features/auth/authSlice';
import { fetchBookmarkIds } from './features/bookmarks/bookmarkSlice';
import { fetchNotifications } from './features/notifications/notificationSlice';
import logo from "./assets/logo.png";
import Home from './pages/Home';
import Layout from './components/layout/Layout';
import Explore from './pages/Explore';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import EditProfile from './pages/EditProfile';
import EditPost from './pages/EditPost';
import UserSuggestions from './pages/UserSuggestions';
import PostDetails from './pages/PostDetails';
import BlogDetails from './pages/BlogDetails';
import Bookmarks from './pages/Bookmarks';
import Notifications from './pages/Notifications';
import CreatePostPage from './pages/CreatePost';
import CreateBlog from './pages/CreateBlog';
import DiscussionRoom from './components/chats/DiscussionRoom';
import MessageSystem from './pages/Chat';
import SearchPage from './pages/Search';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAuthPage =
      location.pathname === '/login' ||
      location.pathname === '/signup' ||
      location.pathname === '/verify-email';
    if (token && !isAuthPage) {
   
      dispatch(getMe())
        .unwrap()
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setLoading(false);
        });

      // Fetch initial data for authenticated users
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
            <div className="absolute inset-[10px] flex items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-200/80">
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
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/friendsexplore" element={<ProtectedRoute><UserSuggestions /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/discussionroom/:blogId" element={<ProtectedRoute><DiscussionRoom /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/post/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
        <Route path="/blog/create" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
        <Route path="/post/edit" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
        <Route path="/post/:postId" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
        <Route path="/blog/:postId" element={<ProtectedRoute><BlogDetails /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/chats" element={<ProtectedRoute><MessageSystem /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}