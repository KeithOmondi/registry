import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
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
  previewBlobUrl: string | null;
  loading: boolean;
  loadingPreview: boolean; // NEW: separate loader for preview modal
  success: boolean;
  error: string | null;
}

const initialState: GpState = {
  profile: null,
  dashboard: null,
  adminRecords: [],
  currentRecord: null,
  previewBlobUrl: null,
  loading: false,
  loadingPreview: false,
  success: false,
  error: null,
};



/* =====================================
   ASYNC THUNKS
===================================== */

/**
 * 🔹 Proxy Preview Thunk
 */
export const fetchProxyPreview = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("gp/fetchProxyPreview", async (recordId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/gp/admin/proxy-view/${recordId}`, {
      responseType: "blob",
    });
    const blobUrl = URL.createObjectURL(response.data);
    return blobUrl;
  } catch (err: any) {
    return rejectWithValue("Failed to generate secure preview");
  }
});

export const fetchAllRecordsForAdmin = createAsyncThunk<
  RecordItem[],
  void,
  { rejectValue: string }
>("gp/fetchAllAdmin", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/gp/admin/all-records");
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Admin fetch failed");
  }
});

export const fetchGpDashboard = createAsyncThunk<
  GpDashboard,
  void,
  { rejectValue: string }
>("gp/fetchDashboard", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/gp/dashboard");
    return data as GpDashboard;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to load dashboard",
    );
  }
});

export const fetchRecordById = createAsyncThunk<
  RecordItem,
  string,
  { rejectValue: string }
>("gp/fetchRecordById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/gp/${id}`);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch record");
  }
});

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
>("gp/submitRejection", async (payload, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("causeNo", payload.causeNo);
    formData.append("deceasedName", payload.deceasedName);
    formData.append("rejectionReason", payload.rejectionReason);
    formData.append("dateOfRejection", payload.dateOfRejection);
    formData.append("courtStation", payload.courtStation);
    formData.append("file", payload.file);

    const { data } = await api.post("/gp/reject", formData);
    return data.data as RecordItem;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Submission failed");
  }
});

export const updateRejectionRecord = createAsyncThunk<
  RecordItem,
  { id: string; updates: Partial<RecordItem> },
  { rejectValue: string }
>("gp/updateRecord", async ({ id, updates }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/gp/update/${id}`, updates);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Update failed");
  }
});

export const fetchGpProfile = createAsyncThunk<any, void, { rejectValue: string }>(
  "gp/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/gp/profile");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
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
    resetGpStatus: (state) => {
      state.success = false;
      state.error = null;
    },
    clearPreview: (state) => {
      if (state.previewBlobUrl) {
        URL.revokeObjectURL(state.previewBlobUrl);
        state.previewBlobUrl = null;
      }
    },
    clearGpState: () => initialState,
  },
  extraReducers: (builder) => {
    /* ===========================
       Proxy Preview
    ============================ */
    builder.addCase(fetchProxyPreview.pending, (state) => {
      state.loadingPreview = true;
      state.error = null;
    });
    builder.addCase(fetchProxyPreview.fulfilled, (state, action) => {
      state.loadingPreview = false;
      state.previewBlobUrl = action.payload;
    });
    builder.addCase(fetchProxyPreview.rejected, (state, action) => {
      state.loadingPreview = false;
      state.error = action.payload || "Failed to generate preview";
    });

    /* ===========================
       Other Fulfilled Actions
    ============================ */
    builder.addCase(fetchGpDashboard.fulfilled, (state, action) => {
      state.loading = false;
      state.dashboard = action.payload;
    });
    builder.addCase(fetchAllRecordsForAdmin.fulfilled, (state, action) => {
      state.loading = false;
      state.adminRecords = action.payload;
    });
    builder.addCase(fetchRecordById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentRecord = action.payload;
    });
    builder.addCase(fetchGpProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(submitRejectionRecord.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      if (state.dashboard) state.dashboard.records.unshift(action.payload);
      state.adminRecords.unshift(action.payload);
    });
    builder.addCase(updateRejectionRecord.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.currentRecord = action.payload;

      const updateList = (list: RecordItem[]) => {
        const index = list.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) list[index] = action.payload;
      };

      if (state.dashboard) updateList(state.dashboard.records);
      updateList(state.adminRecords);
    });

    /* ===========================
       Pending Matcher (Except Preview)
    ============================ */
    builder.addMatcher(
      isAnyOf(
        fetchAllRecordsForAdmin.pending,
        fetchGpDashboard.pending,
        fetchRecordById.pending,
        submitRejectionRecord.pending,
        updateRejectionRecord.pending,
        fetchGpProfile.pending,
      ),
      (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      }
    );

    /* ===========================
       Rejected Matcher (Except Preview)
    ============================ */
    builder.addMatcher(
      isAnyOf(
        fetchAllRecordsForAdmin.rejected,
        fetchGpDashboard.rejected,
        fetchRecordById.rejected,
        submitRejectionRecord.rejected,
        updateRejectionRecord.rejected,
        fetchGpProfile.rejected,
      ),
      (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Something went wrong";
      }
    );
  },
});

export const { resetGpStatus, clearGpState, clearPreview } = gpSlice.actions;
export default gpSlice.reducer;
