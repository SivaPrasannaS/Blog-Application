import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authAPI from './authAPI';
import tokenService from '../../services/tokenService';

const USER_KEY = 'cms_user';

const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

const persistAuth = (payload) => {
  tokenService.setTokens(payload.token, payload.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
};

const clearAuthStorage = () => {
  tokenService.clearTokens();
  localStorage.removeItem(USER_KEY);
};

const toErrorMessage = (error) => error?.message || error?.response?.data?.message || 'Request failed';

export const loginAsync = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authAPI.login(credentials);
    persistAuth(response);
    return response;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const registerAsync = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await authAPI.register(payload);
    persistAuth(response);
    return response;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const refreshTokenAsync = createAsyncThunk('auth/refreshToken', async (_, { getState, rejectWithValue }) => {
  try {
    const refreshToken = getState().auth.refreshToken || tokenService.getRefreshToken();
    const response = await authAPI.refresh(refreshToken);
    tokenService.updateAccessToken(response.token);
    return response.token;
  } catch (error) {
    clearAuthStorage();
    return rejectWithValue(toErrorMessage(error));
  }
});

const initialState = {
  user: getStoredUser(),
  token: tokenService.getAccessToken(),
  refreshToken: tokenService.getRefreshToken(),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      clearAuthStorage();
    },
    updateAccessToken: (state, action) => {
      state.token = action.payload;
      tokenService.updateAccessToken(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshTokenAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload;
      });
  }
});

export const { logout, updateAccessToken } = authSlice.actions;
export const selectCurrentUser = (state) => state.auth.user;
const EMPTY_ROLES = [];

export const selectRoles = (state) => state.auth.user?.roles || EMPTY_ROLES;
export const selectToken = (state) => state.auth.token;
export const selectRefreshToken = (state) => state.auth.refreshToken;

export default authSlice.reducer;