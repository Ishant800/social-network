import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { API_BASE_URL } from '@/config/env';
import {
  setChatList,
  setUserOnlineStatus,
  setOnlineUsersFromChatList,
} from '@/features/messages/messageSlice';

const PrivateChatContext = createContext(null);

export function usePrivateChat() {
  const ctx = useContext(PrivateChatContext);
  if (!ctx) {
    throw new Error('usePrivateChat must be used within PrivateChatProvider');
  }
  return ctx;
}

export function PrivateChatProvider({ children }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const userId = user?._id || user?.id;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!userId || !token) return;

    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      socket.emit('register_private_user', { userId: String(userId) });
      socket.emit('get_chat_list', { userId: String(userId) });
    };

    const onDisconnect = () => setConnected(false);

    const onChatListData = (data) => {
      dispatch(setChatList(data));
      const onlineMap = {};
      (data || []).forEach((chat) => {
        if (chat.isOnline) {
          onlineMap[String(chat.user._id)] = true;
        }
      });
      dispatch(setOnlineUsersFromChatList(onlineMap));
    };

    const onUserStatusChanged = ({ userId: statusUserId, isOnline }) => {
      dispatch(setUserOnlineStatus({
        userId: String(statusUserId),
        isOnline,
      }));
    };

    const onOnlineUsersSnapshot = ({ onlineUserIds }) => {
      (onlineUserIds || []).forEach((id) => {
        dispatch(setUserOnlineStatus({ userId: String(id), isOnline: true }));
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('chat_list_data', onChatListData);
    socket.on('user_status_changed', onUserStatusChanged);
    socket.on('online_users_snapshot', onOnlineUsersSnapshot);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chat_list_data', onChatListData);
      socket.off('user_status_changed', onUserStatusChanged);
      socket.off('online_users_snapshot', onOnlineUsersSnapshot);
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      dispatch(setOnlineUsersFromChatList({}));
    };
  }, [userId, dispatch]);

  return (
    <PrivateChatContext.Provider value={{ socketRef, connected }}>
      {children}
    </PrivateChatContext.Provider>
  );
}
