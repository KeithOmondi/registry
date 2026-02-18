import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  isAnyOf,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =====================================
   TYPES & CONSTANTS
===================================== */

export const REJECTION_STATUS = {
  PENDING: "pending",
  RECTIFIED: "rectified",
} as const;

export type RejectionStatus =
  (typeof REJECTION_STATUS)[keyof typeof REJECTION_STATUS];

export interface RecordItem {
  _id: string;
  causeNo: string;
  deceasedName: string;
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
  updatedAt: string;
}

export interface GpDashboard {
  gpId: string;
  records: RecordItem[];
}

interface GpState {
  profile: any | null;
  dashboard: GpDashboard | null;
  adminRecords: RecordItem[];
  currentRecord: RecordItem | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: GpState = {
  profile: null,
  dashboard: null,
  adminRecords: [],
  currentRecord: null,
  loading: false,
  success: false,
  error: null,
};

/* =====================================
   ASYNC THUNKS
===================================== */

// 🔹 Admin: All records
export const fetchAllRecordsForAdmin = createAsyncThunk<
  RecordItem[],
  void,
  { rejectValue: string }
>("gp/fetchAllAdmin", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/gp/admin/all-records");
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Admin fetch failed"
    );
  }
});

export const fetchGpDashboard = createAsyncThunk<GpDashboard, void, { rejectValue: string }>(
  "gp/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/gp/dashboard");
      // Use `data` directly, not `data.data`
      return data as GpDashboard;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load dashboard");
    }
  }
);



// 🔹 Fetch single record
export const fetchRecordById = createAsyncThunk<
  RecordItem,
  string,
  { rejectValue: string }
>("gp/fetchRecordById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/gp/${id}`);
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch record"
    );
  }
});

// 🔹 Submit rejection record
export const submitRejectionRecord = createAsyncThunk<
  RecordItem,
  {
    causeNo: string;
    deceasedName: string;
    rejectionReason: string;
    dateOfRejection: string;
    courtStation: string;
    file: File;
  },
  { rejectValue: string }
>(
  "gp/submitRejection",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("causeNo", payload.causeNo);
      formData.append("deceasedName", payload.deceasedName);
      formData.append("rejectionReason", payload.rejectionReason);
      formData.append("dateOfRejection", payload.dateOfRejection);
      formData.append("courtStation", payload.courtStation);
      formData.append("file", payload.file);

      const { data } = await api.post("/gp/reject", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data.data as RecordItem;
    } catch (err: any) {
      // 🔹 Log the full error for debugging in prod
      console.error("❌ submitRejectionRecord error:", err);
      console.error("Response data:", err.response?.data);

      return rejectWithValue(
        err.response?.data?.message || "Submission failed"
      );
    }
  }
);




// 🔹 Update rejection record
export const updateRejectionRecord = createAsyncThunk<
  RecordItem,
  { id: string; updates: Partial<RecordItem> },
  { rejectValue: string }
>("gp/updateRecord", async ({ id, updates }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/gp/update/${id}`, updates);
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Update failed"
    );
  }
});

// 🔹 GP Profile
export const fetchGpProfile = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("gp/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/gp/profile");
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch profile"
    );
  }
});

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
    /* ===============================
       ✅ CASES FIRST (FULFILLED)
    =============================== */

    builder.addCase(
      fetchGpDashboard.fulfilled,
      (state, action: PayloadAction<GpDashboard>) => {
        state.loading = false;
        state.dashboard = action.payload;
      }
    );

    builder.addCase(
      fetchAllRecordsForAdmin.fulfilled,
      (state, action: PayloadAction<RecordItem[]>) => {
        state.loading = false;
        state.adminRecords = action.payload;
      }
    );

    builder.addCase(
      fetchRecordById.fulfilled,
      (state, action: PayloadAction<RecordItem>) => {
        state.loading = false;
        state.currentRecord = action.payload;
      }
    );

    builder.addCase(fetchGpProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    });

    builder.addCase(
      submitRejectionRecord.fulfilled,
      (state, action: PayloadAction<RecordItem>) => {
        state.loading = false;
        state.success = true;

        if (state.dashboard) {
          state.dashboard.records.unshift(action.payload);
        }
      }
    );

    builder.addCase(
      updateRejectionRecord.fulfilled,
      (state, action: PayloadAction<RecordItem>) => {
        state.loading = false;
        state.success = true;
        state.currentRecord = action.payload;

        if (state.dashboard) {
          const index = state.dashboard.records.findIndex(
            (r) => r._id === action.payload._id
          );
          if (index !== -1)
            state.dashboard.records[index] = action.payload;
        }

        const adminIndex = state.adminRecords.findIndex(
          (r) => r._id === action.payload._id
        );
        if (adminIndex !== -1)
          state.adminRecords[adminIndex] = action.payload;
      }
    );

    /* ===============================
       🔄 PENDING MATCHER
    =============================== */

    builder.addMatcher(
      isAnyOf(
        fetchAllRecordsForAdmin.pending,
        fetchGpDashboard.pending,
        fetchRecordById.pending,
        submitRejectionRecord.pending,
        updateRejectionRecord.pending,
        fetchGpProfile.pending
      ),
      (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      }
    );

    /* ===============================
       ❌ REJECTED MATCHER
    =============================== */

    builder.addMatcher(
      isAnyOf(
        fetchAllRecordsForAdmin.rejected,
        fetchGpDashboard.rejected,
        fetchRecordById.rejected,
        submitRejectionRecord.rejected,
        updateRejectionRecord.rejected,
        fetchGpProfile.rejected
      ),
      (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Something went wrong";
      }
    );
  },
});

export const { resetGpStatus, clearGpState } = gpSlice.actions;
export default gpSlice.reducer;
