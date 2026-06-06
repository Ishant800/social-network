import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import profileService from './profileService';

const TAB_KEYS = ['Posts', 'Blogs', 'Followers', 'Following'];

const emptyTabState = () => ({
  items: [],
  loaded: false,
  loading: false,
  error: null,
});

const createProfileEntry = () => ({
  user: null,
  isFollowing: false,
  headerLoaded: false,
  headerLoading: false,
  headerError: null,
  tabs: TAB_KEYS.reduce((acc, tab) => {
    acc[tab] = emptyTabState();
    return acc;
  }, {}),
});

export const getProfileKey = (routeUserId, currentUserId) => {
  if (!routeUserId || String(routeUserId) === String(currentUserId)) {
    return 'me';
  }
  return String(routeUserId);
};

export const loadProfileHeader = createAsyncThunk(
  'profile/loadHeader',
  async ({ profileKey, userId }, thunkAPI) => {
    try {
      return await profileService.fetchProfileHeader(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to load profile',
      );
    }
  },
  {
    condition: ({ profileKey }, { getState }) => {
      const entry = getState().profile.profiles[profileKey];
      if (entry?.headerLoaded || entry?.headerLoading) return false;
      return true;
    },
  },
);

export const loadProfileTab = createAsyncThunk(
  'profile/loadTab',
  async ({ profileKey, userId, tab }, thunkAPI) => {
    try {
      let items = [];

      switch (tab) {
        case 'Posts':
          items = await profileService.fetchProfilePosts(userId);
          break;
        case 'Blogs':
          items = await profileService.fetchProfileBlogs(userId);
          break;
        case 'Followers':
          items = await profileService.fetchProfileFollowers(userId);
          break;
        case 'Following':
          items = await profileService.fetchProfileFollowing(userId);
          break;
        default:
          throw new Error('Unknown profile tab');
      }

      return { tab, items };
    } catch (error) {
      return thunkAPI.rejectWithValue({
        tab,
        message: error.response?.data?.message || error.message || 'Failed to load data',
      });
    }
  },
  {
    condition: ({ profileKey, tab }, { getState }) => {
      const entry = getState().profile.profiles[profileKey];
      const tabState = entry?.tabs?.[tab];
      if (tabState?.loaded || tabState?.loading) return false;
      return true;
    },
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    activeProfileKey: null,
    profiles: {},
  },
  reducers: {
    setActiveProfileKey: (state, action) => {
      state.activeProfileKey = action.payload;
      if (!state.profiles[action.payload]) {
        state.profiles[action.payload] = createProfileEntry();
      }
    },
    setProfileFollowing: (state, action) => {
      const { profileKey, isFollowing } = action.payload;
      const entry = state.profiles[profileKey];
      if (entry) entry.isFollowing = isFollowing;
    },
    invalidateProfileTab: (state, action) => {
      const { profileKey, tab } = action.payload;
      const entry = state.profiles[profileKey];
      if (entry?.tabs?.[tab]) {
        entry.tabs[tab] = emptyTabState();
      }
    },
    clearProfileCache: (state) => {
      state.profiles = {};
      state.activeProfileKey = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProfileHeader.pending, (state, action) => {
        const { profileKey } = action.meta.arg;
        if (!state.profiles[profileKey]) {
          state.profiles[profileKey] = createProfileEntry();
        }
        state.profiles[profileKey].headerLoading = true;
        state.profiles[profileKey].headerError = null;
      })
      .addCase(loadProfileHeader.fulfilled, (state, action) => {
        const { profileKey } = action.meta.arg;
        const entry = state.profiles[profileKey];
        if (!entry) return;

        entry.headerLoading = false;
        entry.headerLoaded = true;
        entry.user = action.payload.user;
        entry.isFollowing = action.payload.isFollowing;

        if (action.payload.prefetchedPosts) {
          entry.tabs.Posts = {
            items: action.payload.prefetchedPosts,
            loaded: true,
            loading: false,
            error: null,
          };
        }
        if (action.payload.prefetchedBlogs) {
          entry.tabs.Blogs = {
            items: action.payload.prefetchedBlogs,
            loaded: true,
            loading: false,
            error: null,
          };
        }
      })
      .addCase(loadProfileHeader.rejected, (state, action) => {
        const { profileKey } = action.meta.arg;
        const entry = state.profiles[profileKey];
        if (!entry) return;
        entry.headerLoading = false;
        entry.headerError = action.payload;
      })
      .addCase(loadProfileTab.pending, (state, action) => {
        const { profileKey, tab } = action.meta.arg;
        if (!state.profiles[profileKey]) {
          state.profiles[profileKey] = createProfileEntry();
        }
        state.profiles[profileKey].tabs[tab].loading = true;
        state.profiles[profileKey].tabs[tab].error = null;
      })
      .addCase(loadProfileTab.fulfilled, (state, action) => {
        const { profileKey } = action.meta.arg;
        const { tab, items } = action.payload;
        const tabState = state.profiles[profileKey]?.tabs?.[tab];
        if (!tabState) return;
        tabState.loading = false;
        tabState.loaded = true;
        tabState.items = items;
      })
      .addCase(loadProfileTab.rejected, (state, action) => {
        const { profileKey, tab } = action.meta.arg;
        const tabState = state.profiles[profileKey]?.tabs?.[tab];
        if (!tabState) return;
        tabState.loading = false;
        tabState.error = action.payload?.message || 'Failed to load';
      });
  },
});

export const {
  setActiveProfileKey,
  setProfileFollowing,
  invalidateProfileTab,
  clearProfileCache,
} = profileSlice.actions;

export default profileSlice.reducer;
