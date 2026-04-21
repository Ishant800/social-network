import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from './notificationService';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (page, thunkAPI) => {
    try {
      return await notificationService.getNotifications(page);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, thunkAPI) => {
  try {
    await notificationService.markAllRead();
    return true;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const markOneRead = createAsyncThunk('notifications/markOneRead', async (id, thunkAPI) => {
  try {
    await notificationService.markOneRead(id);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

const initialState = {
  items: [],
  unreadCount: 0,
  page: 1,
  hasMore: true,
  isLoading: false,
  isError: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotificationFromSSE: (state, action) => {
      // Unshift the new notification to the top
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    resetNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.page = 1;
      state.hasMore = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.items = action.payload.notifications;
        } else {
          // Filter out duplicates in case SSE added some while we were fetching
          const newItems = action.payload.notifications.filter(
            n => !state.items.find(existing => existing._id === n._id)
          );
          state.items = [...state.items, ...newItems];
        }
        state.unreadCount = action.payload.unreadCount;
        state.page = action.payload.page;
        state.hasMore = state.items.length < action.payload.total;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      // markAllRead
      .addCase(markAllRead.fulfilled, (state) => {
        state.items.forEach(item => { item.read = true; });
        state.unreadCount = 0;
      })
      // markOneRead
      .addCase(markOneRead.fulfilled, (state, action) => {
        const id = action.payload;
        const item = state.items.find(i => i._id === id);
        if (item && !item.read) {
          item.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { addNotificationFromSSE, resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
