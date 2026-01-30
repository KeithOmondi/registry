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
  otpSent: boolean; // Track if OTP was sent
  pjNumber: string; // Persist PJ number for OTP verification
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  otpSent: false,
  pjNumber: "",
};

// ==========================
// LOGIN (Send OTP)
// ==========================
export const login = createAsyncThunk<
  void, // login itself doesn’t return user yet
  { pjNumber: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", credentials);
    if (res.data?.status === "success") {
      return; // OTP sent successfully
    }
    return rejectWithValue(res.data?.message ?? "Failed to send OTP");
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? "Login failed");
  }
});

// ==========================
// VERIFY OTP
// ==========================
export const verifyOtp = createAsyncThunk<
  User, // OTP verification returns the user
  { pjNumber: string; otp: string },
  { rejectValue: string }
>("auth/verifyOtp", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/verify-otp", data);
    if (res.data?.status === "success" && res.data?.data?.user) {
      return res.data.data.user;
    }
    return rejectWithValue(res.data?.message ?? "OTP verification failed");
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? "OTP verification failed");
  }
});

// ==========================
// LOGOUT
// ==========================
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    /* silent fail */
  }
});

// ==========================
// REFRESH SESSION
// ==========================
export const refreshSession = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/refresh");
      return res.data.data?.user;
    } catch (err) {
      return rejectWithValue("Session expired");
    }
  }
);

// ==========================
// SLICE
// ==========================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    resetOtpState(state) {
      state.otpSent = false;
      state.pjNumber = ""; // clear PJ number on reset
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN (Send OTP)
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpSent = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true; // OTP sent successfully
        state.pjNumber = action.meta.arg.pjNumber; // persist PJ number
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
      })

      // VERIFY OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.otpSent = false;
        state.pjNumber = ""; // clear PJ number after successful login
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "OTP verification failed";
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.otpSent = false;
        state.pjNumber = "";
      })

      // REFRESH SESSION
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

export const { clearAuthError, resetOtpState } = authSlice.actions;
export default authSlice.reducer;
