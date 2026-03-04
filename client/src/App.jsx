// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Layout from './components/layout/Layout'
import Explore from './components/sections/Explore';
import Settings from './components/sections/Settings';
import Profile from './components/sections/Profile';
import FriendsDiscovery from './components/sections/FriendDiscovery';
import Messages from './components/sections/Message';
import Signin from './components/authentication/signin';
import Signup from './components/authentication/signup';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getMe } from './features/auth/authSlice';

export default function App() {

  const dispatch = useDispatch();
  const token = localStorage.getItem("token")

  useEffect(()=>{
    if(token){
      dispatch(getMe());
    }
  },[dispatch,token]);


  return (
    <Router>
      <Layout> 
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

