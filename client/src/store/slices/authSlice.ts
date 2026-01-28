import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:9009/api';
const TOKEN_KEY = 'auth_token';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  loading: true,
  isAuthenticated: false,
};

// Async thunks
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/current-user/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    throw new Error('Invalid token');
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/sign-in/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      return { token: data.token, user: data.user };
    }
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ username, email, password }: { username: string; email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/sign-up/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      return { token: data.token, user: data.user };
    }
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (token: string | null) => {
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/sign-out/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        localStorage.removeItem(TOKEN_KEY);
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(signup.rejected, (state) => {
        state.loading = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setLoading } = authSlice.actions;
export default authSlice.reducer;
