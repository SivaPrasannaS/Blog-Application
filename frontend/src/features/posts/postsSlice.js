import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import postsAPI from './postsAPI';

const toErrorMessage = (error) => error?.message || error?.response?.data?.message || 'Request failed';

export const fetchPostsAsync = createAsyncThunk('posts/fetchPosts', async (params = {}, { rejectWithValue }) => {
  try {
    return await postsAPI.fetchPosts(params);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const fetchDraftPostsAsync = createAsyncThunk('posts/fetchDraftPosts', async (_, { rejectWithValue }) => {
  try {
    return await postsAPI.fetchDraftPosts();
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const fetchPostByIdAsync = createAsyncThunk('posts/fetchPostById', async (id, { rejectWithValue }) => {
  try {
    return await postsAPI.fetchPostById(id);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const createPostAsync = createAsyncThunk('posts/createPost', async (payload, { rejectWithValue }) => {
  try {
    return await postsAPI.createPost(payload);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updatePostAsync = createAsyncThunk('posts/updatePost', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await postsAPI.updatePost({ id, payload });
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const deletePostAsync = createAsyncThunk('posts/deletePost', async (id, { rejectWithValue }) => {
  try {
    return await postsAPI.deletePost(id);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const publishPostAsync = createAsyncThunk('posts/publishPost', async (payload, { rejectWithValue }) => {
  try {
    return await postsAPI.publishPost(payload);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const archivePostAsync = createAsyncThunk('posts/archivePost', async (id, { rejectWithValue }) => {
  try {
    return await postsAPI.archivePost(id);
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const initialState = {
  items: [],
  draftItems: [],
  total: 0,
  page: 0,
  selected: null,
  loading: false,
  draftsLoading: false,
  error: null
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearSelectedPost: (state) => {
      state.selected = null;
    }
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchPostsAsync.pending, pending)
      .addCase(fetchPostsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content || [];
        state.total = action.payload.totalElements || 0;
        state.page = action.payload.number || 0;
      })
      .addCase(fetchPostsAsync.rejected, rejected)
      .addCase(fetchDraftPostsAsync.pending, (state) => {
        state.draftsLoading = true;
        state.error = null;
      })
      .addCase(fetchDraftPostsAsync.fulfilled, (state, action) => {
        state.draftsLoading = false;
        state.draftItems = action.payload || [];
      })
      .addCase(fetchDraftPostsAsync.rejected, (state, action) => {
        state.draftsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPostByIdAsync.pending, pending)
      .addCase(fetchPostByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchPostByIdAsync.rejected, rejected)
      .addCase(createPostAsync.pending, pending)
      .addCase(createPostAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(createPostAsync.rejected, rejected)
      .addCase(updatePostAsync.pending, pending)
      .addCase(updatePostAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
        state.draftItems = state.draftItems.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(updatePostAsync.rejected, rejected)
      .addCase(deletePostAsync.pending, pending)
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.draftItems = state.draftItems.filter((item) => item.id !== action.payload);
        if (state.selected?.id === action.payload) {
          state.selected = null;
        }
      })
      .addCase(deletePostAsync.rejected, rejected)
      .addCase(publishPostAsync.pending, pending)
      .addCase(publishPostAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;

        if (action.payload.status === 'PUBLISHED') {
          const existingPublished = state.items.some((item) => item.id === action.payload.id);
          state.items = existingPublished
            ? state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
            : [action.payload, ...state.items];
          state.draftItems = state.draftItems.filter((item) => item.id !== action.payload.id);
          if (!existingPublished) {
            state.total += 1;
          }
        } else {
          const existingDraft = state.draftItems.some((item) => item.id === action.payload.id);
          state.items = state.items.filter((item) => item.id !== action.payload.id);
          state.draftItems = existingDraft
            ? state.draftItems.map((item) => (item.id === action.payload.id ? action.payload : item))
            : [action.payload, ...state.draftItems];
          state.total = Math.max(0, state.total - 1);
        }
      })
      .addCase(publishPostAsync.rejected, rejected)
      .addCase(archivePostAsync.pending, pending)
      .addCase(archivePostAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
        state.items = state.items.filter((item) => item.id !== action.payload.id);
        state.draftItems = state.draftItems.filter((item) => item.id !== action.payload.id);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(archivePostAsync.rejected, rejected);
  }
});

export const { clearSelectedPost } = postsSlice.actions;
export default postsSlice.reducer;