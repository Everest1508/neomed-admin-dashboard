import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const API_BASE_URL = 'http://localhost:9009/api';

interface GmailAccount {
  id: number;
  email: string;
  is_active: boolean;
}

interface GmailState {
  connected: boolean;
  account: GmailAccount | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp
}

const initialState: GmailState = {
  connected: false,
  account: null,
  loading: false,
  error: null,
  lastFetched: null,
};

// Cache duration: 30 seconds
const CACHE_DURATION = 30 * 1000;

const getAuthHeaders = (token: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
};

export const fetchGmailStatus = createAsyncThunk(
  'gmail/fetchStatus',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    
    // Check cache
    const lastFetched = state.gmail.lastFetched;
    if (lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
      return {
        connected: state.gmail.connected,
        account: state.gmail.account,
        fromCache: true,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/gmail/status/`, {
        headers: getAuthHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        return {
          connected: data.connected,
          account: data.account || null,
          fromCache: false,
        };
      }
      return rejectWithValue('Failed to fetch Gmail status');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const connectGmail = createAsyncThunk(
  'gmail/connect',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    
    try {
      const response = await fetch(`${API_BASE_URL}/gmail/auth-url/`, {
        headers: getAuthHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        return data.authorization_url;
      }
      return rejectWithValue('Failed to get auth URL');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const disconnectGmail = createAsyncThunk(
  'gmail/disconnect',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    
    try {
      const response = await fetch(`${API_BASE_URL}/gmail/disconnect/`, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });
      if (response.ok) {
        return true;
      }
      return rejectWithValue('Failed to disconnect');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

const gmailSlice = createSlice({
  name: 'gmail',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch status
      .addCase(fetchGmailStatus.pending, (state) => {
        if (!state.lastFetched) {
          state.loading = true;
        }
      })
      .addCase(fetchGmailStatus.fulfilled, (state, action) => {
        state.connected = action.payload.connected;
        state.account = action.payload.account;
        state.loading = false;
        if (!action.payload.fromCache) {
          state.lastFetched = Date.now();
        }
        state.error = null;
      })
      .addCase(fetchGmailStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Connect
      .addCase(connectGmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectGmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(connectGmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Disconnect
      .addCase(disconnectGmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectGmail.fulfilled, (state) => {
        state.connected = false;
        state.account = null;
        state.loading = false;
        state.lastFetched = null;
      })
      .addCase(disconnectGmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setConnected } = gmailSlice.actions;
export default gmailSlice.reducer;
