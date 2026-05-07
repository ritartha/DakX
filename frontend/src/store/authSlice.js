import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import * as authApi from '../api/authApi';

const initialState = {
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: Boolean(localStorage.getItem('access_token')),
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    const response = await authApi.login(payload);
    return response.data.data || response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Login failed');
  }
});

export const registerThunk = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  try {
    const response = await authApi.register(payload);
    return response.data.data || response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Registration failed');
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    await authApi.logout({ refresh });
    return true;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Logout failed');
  }
});

export const refreshTokenThunk = createAsyncThunk('auth/refresh', async (_, thunkAPI) => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    const response = await authApi.refreshToken({ refresh });
    return response.data.data || response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Token refresh failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { access, refresh, user } = action.payload;
      state.accessToken = access;
      state.refreshToken = refresh ?? state.refreshToken;
      state.user = user ?? state.user;
      state.isAuthenticated = Boolean(access);
      localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('access_token', action.payload.access);
        localStorage.setItem('refresh_token', action.payload.refresh);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.access;
        state.isAuthenticated = true;
        localStorage.setItem('access_token', action.payload.access);
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
