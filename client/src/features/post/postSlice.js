import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import postService from './postService';
import { comment } from '@/features/comments/commentSlice';

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
    blogs: null,
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

      const data = await postService.fetchFeed({ feedType, page, limit: 20 });
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

export const reactToPost = createAsyncThunk('post/react', async ({ postId, reactionType }, thunkAPI) => {
  try {
    return await postService.reactToPost(postId, reactionType);
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
      state.lastFetched = { posts: null, blogs: null };
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
        state.isError = false;
        state.message = '';
        
        const { items, page, hasMore, append, feedType } = action.payload;
        
        if (append) {
          // Append new items avoiding duplicates
          const existingIds = new Set(state.posts.map(p => p._id || p.id));
          const newItems = items.filter(item => !existingIds.has(item._id || item.id));
          state.posts = [...state.posts, ...newItems];
        } else {
          state.posts = items || [];
          state.lastFetched[feedType] = Date.now();
          state.activeFeedType = feedType;
        }
        
        state.currentPage = page || 1;
        state.hasMore = Boolean(hasMore);

        // Sync likedPostIds from feed data
        const likedIds = (items || [])
          .filter(p => p.userReaction || p.isLiked)
          .map(p => p._id || p.id);
        
        if (likedIds.length > 0) {
          const existing = new Set(state.likedPostIds);
          likedIds.forEach(id => existing.add(id));
          state.likedPostIds = Array.from(existing);
        }
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
        const { postId, likesCount, isLiked, stats } = action.payload;
        
        // Update liked posts array
        if (isLiked && !state.likedPostIds.includes(postId)) {
          state.likedPostIds.push(postId);
        }
        
        // Update post in feed
        const target = state.posts.find((p) => String(p._id || p.id) === String(postId));
        if (target) {
          target.likesCount = likesCount;
          target.isLiked = isLiked;
          if (target.stats && stats) {
            target.stats = { ...target.stats, ...stats };
          } else if (target.stats) {
            target.stats.likes = likesCount;
          }
        }
        
        // Update post details if loaded
        if (state.postDetails && String(state.postDetails._id || state.postDetails.id) === String(postId)) {
          state.postDetails.likesCount = likesCount;
          state.postDetails.isLiked = isLiked;
          if (state.postDetails.stats && stats) {
            state.postDetails.stats = { ...state.postDetails.stats, ...stats };
          } else if (state.postDetails.stats) {
            state.postDetails.stats.likes = likesCount;
          }
        }
        
        // Update blog details if loaded
        if (state.blogDetails && String(state.blogDetails._id || state.blogDetails.id) === String(postId)) {
          state.blogDetails.likesCount = likesCount;
          state.blogDetails.isLiked = isLiked;
          if (state.blogDetails.stats && stats) {
            state.blogDetails.stats = { ...state.blogDetails.stats, ...stats };
          } else if (state.blogDetails.stats) {
            state.blogDetails.stats.likes = likesCount;
          }
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.message = action.payload;
      })

      .addCase(unlikePost.fulfilled, (state, action) => {
        const { postId, likesCount, isLiked, stats } = action.payload;
        
        // Update liked posts array
        if (!isLiked) {
          state.likedPostIds = state.likedPostIds.filter((id) => String(id) !== String(postId));
        }
        
        // Update post in feed
        const target = state.posts.find((p) => String(p._id || p.id) === String(postId));
        if (target) {
          target.likesCount = likesCount;
          target.isLiked = isLiked;
          if (target.stats && stats) {
            target.stats = { ...target.stats, ...stats };
          } else if (target.stats) {
            target.stats.likes = likesCount;
          }
        }
        
        // Update post details if loaded
        if (state.postDetails && String(state.postDetails._id || state.postDetails.id) === String(postId)) {
          state.postDetails.likesCount = likesCount;
          state.postDetails.isLiked = isLiked;
          if (state.postDetails.stats && stats) {
            state.postDetails.stats = { ...state.postDetails.stats, ...stats };
          } else if (state.postDetails.stats) {
            state.postDetails.stats.likes = likesCount;
          }
        }
        
        // Update blog details if loaded
        if (state.blogDetails && String(state.blogDetails._id || state.blogDetails.id) === String(postId)) {
          state.blogDetails.likesCount = likesCount;
          state.blogDetails.isLiked = isLiked;
          if (state.blogDetails.stats && stats) {
            state.blogDetails.stats = { ...state.blogDetails.stats, ...stats };
          } else if (state.blogDetails.stats) {
            state.blogDetails.stats.likes = likesCount;
          }
        }
      })
      .addCase(unlikePost.rejected, (state, action) => {
        state.message = action.payload;
      })

      // Reactions
      .addCase(reactToPost.fulfilled, (state, action) => {
        const { postId, likesCount, reactions, userReaction } = action.payload;

        const updatePost = (p) => {
          if (String(p._id || p.id) === String(postId)) {
            p.likesCount = likesCount;
            p.reactions = reactions;
            p.userReaction = userReaction;
            p.isLiked = Boolean(userReaction);
          }
        };

        state.posts.forEach(updatePost);
        if (state.postDetails) updatePost(state.postDetails);

        // Update likedPostIds
        if (userReaction) {
          if (!state.likedPostIds.some(id => String(id) === String(postId))) {
            state.likedPostIds.push(postId);
          }
        } else {
          state.likedPostIds = state.likedPostIds.filter(id => String(id) !== String(postId));
        }
      })

      // Blog likes
      .addCase(likeBlog.fulfilled, (state, action) => {
        const { postId, likesCount, isLiked, stats } = action.payload;
        
        if (isLiked && !state.likedPostIds.some(id => String(id) === String(postId))) {
          state.likedPostIds.push(postId);
        }
        
        const target = state.posts.find((p) => String(p._id || p.id) === String(postId));
        if (target) {
          target.likesCount = likesCount;
          target.isLiked = isLiked;
          if (target.stats && stats) {
            target.stats = { ...target.stats, ...stats };
          } else if (target.stats) {
            target.stats.likes = likesCount;
          }
        }
        
        if (state.blogDetails && String(state.blogDetails._id || state.blogDetails.id) === String(postId)) {
          state.blogDetails.likesCount = likesCount;
          state.blogDetails.isLiked = isLiked;
          if (state.blogDetails.stats && stats) {
            state.blogDetails.stats = { ...state.blogDetails.stats, ...stats };
          } else if (state.blogDetails.stats) {
            state.blogDetails.stats.likes = likesCount;
          }
        }
      })
      .addCase(likeBlog.rejected, (state, action) => {
        state.message = action.payload;
      })

      .addCase(unlikeBlog.fulfilled, (state, action) => {
        const { postId, likesCount, isLiked, stats } = action.payload;
        
        if (!isLiked) {
          state.likedPostIds = state.likedPostIds.filter((id) => String(id) !== String(postId));
        }
        
        const target = state.posts.find((p) => String(p._id || p.id) === String(postId));
        if (target) {
          target.likesCount = likesCount;
          target.isLiked = isLiked;
          if (target.stats && stats) {
            target.stats = { ...target.stats, ...stats };
          } else if (target.stats) {
            target.stats.likes = likesCount;
          }
        }
        
        if (state.blogDetails && String(state.blogDetails._id || state.blogDetails.id) === String(postId)) {
          state.blogDetails.likesCount = likesCount;
          state.blogDetails.isLiked = isLiked;
          if (state.blogDetails.stats && stats) {
            state.blogDetails.stats = { ...state.blogDetails.stats, ...stats };
          } else if (state.blogDetails.stats) {
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
        const blogId = action.payload?._id || action.payload?.id;
        if (blogId && action.payload?.isLiked) {
          if (!state.likedPostIds.some((id) => String(id) === String(blogId))) {
            state.likedPostIds.push(blogId);
          }
        }
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
        state.isError = false;
        state.message = '';
        
        const updatedPost = action.payload;
        const postId = updatedPost._id || updatedPost.id;
        
        // Update in posts array
        const index = state.posts.findIndex(p => String(p._id || p.id) === String(postId));
        if (index !== -1) {
          state.posts[index] = { ...state.posts[index], ...updatedPost };
        }
        
        // Update postDetails if it's the same post
        if (state.postDetails && String(state.postDetails._id || state.postDetails.id) === String(postId)) {
          state.postDetails = updatedPost;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Listen to comment creation to update comment counts
      .addCase(comment.fulfilled, (state, action) => {
        const payload = action.payload;
        const postId = payload?.postId || payload?.comment?.target?.id;
        const newCommentsCount = payload?.commentsCount;
        
        if (!postId) return;
        
        // Update comment count in posts feed
        const target = state.posts.find((p) => String(p._id || p.id) === String(postId));
        if (target) {
          if (target.stats) {
            target.stats.comments = newCommentsCount !== undefined ? newCommentsCount : (target.stats.comments || 0) + 1;
          }
        }
        
        // Update comment count in postDetails
        if (state.postDetails && String(state.postDetails._id || state.postDetails.id) === String(postId)) {
          if (state.postDetails.stats) {
            state.postDetails.stats.comments = newCommentsCount !== undefined ? newCommentsCount : (state.postDetails.stats.comments || 0) + 1;
          }
        }
        
        // Update comment count in blogDetails
        if (state.blogDetails && String(state.blogDetails._id || state.blogDetails.id) === String(postId)) {
          if (state.blogDetails.stats) {
            state.blogDetails.stats.comments = newCommentsCount !== undefined ? newCommentsCount : (state.blogDetails.stats.comments || 0) + 1;
          }
        }
      });
  },
});

export const { toggleBookmark, resetFeed, setLikedPosts } = postSlice.actions;
export default postSlice.reducer;
