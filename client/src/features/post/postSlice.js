import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import postService from './postService';

const initialState = {
  posts: [],
  currentPage: 1,
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
  // Cache timestamps per tab - null means never fetched
  lastFetched: {
    posts: null,
    articles: null,
  },
  activeFeedType: 'posts',
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
  async ({ feedType = 'posts', page = 1, append = false, force = false }, thunkAPI) => {
    try {
      const state = thunkAPI.getState().posts;
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

      
      if (!force && !append && page === 1) {
        const lastFetched = state.lastFetched[feedType];
        const isSameTab = state.activeFeedType === feedType;
        const isFresh = lastFetched && (Date.now() - lastFetched) < CACHE_TTL;
        const hasPosts = state.posts.length > 0;

        if (isSameTab && isFresh && hasPosts) {
          return thunkAPI.rejectWithValue('CACHE_HIT');
        }
      }

      const data = await postService.fetchFeed({ feedType, page });
      return { ...data, append: Boolean(append), feedType };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || error.message,
      );
    }
  },
);

export const likePost = createAsyncThunk('post/like', async (postId, thunkAPI) => {
  try {
    return await postService.likePost(postId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const unlikePost = createAsyncThunk('post/unlike', async (postId, thunkAPI) => {
  try {
    return await postService.unlikePost(postId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const likeBlog = createAsyncThunk('post/likeBlog', async (blogId, thunkAPI) => {
  try {
    return await postService.likeBlog(blogId);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const unlikeBlog = createAsyncThunk('post/unlikeBlog', async (blogId, thunkAPI) => {
  try {
    return await postService.unlikeBlog(blogId);
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

export const updatePost = createAsyncThunk('post/update', async ({ postId, postData }, thunkAPI) => {
  try {
    return await postService.updatePost(postId, postData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
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
      state.currentPage = 1;
      state.hasMore = true;
      state.isLoadingMore = false;
      // Clear cache so next fetch is forced
      state.lastFetched = { posts: null, articles: null };
    },
    setLikedPosts: (state, action) => {
      state.likedPostIds = action.payload;
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
        const { items, page, hasMore, append, feedType } = action.payload;
        if (append) {
          state.posts = [...state.posts, ...items];
        } else {
          state.posts = items;
          // Store fetch timestamp and active tab
          state.lastFetched[feedType] = Date.now();
          state.activeFeedType = feedType;
        }
        state.currentPage = page || 1;
        state.hasMore = Boolean(hasMore);
      })
      .addCase(getFeed.rejected, (state, action) => {
        // CACHE_HIT is not an error - silently skip
        if (action.payload === 'CACHE_HIT') {
          state.isLoading = false;
          state.isLoadingMore = false;
          return;
        }
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
        const { postId, likesCount, isLiked } = action.payload;
        
        // Update liked posts array
        if (isLiked && !state.likedPostIds.includes(postId)) {
          state.likedPostIds.push(postId);
        }
        
        // Update post in feed
        const target = state.posts.find((p) => (p._id || p.id) === postId);
        if (target) {
          target.likesCount = likesCount;
          if (target.stats) {
            target.stats.likes = likesCount;
          }
        }
        
        // Update post details if loaded
        if (state.postDetails && (state.postDetails._id || state.postDetails.id) === postId) {
          state.postDetails.likesCount = likesCount;
          if (state.postDetails.stats) {
            state.postDetails.stats.likes = likesCount;
          }
        }
        
        // Update blog details if loaded
        if (state.blogDetails && (state.blogDetails._id || state.blogDetails.id) === postId) {
          state.blogDetails.likesCount = likesCount;
          if (state.blogDetails.stats) {
            state.blogDetails.stats.likes = likesCount;
          }
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.message = action.payload;
      })

      .addCase(unlikePost.fulfilled, (state, action) => {
        const { postId, likesCount, isLiked } = action.payload;
        
        // Update liked posts array
        if (!isLiked) {
          state.likedPostIds = state.likedPostIds.filter((id) => id !== postId);
        }
        
        // Update post in feed
        const target = state.posts.find((p) => (p._id || p.id) === postId);
        if (target) {
          target.likesCount = likesCount;
          if (target.stats) {
            target.stats.likes = likesCount;
          }
        }
        
        // Update post details if loaded
        if (state.postDetails && (state.postDetails._id || state.postDetails.id) === postId) {
          state.postDetails.likesCount = likesCount;
          if (state.postDetails.stats) {
            state.postDetails.stats.likes = likesCount;
          }
        }
        
        // Update blog details if loaded
        if (state.blogDetails && (state.blogDetails._id || state.blogDetails.id) === postId) {
          state.blogDetails.likesCount = likesCount;
          if (state.blogDetails.stats) {
            state.blogDetails.stats.likes = likesCount;
          }
        }
      })
      .addCase(unlikePost.rejected, (state, action) => {
        state.message = action.payload;
      })

      // Blog likes
      .addCase(likeBlog.fulfilled, (state, action) => {
        const { postId, likesCount, isLiked } = action.payload;
        
        if (isLiked && !state.likedPostIds.includes(postId)) {
          state.likedPostIds.push(postId);
        }
        
        const target = state.posts.find((p) => (p._id || p.id) === postId);
        if (target) {
          target.likesCount = likesCount;
          if (target.stats) {
            target.stats.likes = likesCount;
          }
        }
        
        if (state.blogDetails && (state.blogDetails._id || state.blogDetails.id) === postId) {
          state.blogDetails.likesCount = likesCount;
          if (state.blogDetails.stats) {
            state.blogDetails.stats.likes = likesCount;
          }
        }
      })
      .addCase(likeBlog.rejected, (state, action) => {
        state.message = action.payload;
      })

      .addCase(unlikeBlog.fulfilled, (state, action) => {
        const { postId, likesCount, isLiked } = action.payload;
        
        if (!isLiked) {
          state.likedPostIds = state.likedPostIds.filter((id) => id !== postId);
        }
        
        const target = state.posts.find((p) => (p._id || p.id) === postId);
        if (target) {
          target.likesCount = likesCount;
          if (target.stats) {
            target.stats.likes = likesCount;
          }
        }
        
        if (state.blogDetails && (state.blogDetails._id || state.blogDetails.id) === postId) {
          state.blogDetails.likesCount = likesCount;
          if (state.blogDetails.stats) {
            state.blogDetails.stats.likes = likesCount;
          }
        }
      })
      .addCase(unlikeBlog.rejected, (state, action) => {
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
      })
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updatedPost = action.payload;
        const postId = updatedPost._id || updatedPost.id;
        
        // Update in posts array
        const index = state.posts.findIndex(p => (p._id || p.id) === postId);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
        
        // Update postDetails if it's the same post
        if (state.postDetails && (state.postDetails._id || state.postDetails.id) === postId) {
          state.postDetails = updatedPost;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { toggleBookmark, resetFeed, setLikedPosts } = postSlice.actions;
export default postSlice.reducer;
