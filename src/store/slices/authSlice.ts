import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* ======================
   TYPES
====================== */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: AsyncStatus;
  error: string | null;
  otpSent: boolean;
  pjNumber: string;
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
  otpSent: false,
  pjNumber: sessionStorage.getItem("pjNumber") ?? "",
};

/* ======================
   THUNKS
====================== */
// Send OTP
export const login = createAsyncThunk<
  void,
  { pjNumber: string; password?: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", credentials);
    if (res.data?.status === "success") return;
    return rejectWithValue(res.data?.message ?? "Failed to send OTP");
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, "Login failed"));
  }
});

// Verify OTP
export const verifyOtp = createAsyncThunk<
  User,
  { pjNumber: string; otp: string },
  { rejectValue: string }
>("auth/verifyOtp", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/verify-otp", payload);
    const user = res.data?.data?.user;
    if (!user) return rejectWithValue("Invalid OTP");
    return user;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err, "OTP verification failed"));
  }
});

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    sessionStorage.removeItem("pjNumber");
  }
});

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
    resetOtpState(state) {
      state.otpSent = false;
      state.pjNumber = "";
      sessionStorage.removeItem("pjNumber");
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.otpSent = false;
        state.pjNumber = action.meta.arg.pjNumber;
        sessionStorage.setItem("pjNumber", action.meta.arg.pjNumber);
      })
      .addCase(login.fulfilled, (state) => {
        state.status = "succeeded";
        state.otpSent = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Login failed";
      })

      // VERIFY OTP
      .addCase(verifyOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.otpSent = false;
        state.pjNumber = "";
        sessionStorage.removeItem("pjNumber");
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "OTP verification failed";
      })

      // LOGOUT
      .addCase(logout.fulfilled, () => initialState)

      // REFRESH
      .addCase(refreshSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refreshSession.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
      })
      .addCase(refreshSession.rejected, (state) => {
        state.status = "failed";
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearAuthError, resetOtpState } = authSlice.actions;
export default authSlice.reducer;
