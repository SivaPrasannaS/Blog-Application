import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';

const toErrorMessage = (error) => error?.message || error?.response?.data?.message || 'Request failed';

export const fetchUsersAsync = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/api/admin/users');
    return response.data;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updateUserRoleAsync = createAsyncThunk('users/updateRole', async ({ id, role }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/api/admin/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const deactivateUserAsync = createAsyncThunk('users/deactivate', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/users/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const activateUserAsync = createAsyncThunk('users/activate', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/api/admin/users/${id}/activate`, {});
    return response.data;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
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
      .addCase(fetchUsersAsync.pending, pending)
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsersAsync.rejected, rejected)
      .addCase(updateUserRoleAsync.pending, pending)
      .addCase(updateUserRoleAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(updateUserRoleAsync.rejected, rejected)
      .addCase(deactivateUserAsync.pending, pending)
      .addCase(deactivateUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(deactivateUserAsync.rejected, rejected)
      .addCase(activateUserAsync.pending, pending)
      .addCase(activateUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(activateUserAsync.rejected, rejected);
  }
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;