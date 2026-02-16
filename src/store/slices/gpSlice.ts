import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* =====================================
   TYPES
===================================== */

interface GpProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  pjNumber: string;
  role: string;
  isActive: boolean;
}

interface GpState {
  profile: GpProfile | null;
  dashboard: any | null;
  loading: boolean;
  error: string | null;
}

/* =====================================
   INITIAL STATE
===================================== */

const initialState: GpState = {
  profile: null,
  dashboard: null,
  loading: false,
  error: null,
};

/* =====================================
   ASYNC THUNKS
===================================== */

// 🔹 Get GP Dashboard
export const fetchGpDashboard = createAsyncThunk(
  "gp/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/gp/dashboard", {
        withCredentials: true,
      });
      return data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load dashboard"
      );
    }
  }
);

// 🔹 Get GP Profile
export const fetchGpProfile = createAsyncThunk(
  "gp/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/gp/profile", {
        withCredentials: true,
      });
      return data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

// 🔹 Update GP Profile
export const updateGpProfile = createAsyncThunk(
  "gp/updateProfile",
  async (
    updates: { firstName?: string; lastName?: string; email?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.patch("/api/gp/profile", updates, {
        withCredentials: true,
      });
      return data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Profile update failed"
      );
    }
  }
);

/* =====================================
   SLICE
===================================== */

const gpSlice = createSlice({
  name: "gp",
  initialState,
  reducers: {
    clearGpError(state) {
      state.error = null;
    },
    resetGpState: () => initialState,
  },
  extraReducers: (builder) => {
    builder

      /* ===== DASHBOARD ===== */
      .addCase(fetchGpDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGpDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchGpDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== PROFILE FETCH ===== */
      .addCase(fetchGpProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGpProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchGpProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== PROFILE UPDATE ===== */
      .addCase(updateGpProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGpProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateGpProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

/* =====================================
   EXPORTS
===================================== */

export const { clearGpError, resetGpState } = gpSlice.actions;

export default gpSlice.reducer;
