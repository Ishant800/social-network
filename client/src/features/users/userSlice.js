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
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to load suggestions",
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
        state.isError = false;
        state.message = "";
      })
      .addCase(getUserSuggestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.suggestions = Array.isArray(action.payload) ? action.payload : [];
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
        const userId = String(action.payload || "");
        if (userId && !state.followingIds.some((id) => String(id) === userId)) {
          state.followingIds.push(userId);
        }
        state.suggestions = state.suggestions.filter(
          (u) => String(u._id || u.id) !== userId,
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
        const userId = String(action.payload || "");
        state.followingIds = state.followingIds.filter((id) => String(id) !== userId);
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
