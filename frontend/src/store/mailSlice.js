import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import * as mailApi from '../api/mailApi';

const initialState = {
  entries: [],
  currentThread: null,
  currentEntry: null,
  folder: 'INBOX',
  loading: false,
  error: null,
  unreadCount: 0,
  searchResults: [],
};

export const fetchInboxThunk = createAsyncThunk('mail/fetchInbox', async (_, thunkAPI) => {
  try {
    const response = await mailApi.fetchEntries('INBOX');
    return response.data.data || response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to load inbox');
  }
});

export const fetchFolderThunk = createAsyncThunk('mail/fetchFolder', async (folder, thunkAPI) => {
  try {
    const response = await mailApi.fetchEntries(folder);
    return { folder, payload: response.data.data || response.data };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to load folder');
  }
});

export const fetchThreadThunk = createAsyncThunk('mail/fetchThread', async (threadId, thunkAPI) => {
  try {
    const response = await mailApi.fetchThread(threadId);
    return response.data.data || response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to load thread');
  }
});

export const composeThunk = createAsyncThunk('mail/compose', async (payload, thunkAPI) => {
  try {
    const response = await mailApi.composeMail(payload);
    return response.data.data || response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to send email');
  }
});

export const markReadThunk = createAsyncThunk('mail/markRead', async ({ entryId, isRead = true }, thunkAPI) => {
  try {
    const response = await mailApi.markRead(entryId, { is_read: isRead });
    return response.data.data || response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to update mail state');
  }
});

export const moveToTrashThunk = createAsyncThunk('mail/moveToTrash', async (entryId, thunkAPI) => {
  try {
    await mailApi.moveToTrash(entryId);
    return entryId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to move mail to trash');
  }
});

export const searchThunk = createAsyncThunk('mail/search', async (query, thunkAPI) => {
  try {
    const response = await mailApi.searchMail(query);
    return response.data.data || response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Search failed');
  }
});

const getResults = (payload) => payload.results || payload;

const mailSlice = createSlice({
  name: 'mail',
  initialState,
  reducers: {
    selectEntry(state, action) {
      state.currentEntry = action.payload;
    },
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
    addNotification(state, action) {
      if (action.payload?.event === 'new_mail') {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInboxThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInboxThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = getResults(action.payload);
        state.folder = 'INBOX';
        state.unreadCount = state.entries.filter((entry) => !entry.is_read).length;
      })
      .addCase(fetchFolderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = getResults(action.payload.payload);
        state.folder = action.payload.folder;
      })
      .addCase(fetchThreadThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentThread = action.payload;
      })
      .addCase(composeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(composeThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(markReadThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        state.entries = state.entries.map((entry) => (entry.id === updated.id ? updated : entry));
      })
      .addCase(moveToTrashThunk.fulfilled, (state, action) => {
        state.entries = state.entries.filter((entry) => entry.id !== action.payload);
      })
      .addCase(searchThunk.fulfilled, (state, action) => {
        state.searchResults = getResults(action.payload);
      })
      .addMatcher((action) => action.type.startsWith('mail/') && action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectEntry, setUnreadCount, addNotification } = mailSlice.actions;
export default mailSlice.reducer;
