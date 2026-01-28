import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const API_BASE_URL = 'http://localhost:9009/api';

export interface Email {
  id: number;
  subject: string;
  sender: string;
  recipient: string;
  date: string;
  snippet: string;
  body: string;
  labels: string[] | string;
  is_read: boolean;
  is_starred: boolean;
}

interface EmailsState {
  emails: Email[];
  loading: boolean;
  syncing: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp
}

const initialState: EmailsState = {
  emails: [],
  loading: false,
  syncing: false,
  error: null,
  lastFetched: null,
};

// Cache duration: 1 minute
const CACHE_DURATION = 60 * 1000;

const getAuthHeaders = (token: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
};

export const fetchEmails = createAsyncThunk(
  'emails/fetch',
  async (forceRefresh: boolean = false, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    
    // Check cache unless force refresh
    if (!forceRefresh) {
      const lastFetched = state.emails.lastFetched;
      if (lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
        return {
          emails: state.emails.emails,
          fromCache: true,
        };
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/emails/`, {
        headers: getAuthHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        return {
          emails: data.results || data,
          fromCache: false,
        };
      }
      return rejectWithValue('Failed to fetch emails');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const toggleStar = createAsyncThunk(
  'emails/toggleStar',
  async (emailId: number, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    
    try {
      const response = await fetch(`${API_BASE_URL}/emails/${emailId}/toggle_star/`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
      });
      if (response.ok) {
        return emailId;
      }
      return rejectWithValue('Failed to toggle star');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'emails/markAsRead',
  async ({ emailId, isRead }: { emailId: number; isRead: boolean }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    
    try {
      const response = await fetch(`${API_BASE_URL}/emails/${emailId}/mark_read/`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ is_read: isRead }),
      });
      if (response.ok) {
        return { emailId, isRead };
      }
      return rejectWithValue('Failed to mark as read');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const syncRecentEmails = createAsyncThunk(
  'emails/syncRecent',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    
    try {
      const response = await fetch(`${API_BASE_URL}/emails/sync_recent/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        // Refresh emails after sync
        await dispatch(fetchEmails(true));
        return data;
      }
      return rejectWithValue('Failed to sync emails');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

const emailsSlice = createSlice({
  name: 'emails',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch emails
      .addCase(fetchEmails.pending, (state) => {
        if (!state.lastFetched) {
          state.loading = true;
        }
      })
      .addCase(fetchEmails.fulfilled, (state, action) => {
        if (!action.payload.fromCache) {
          state.emails = action.payload.emails;
          state.lastFetched = Date.now();
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle star
      .addCase(toggleStar.fulfilled, (state, action) => {
        const email = state.emails.find(e => e.id === action.payload);
        if (email) {
          email.is_starred = !email.is_starred;
        }
      })
      .addCase(toggleStar.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const email = state.emails.find(e => e.id === action.payload.emailId);
        if (email) {
          email.is_read = action.payload.isRead;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Sync recent
      .addCase(syncRecentEmails.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncRecentEmails.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(syncRecentEmails.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = emailsSlice.actions;
export default emailsSlice.reducer;
