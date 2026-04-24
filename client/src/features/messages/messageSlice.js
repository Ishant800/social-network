import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  unreadCount: 0,
  chatList: [],
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    setChatList: (state, action) => {
      state.chatList = action.payload;
      // Calculate total unread count
      state.unreadCount = action.payload.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state, action) => {
      const count = action.payload || 1;
      state.unreadCount = Math.max(0, state.unreadCount - count);
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { 
  setUnreadCount, 
  setChatList, 
  incrementUnreadCount, 
  decrementUnreadCount, 
  resetUnreadCount 
} = messageSlice.actions;

export default messageSlice.reducer;
