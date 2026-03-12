import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';

const toErrorMessage = (error) => error?.message || error?.response?.data?.message || 'Request failed';

export const fetchCategoriesAsync = createAsyncThunk('categories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/api/categories');
    return response.data;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const createCategoryAsync = createAsyncThunk('categories/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/api/categories', payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const updateCategoryAsync = createAsyncThunk('categories/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`/api/categories/${id}`, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const deleteCategoryAsync = createAsyncThunk('categories/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/api/categories/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
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
      .addCase(fetchCategoriesAsync.pending, pending)
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategoriesAsync.rejected, rejected)
      .addCase(createCategoryAsync.pending, pending)
      .addCase(createCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createCategoryAsync.rejected, rejected)
      .addCase(updateCategoryAsync.pending, pending)
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(updateCategoryAsync.rejected, rejected)
      .addCase(deleteCategoryAsync.pending, pending)
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteCategoryAsync.rejected, rejected);
  }
});

export default categoriesSlice.reducer;