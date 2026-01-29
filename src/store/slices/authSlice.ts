import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, 
  error: null,
};

export const login = createAsyncThunk<
  User,
  { pjNumber: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", credentials);
    if (res.data?.status === "success" && res.data?.data?.user) {
      return res.data.data.user;
    }
    return rejectWithValue("Invalid response format");
  } catch (err: any) {
    // Correctly grab the message sent by your refactored controller
    const errorMessage = err.response?.data?.message || "Login failed";
    return rejectWithValue(errorMessage);
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  try { await api.post("/auth/logout"); } catch (err) { /* silent fail */ }
});

export const refreshSession = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/refresh", 
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/refresh");
      return res.data.data?.user;
    } catch (err) { return rejectWithValue("Expired"); }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null; // Auto-clears error when login starts
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        // GUARANTEE a string here to prevent component crashes
        state.error = action.payload ?? "Invalid credentials";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(refreshSession.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;