import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* ======================
   TYPES
====================== */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pjNumber: string;
  role: "user" | "admin" | "gp";
  fullName?: string;
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: AsyncStatus;
  error: string | null;
  loading: boolean;
}

/* ======================
   HELPERS
====================== */
const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === "object" && err && "response" in err) {
    // @ts-expect-error – axios shape
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
};

/* ======================
   INITIAL STATE
====================== */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
  loading: false,
};

/* ======================
   THUNKS
====================== */
// Login with email & password
export const login = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", credentials);
    const user = res.data?.data?.user;
    if (!user) return rejectWithValue(res.data?.message ?? "Login failed");
    return user;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, "Login failed"));
  }
});

// Register new user
export const register = createAsyncThunk<
  User,
  {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    pjNumber: string;
    role?: string;
  },
  { rejectValue: string }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/register", userData);
    const user = res.data?.data?.user;
    if (!user) return rejectWithValue(res.data?.message ?? "Registration failed");
    return user;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, "Registration failed"));
  }
});

// Change password
export const changePassword = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string; newPasswordConfirm: string },
  { rejectValue: string }
>("auth/changePassword", async (passwordData, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/change-password", passwordData);
    if (res.data?.status !== "success") {
      return rejectWithValue(res.data?.message ?? "Password change failed");
    }
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, "Password change failed"));
  }
});

// Forgot password
export const forgotPassword = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async ({ email }, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/forgot-password", { email });
    if (res.data?.status !== "success") {
      return rejectWithValue(res.data?.message ?? "Failed to send reset email");
    }
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, "Failed to send reset email"));
  }
});

// Reset password
export const resetPassword = createAsyncThunk<
  void,
  { token: string; password: string; passwordConfirm: string },
  { rejectValue: string }
>("auth/resetPassword", async ({ token, password, passwordConfirm }, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/reset-password", { token, password, passwordConfirm });
    if (res.data?.status !== "success") {
      return rejectWithValue(res.data?.message ?? "Password reset failed");
    }
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, "Password reset failed"));
  }
});

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    // Ignore logout errors
    console.error("Logout error:", error);
  }
});

// Get current user
export const getCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      const user = res.data?.data?.user;
      if (!user) return rejectWithValue("User not found");
      return user;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, "Failed to get user"));
    }
  }
);

// Refresh session
export const refreshSession = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/refresh");
      const user = res.data?.data?.user;
      if (!user) return rejectWithValue("Session expired");
      return user;
    } catch {
      return rejectWithValue("Session expired");
    }
  }
);

/* ======================
   SLICE
====================== */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    resetAuthState(state) {
      state.error = null;
      state.status = "idle";
      state.loading = false;
    },
    logoutLocal(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload ?? "Login failed";
        state.user = null;
        state.isAuthenticated = false;
      })

      // REGISTER
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload ?? "Registration failed";
      })

      // CHANGE PASSWORD
      .addCase(changePassword.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload ?? "Password change failed";
      })

      // FORGOT PASSWORD
      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload ?? "Failed to send reset email";
      })

      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload ?? "Password reset failed";
      })

      // LOGOUT
      .addCase(logout.fulfilled, () => initialState)

      // GET CURRENT USER
      .addCase(getCurrentUser.pending, (state) => {
        state.status = "loading";
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.loading = false;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.status = "failed";
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
      })

      // REFRESH
      .addCase(refreshSession.pending, (state) => {
        state.status = "loading";
        state.loading = true;
      })
      .addCase(refreshSession.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.loading = false;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.status = "failed";
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
      });
  },
});

export const { clearAuthError, resetAuthState, logoutLocal } = authSlice.actions;
export default authSlice.reducer;