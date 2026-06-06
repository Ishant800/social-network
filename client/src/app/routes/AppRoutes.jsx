import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import Home from '@/pages/feed/Home';
import Explore from '@/pages/feed/Explore';
import Settings from '@/pages/settings/Settings';
import Profile from '@/pages/profile/Profile';
import EditProfile from '@/pages/profile/EditProfile';
import EditPost from '@/pages/posts/EditPost';
import UserSuggestions from '@/pages/social/UserSuggestions';
import PostDetails from '@/pages/posts/PostDetails';
import BlogDetails from '@/pages/blogs/BlogDetails';
import Bookmarks from '@/pages/saved/Bookmarks';
import Notifications from '@/pages/notifications/Notifications';
import CreatePostPage from '@/pages/posts/CreatePost';
import CreateBlog from '@/pages/blogs/CreateBlog';
import DiscussionRoom from '@/pages/chat/DiscussionRoom';
import Discussions from '@/pages/chat/Discussions';
import MessageSystem from '@/pages/chat/Chat';
import SearchResults from '@/pages/social/SearchResults';
import Confessions from '@/pages/social/Confessions';
import VoiceStories from '@/pages/VoiceStories';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/friendsexplore" element={<ProtectedRoute><UserSuggestions /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/discussions" element={<ProtectedRoute><Discussions /></ProtectedRoute>} />
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
      <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
      <Route path="/confessions" element={<ProtectedRoute><Confessions /></ProtectedRoute>} />
      <Route path="/voice-stories" element={<ProtectedRoute><VoiceStories /></ProtectedRoute>} />
    </Routes>
  );
}
