import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import discussionService from './discussionService';

const initialState = {
  activeDiscussions: [],
  isLoading: false,
  isError: false,
  message: '',
};

// Fetch active discussions (last 24 hours)
export const fetchActiveDiscussions = createAsyncThunk(
  'discussions/fetchActive',
  async (_, thunkAPI) => {
    try {
      return await discussionService.getActiveDiscussions();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch discussions';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const discussionSlice = createSlice({
  name: 'discussions',
  initialState,
  reducers: {
    resetDiscussions: (state) => {
      state.activeDiscussions = [];
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveDiscussions.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchActiveDiscussions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeDiscussions = action.payload;
      })
      .addCase(fetchActiveDiscussions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetDiscussions } = discussionSlice.actions;
export default discussionSlice.reducer;
