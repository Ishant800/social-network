import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';

import { getMe } from './features/auth/authSlice';
import { fetchBookmarkIds } from './features/bookmarks/bookmarkSlice';

import Home from './pages/Home';
import Layout from './components/layout/Layout';
import Explore from './pages/Explore';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import EditProfile from './pages/EditProfile';
import EditPost from './pages/EditPost';
import UserSuggestions from './pages/UserSuggestions';
import PostDetails from './pages/PostDetails';
import BlogDetails from './pages/BlogDetails';
import Bookmarks from './pages/Bookmarks';
import Notifications from './pages/Notifications';
import CreatePostPage from './components/posts/CreatePost';
import CreateBlog from './components/blogs/CreateBlog';
import DiscussionRoom from './components/chats/DiscussionRoom';
import MessageSystem from './pages/Messagebox';

// ✅ Protected Route
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

  // 🔍 Debug route change
  useEffect(() => {
    console.log("📍 Route:", location.pathname);
  }, [location]);

  // 🔥 Auth + initial data load
  useEffect(() => {
    const token = localStorage.getItem("token");

    console.log("🔥 App mounted");
    console.log("TOKEN:", token);

    if (token) {
      console.log("➡️ Fetching user...");

      dispatch(getMe())
        .then(() => console.log("✅ getMe success"))
        .catch((err) => {
          console.error("❌ getMe failed:", err);
          localStorage.removeItem("token"); // cleanup invalid token
        })
        .finally(() => {
          console.log("⏹️ Loading false");
          setLoading(false);
        });

      dispatch(fetchBookmarkIds()).catch((err) => {
        console.error("❌ bookmarks failed:", err);
      });

    } else {
      console.log("🚫 No token");
      setLoading(false);
    }
  }, [dispatch]); // ✅ FIXED

  // ⏳ Loading state
  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />

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
      </Routes>
    </Layout>
  );
}