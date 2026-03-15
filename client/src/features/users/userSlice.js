import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import userService from "./userService";

const initialState = {
  suggestions: [],
  followingIds: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

export const getUserSuggestions = createAsyncThunk(
  "user/suggestions",
  async (limit, thunkAPI) => {
    try {
      return await userService.getSuggestions(limit);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Failed to load suggestions",
      );
    }
  },
);

export const followUser = createAsyncThunk(
  "user/follow",
  async (userId, thunkAPI) => {
    try {
      await userService.followUser(userId);
      return userId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Failed to follow user",
      );
    }
  },
);

export const unfollowUser = createAsyncThunk(
  "user/unfollow",
  async (userId, thunkAPI) => {
    try {
      await userService.unfollowUser(userId);
      return userId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Failed to unfollow user",
      );
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // suggestions
      .addCase(getUserSuggestions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserSuggestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.suggestions = action.payload || [];
      })
      .addCase(getUserSuggestions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // follow
      .addCase(followUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const userId = action.payload;
        if (userId && !state.followingIds.includes(userId)) {
          state.followingIds.push(userId);
        }
        state.suggestions = state.suggestions.filter(
          (user) => (user._id || user.id) !== userId,
        );
      })
      .addCase(followUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // unfollow
      .addCase(unfollowUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const userId = action.payload;
        state.followingIds = state.followingIds.filter((id) => id !== userId);
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = userSlice.actions;
export default userSlice.reducer;
