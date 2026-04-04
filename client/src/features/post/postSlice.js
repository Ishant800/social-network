import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import postService from './postService';

const initialState = {
  posts: [],
  feedCursor: null,
  hasMore: true,
  isLoadingMore: false,
  likedPostIds: [],
  postDetails: null,
  blogDetails: null,
  bookmarks: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

export const createpost = createAsyncThunk('post/create', async (userData, thunkAPI) => {
  try {
    return await postService.createPost(userData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const getFeed = createAsyncThunk(
  'post/feed',
  async ({ cursor, append }, thunkAPI) => {
    try {
      const data = await postService.fetchFeed({ cursor });
      return { ...data, append: Boolean(append) };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || error.message,
      );
    }
  },
);

export const likePost = createAsyncThunk('post/like', async (postId, thunkAPI) => {
  try {
    await postService.likePost(postId);
    return postId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const unlikePost = createAsyncThunk('post/unlike', async (postId, thunkAPI) => {
  try {
    await postService.unlikePost(postId);
    return postId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const getPostDetails = createAsyncThunk('post/details', async (postId, thunkAPI) => {
  try {
    return await postService.getPostDetails(postId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const getBlogDetails = createAsyncThunk('blog/details', async (blogId, thunkAPI) => {
  try {
    return await postService.getBlogDetails(blogId);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.error || error.response?.data?.message || error.message,
    );
  }
});

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    toggleBookmark: (state, action) => {
      const post = action.payload;
      const postId = post?._id || post?.id;
      if (!postId) return;
      const exists = state.bookmarks.find((item) => (item._id || item.id) === postId);
      if (exists) {
        state.bookmarks = state.bookmarks.filter((item) => (item._id || item.id) !== postId);
      } else {
        state.bookmarks.push(post);
      }
    },
    resetFeed: (state) => {
      state.posts = [];
      state.feedCursor = null;
      state.hasMore = true;
      state.isLoadingMore = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeed.pending, (state, action) => {
        const append = action.meta.arg?.append;
        if (append) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.isError = false;
      })
      .addCase(getFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.isSuccess = true;
        const { items, nextCursor, hasMore, append } = action.payload;
        if (append) {
          state.posts = [...state.posts, ...items];
        } else {
          state.posts = items;
        }
        state.feedCursor = nextCursor || null;
        state.hasMore = Boolean(hasMore);
      })
      .addCase(getFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(createpost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createpost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.posts.unshift(action.payload);
      })
      .addCase(createpost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(likePost.fulfilled, (state, action) => {
        state.isSuccess = true;
        const postId = action.payload;
        if (!state.likedPostIds.includes(postId)) {
          state.likedPostIds.push(postId);
        }
        const target = state.posts.find((p) => (p._id || p.id) === postId);
        if (target) {
          target.likesCount = (target.likesCount || 0) + 1;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.message = action.payload;
      })

      .addCase(unlikePost.fulfilled, (state, action) => {
        state.isSuccess = true;
        const postId = action.payload;
        state.likedPostIds = state.likedPostIds.filter((id) => id !== postId);
        const target = state.posts.find((p) => (p._id || p.id) === postId);
        if (target) {
          target.likesCount = Math.max(0, (target.likesCount || 0) - 1);
        }
      })
      .addCase(unlikePost.rejected, (state, action) => {
        state.message = action.payload;
      })

      .addCase(getPostDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPostDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.postDetails = action.payload;
      })
      .addCase(getPostDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getBlogDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlogDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.blogDetails = action.payload;
      })
      .addCase(getBlogDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { toggleBookmark, resetFeed } = postSlice.actions;
export default postSlice.reducer;
