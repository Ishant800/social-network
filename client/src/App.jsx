// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  const dispatch = useDispatch();
   const [loading,setLoading] = useState(true)
  const [token , setToken] = useState(()=> localStorage.getItem("token"))

  useEffect(() => {
    if (token) {
      dispatch(getMe())
      .catch(err => {
        console.error('GetMe failed:', err);
      })
      .finally(()=> setLoading(false));
      dispatch(fetchBookmarkIds()).catch(err => {
        console.error('Fetch bookmarks failed:', err);
      });
    } else{
      setLoading(false)
    }
  }, [dispatch, token]);

  if(loading) return <div>Loading....</div>
  return (
    <Router>
      <Layout> 
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/" element={
            <ProtectedRoute>
             <Home />
             </ProtectedRoute>} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/friendsexplore" element={<UserSuggestions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/discussionroom/:blogId" element={<DiscussionRoom />} />
          <Route path="/profile/edit" element={<EditProfile/>} />
          <Route path="/post/create" element={<CreatePostPage/>} />
          <Route path="/blog/create" element={<CreateBlog/>} />
          <Route path="/post/edit" element={<EditPost/>} />
          <Route path="/post/:postId" element={<PostDetails/>} />
          <Route path="/blog/:postId" element={<BlogDetails/>} />
          <Route path="/bookmarks" element={<Bookmarks/>} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/chats" element={<MessageSystem />} />
          
        </Routes>
      </Layout>
    </Router>
  );
}
