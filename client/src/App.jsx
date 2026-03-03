// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Layout from './components/layout/Layout'
import Explore from './components/sections/Explore';
import Settings from './components/sections/Settings';
import Profile from './components/sections/Profile';
import AuthPage from './components/authentication/AuthPage';
import FriendsDiscovery from './components/sections/FriendDiscovery';
import Messages from './components/sections/Message';
import Signin from './components/authentication/signin';
import Signup from './components/authentication/signup';

export default function App() {
  return (
    <Router>
      <Layout> {/* This provides the Navbar/Sidebar to everything inside */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/settings" element={<Settings />} />
            <Route path="/friendsexplore" element={<FriendsDiscovery />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chats" element={<Messages />} />
          
          
          <Route path="/login" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Layout>
    </Router>
  );
}

