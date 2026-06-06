import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import confessionService from './confessionService';

export const loadConfessions = createAsyncThunk(
  'confession/load',
  async ({ page = 1, category = 'All', append = false }, { rejectWithValue }) => {
    try {
      return { ...(await confessionService.fetchConfessions({ page, category })), append, category };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load confessions');
    }
  },
);

export const loadVoiceFeed = createAsyncThunk(
  'confession/voiceFeed',
  async ({ page = 1, category = 'All', append = false }, { rejectWithValue }) => {
    try {
      const result = await confessionService.fetchVoiceStories({ page, category });
      return { ...result, confessions: result.stories, append, category };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load voice stories');
    }
  },
);

export const loadTrending = createAsyncThunk('confession/trending', async (_, { rejectWithValue }) => {
  try {
    return await confessionService.fetchTrending();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load trending');
  }
});

export const submitConfession = createAsyncThunk(
  'confession/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await confessionService.createConfession(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to post confession');
    }
  },
);

export const loadComments = createAsyncThunk(
  'confession/comments',
  async (postId, { rejectWithValue }) => {
    try {
      const comments = await confessionService.fetchComments(postId);
      return { postId, comments };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load comments');
    }
  },
);

export const submitReply = createAsyncThunk(
  'confession/reply',
  async ({ postId, text, parentCommentId }, { rejectWithValue }) => {
    try {
      const comment = await confessionService.postReply(postId, text, parentCommentId);
      return { postId, comment };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to post reply');
    }
  },
);

const confessionSlice = createSlice({
  name: 'confession',
  initialState: {
    activeTab: 'text',
    items: [],
    voiceItems: [],
    trending: [],
    categories: ['All'],
    voiceCategories: ['All'],
    activeCategory: 'All',
    voiceCategory: 'All',
    page: 1,
    voicePage: 1,
    hasMore: true,
    voiceHasMore: true,
    loading: false,
    voiceLoading: false,
    trendingLoading: false,
    creating: false,
    error: null,
    commentsByPost: {},
    commentsLoading: {},
  },
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
      state.error = null;
    },
    setCategory(state, action) {
      state.activeCategory = action.payload;
      state.items = [];
      state.page = 1;
      state.hasMore = true;
    },
    setVoiceCategory(state, action) {
      state.voiceCategory = action.payload;
      state.voiceItems = [];
      state.voicePage = 1;
      state.voiceHasMore = true;
    },
    clearConfessionError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConfessions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadConfessions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories = payload.categories?.length ? payload.categories : state.categories;
        state.hasMore = payload.hasMore;
        state.page = payload.page;
        state.items = payload.append
          ? [...state.items, ...payload.confessions]
          : payload.confessions;
      })
      .addCase(loadConfessions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Could not load confessions.';
      })
      .addCase(loadVoiceFeed.pending, (state) => { state.voiceLoading = true; state.error = null; })
      .addCase(loadVoiceFeed.fulfilled, (state, { payload }) => {
        state.voiceLoading = false;
        state.voiceCategories = payload.categories?.length ? payload.categories : state.voiceCategories;
        state.voiceHasMore = payload.hasMore;
        state.voicePage = payload.page;
        state.voiceItems = payload.append
          ? [...state.voiceItems, ...payload.confessions]
          : payload.confessions;
      })
      .addCase(loadVoiceFeed.rejected, (state, { payload }) => {
        state.voiceLoading = false;
        state.error = payload || 'Could not load voice stories.';
      })
      .addCase(loadTrending.pending, (state) => { state.trendingLoading = true; })
      .addCase(loadTrending.fulfilled, (state, { payload }) => {
        state.trendingLoading = false;
        state.trending = payload;
      })
      .addCase(loadTrending.rejected, (state) => { state.trendingLoading = false; })
      .addCase(submitConfession.pending, (state) => { state.creating = true; })
      .addCase(submitConfession.fulfilled, (state, { payload }) => {
        state.creating = false;
        const isVoice = Boolean(payload.isVoicePost || payload.voice?.url);
        if (isVoice) {
          state.voiceItems = [payload, ...state.voiceItems];
        } else {
          state.items = [payload, ...state.items];
        }
      })
      .addCase(submitConfession.rejected, (state, { payload }) => {
        state.creating = false;
        state.error = payload;
      })
      .addCase(loadComments.pending, (state, { meta }) => {
        state.commentsLoading[meta.arg] = true;
      })
      .addCase(loadComments.fulfilled, (state, { payload }) => {
        state.commentsLoading[payload.postId] = false;
        state.commentsByPost[payload.postId] = payload.comments;
      })
      .addCase(loadComments.rejected, (state, { meta }) => {
        state.commentsLoading[meta.arg] = false;
      })
      .addCase(submitReply.fulfilled, (state, { payload }) => {
        const existing = state.commentsByPost[payload.postId] || [];
        state.commentsByPost[payload.postId] = [...existing, payload.comment];
        const textIdx = state.items.findIndex((c) => (c._id || c.id) === payload.postId);
        if (textIdx !== -1) state.items[textIdx].commentsCount = (state.items[textIdx].commentsCount || 0) + 1;
        const voiceIdx = state.voiceItems.findIndex((c) => (c._id || c.id) === payload.postId);
        if (voiceIdx !== -1) state.voiceItems[voiceIdx].commentsCount = (state.voiceItems[voiceIdx].commentsCount || 0) + 1;
      });
  },
});

export const { setActiveTab, setCategory, setVoiceCategory, clearConfessionError } = confessionSlice.actions;
export default confessionSlice.reducer;
