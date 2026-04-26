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
    console.log("Route:", location.pathname);
  }, [location]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    console.log("App mounted, token:", !!token);

    if (token && !isAuthPage) {
      console.log("Fetching user data...");
      
      dispatch(getMe())
        .unwrap()
        .then(() => {
          console.log("User data loaded");
          setLoading(false);
        })
        .catch((err) => {
          console.error("GetMe failed:", err);
          localStorage.removeItem("token");
          setLoading(false);
        });

      dispatch(fetchBookmarkIds()).catch((err) => {
        console.error("Bookmarks failed:", err);
      });
    } else {
      setLoading(false);
    }
  }, [dispatch, location.pathname]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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