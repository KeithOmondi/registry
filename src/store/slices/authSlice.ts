import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

// ================================
// Types
// ================================
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean; // Managed to prevent UI "flicker" or loops
  error: string | null;
}

// ================================
// Initial State
// ================================
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Start as true so App.tsx can wait for refreshSession
  error: null,
};

// ================================
// Async Thunks
// ================================

/**
 * LOGIN: Hits /auth/login
 * Backend sets HttpOnly cookies (accessToken & refreshToken)
 */
export const login = createAsyncThunk<
  User,
  { pjNumber: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", credentials);
    // res.data.data.user contains { id, firstName, lastName, role }
    return res.data.data.user;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

/**
 * LOGOUT: Hits /auth/logout
 * Backend clears cookies. Frontend resets state.
 */
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.error("Logout failed on server, clearing local state anyway.");
  }
});

/**
 * REFRESH SESSION: Hits /auth/refresh
 * Used on App mount to check if valid cookies exist.
 */
export const refreshSession = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/refresh", async (_, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/refresh");
    return res.data.data?.user;
  } catch (err: any) {
    // We don't necessarily want a loud error here, 
    // just a silent rejection so loading becomes false.
    return rejectWithValue("Session expired or no cookies found");
  }
});

// ================================
// Slice
// ================================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- LOGIN ---------- */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      /* ---------- LOGOUT ---------- */
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })

      /* ---------- REFRESH SESSION ---------- */
      .addCase(refreshSession.pending, (state) => {
        state.loading = true; // Block UI while checking cookies
      })
      .addCase(refreshSession.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.loading = false; // Check complete, user not logged in
        state.user = null;
        state.isAuthenticated = false;
        // We do not set state.error here to avoid showing "Session Expired" 
        // toasts to users who just landed on the page for the first time.
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;