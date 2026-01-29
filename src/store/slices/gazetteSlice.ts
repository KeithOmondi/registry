import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* ======================================================
    TYPES
====================================================== */

interface GazetteCase {
  deceased: string;
  cause: string;
  forwardedDate: string;
  leadTime: string;
  courtStation?: string;
}

interface Gazette {
  _id: string;
  volumeNo: string;
  datePublished: string;
  fileName: string;
  totalRecords: number;
  publishedCount: number;
  cases: GazetteCase[];
  fullCases?: GazetteCase[];
  uploadedBy?: { name: string; email: string };
}

interface ScanLog {
  _id: string;
  fileName: string;
  totalRecords: number;
  publishedCount: number;
  remarks: string;
  volumeNo: string;
  datePublished: string;
  createdAt: string;
}

interface ScannerState {
  gazettes: Gazette[];
  gazetteDetails: Gazette | null;
  logs: ScanLog[];
  scanLoading: false | true;
  scanError: string | null;
  fetchLoading: false | true;
  fetchError: string | null;
  detailsLoadingId: string | null;
  detailsError: string | null;
  logsLoading: false | true;
  logsError: string | null;
}

/* ======================================================
    THUNKS
====================================================== */

export const scanGazette = createAsyncThunk(
  "gazetteScanner/scanGazette",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file); // Changed 'scan' to 'file' to match backend upload.single("file")

      const { data } = await api.post("/gazette/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Scan failed");
    }
  }
);

export const fetchGazettes = createAsyncThunk(
  "gazetteScanner/fetchGazettes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/gazette/all", { withCredentials: true });
      return data.gazettes || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch gazettes");
    }
  }
);

export const fetchGazetteDetails = createAsyncThunk(
  "gazetteScanner/fetchGazetteDetails",
  async (gazetteId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/gazette/${gazetteId}`, { withCredentials: true });
      return data.gazette;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch details");
    }
  }
);

export const fetchScanLogs = createAsyncThunk(
  "gazetteScanner/fetchScanLogs",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/gazette/logs", { withCredentials: true });
      return data.logs || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch logs");
    }
  }
);

/* ======================================================
    INITIAL STATE
====================================================== */
const initialState: ScannerState = {
  gazettes: [],
  gazetteDetails: null,
  logs: [],
  scanLoading: false,
  scanError: null,
  fetchLoading: false,
  fetchError: null,
  detailsLoadingId: null,
  detailsError: null,
  logsLoading: false,
  logsError: null,
};

/* ======================================================
    SLICE
====================================================== */
const gazetteScannerSlice = createSlice({
  name: "gazetteScanner",
  initialState,
  reducers: {
    resetScanState: (state) => {
      state.scanLoading = false;
      state.scanError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- Scan --- */
      .addCase(scanGazette.pending, (state) => {
        state.scanLoading = true;
        state.scanError = null;
      })
      .addCase(scanGazette.fulfilled, (state) => {
        state.scanLoading = false;
      })
      .addCase(scanGazette.rejected, (state, action) => {
        state.scanLoading = false;
        state.scanError = action.payload as string;
      })

      /* --- Fetch Gazettes --- */
      .addCase(fetchGazettes.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchGazettes.fulfilled, (state, action: PayloadAction<Gazette[]>) => {
        state.fetchLoading = false;
        state.gazettes = action.payload;
      })
      .addCase(fetchGazettes.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload as string;
      })

      /* --- Fetch Details --- */
      .addCase(fetchGazetteDetails.pending, (state, action) => {
        state.detailsLoadingId = action.meta.arg;
        state.detailsError = null;
      })
      .addCase(fetchGazetteDetails.fulfilled, (state, action: PayloadAction<Gazette>) => {
        state.detailsLoadingId = null;
        state.gazetteDetails = action.payload;
        
        // Update the cached gazette in the list if it exists
        const index = state.gazettes.findIndex((g) => g._id === action.payload._id);
        if (index !== -1) {
          state.gazettes[index] = { ...state.gazettes[index], fullCases: action.payload.cases };
        }
      })
      .addCase(fetchGazetteDetails.rejected, (state, action) => {
        state.detailsLoadingId = null;
        state.detailsError = action.payload as string;
      })

      /* --- Fetch Logs --- */
      .addCase(fetchScanLogs.pending, (state) => {
        state.logsLoading = true;
        state.logsError = null;
      })
      .addCase(fetchScanLogs.fulfilled, (state, action: PayloadAction<ScanLog[]>) => {
        state.logsLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchScanLogs.rejected, (state, action) => {
        state.logsLoading = false;
        state.logsError = action.payload as string;
      });
  },
});

export const { resetScanState } = gazetteScannerSlice.actions;
export default gazetteScannerSlice.reducer;