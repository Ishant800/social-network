import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bookmarkService from './bookmarkService';

export const fetchBookmarks = createAsyncThunk('bookmarks/fetchAll', async (_, thunkAPI) => {
  try {
    return await bookmarkService.getBookmarks();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const fetchBookmarkIds = createAsyncThunk('bookmarks/fetchIds', async (_, thunkAPI) => {
  try {
    return await bookmarkService.getBookmarkIds();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const toggleBookmark = createAsyncThunk(
  'bookmarks/toggle',
  async ({ itemId, type }, thunkAPI) => {
    try {
      const data = await bookmarkService.toggleBookmark(itemId, type);
      return { itemId, type, data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  items: [], // Full populated items
  ids: [], // Just the IDs for fast checking
  isLoading: false,
  isError: false,
  message: '',
};

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchBookmarks
      .addCase(fetchBookmarks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        // Also update ids from full list just to be safe
        state.ids = action.payload.map(i => i._id || i.id);
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // fetchBookmarkIds
      .addCase(fetchBookmarkIds.fulfilled, (state, action) => {
        state.ids = action.payload;
      })
      // toggleBookmark
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        const { itemId, data } = action.payload;
        if (data.bookmarked) {
          if (!state.ids.includes(itemId)) state.ids.push(itemId);
          // We don't fetch the full item here, we let the component re-fetch if needed
          // or just rely on the IDs for the "is bookmarked" state
        } else {
          state.ids = state.ids.filter(id => id !== itemId);
          state.items = state.items.filter(item => (item._id || item.id) !== itemId);
        }
      });
  },
});

export default bookmarkSlice.reducer;
