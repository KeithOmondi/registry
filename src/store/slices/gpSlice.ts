import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =====================================
   TYPES & CONSTANTS
===================================== */

// Use a const object instead of an enum to avoid ts(1294)
export const REJECTION_STATUS = {
  PENDING: "pending",
  RECTIFIED: "rectified",
} as const;

// Create a type from the object values
export type RejectionStatus =
  (typeof REJECTION_STATUS)[keyof typeof REJECTION_STATUS];

export interface RecordItem {
  _id: string;
  causeNo: string;
  rejectionReason: string;
  dateReceived: string;
  fileUrl: string;
  status: RejectionStatus;
  updatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    pjNumber: string;
  };
  courtStation: {
    _id: string;
    name: string;
    level: string;
  };
  lastEditAction: string;
  createdAt: string;
}

export interface GpDashboard {
  gpId: string;
  records: RecordItem[];
}

interface GpState {
  profile: any | null;
  dashboard: GpDashboard | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: GpState = {
  profile: null,
  dashboard: null,
  loading: false,
  success: false,
  error: null,
};

/* =====================================
   ASYNC THUNKS
===================================== */

export const fetchGpDashboard = createAsyncThunk(
  "gp/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/gp/dashboard");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load dashboard",
      );
    }
  },
);

export const fetchGpProfile = createAsyncThunk(
  "gp/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/gp/profile");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

export const submitRejectionRecord = createAsyncThunk(
  "gp/submitRejection",
  async (
    payload: {
      causeNo: string;
      rejectionReason: string;
      dateOfRejection: string;
      file: File;
    },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("causeNo", payload.causeNo);
      formData.append("rejectionReason", payload.rejectionReason);
      formData.append("dateOfRejection", payload.dateOfRejection);
      formData.append("file", payload.file);

      const { data } = await api.post("/gp/reject", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Submission failed",
      );
    }
  },
);

/* =====================================
   SLICE
===================================== */
const gpSlice = createSlice({
  name: "gp",
  initialState,
  reducers: {
    resetGpStatus: (state) => {
      state.success = false;
      state.error = null;
    },
    clearGpState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGpDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchGpDashboard.fulfilled,
        (state, action: PayloadAction<GpDashboard>) => {
          state.loading = false;
          state.dashboard = action.payload;
        },
      )
      .addCase(fetchGpDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGpProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(submitRejectionRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        submitRejectionRecord.fulfilled,
        (state, action: PayloadAction<RecordItem>) => {
          state.loading = false;
          state.success = true;
          if (state.dashboard) {
            state.dashboard.records = [
              action.payload,
              ...(state.dashboard.records || []),
            ];
          }
        },
      )
      .addCase(submitRejectionRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetGpStatus, clearGpState } = gpSlice.actions;
export default gpSlice.reducer;
