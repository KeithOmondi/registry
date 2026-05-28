import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =========================================================
   TYPES
========================================================= */

export interface MatchedRecord {
  _id: string;
  causeNo: string;
  nameOfDeceased: string;
  courtStation: string;
  previousStatus: string;
  newStatus: string;
}

export interface AlreadyPublishedRecord {
  _id: string;
  causeNo: string;
  nameOfDeceased: string;
  datePublished: string;
}

export interface ScanSummary {
  totalInGazette: number;
  totalMatched: number;
  totalAlreadyPublished: number;
  totalNotInDb: number;
  totalNotInGazette: number;
  newlyMarkedPublished: number;
}

export interface ScanPreviewResult {
  matched: MatchedRecord[];
  alreadyPublished: AlreadyPublishedRecord[];
  notInDb: string[];
  notInGazette: string[];
  summary: ScanSummary;
}

export interface ConfirmScanResult {
  success: boolean;
  modifiedCount: number;
  message: string;
}

interface ScannerState {
  // Step 1 — preview
  preview: ScanPreviewResult | null;
  previewLoading: boolean;
  previewError: string | null;

  // Step 2 — selected IDs user wants to confirm
  selectedIds: string[];

  // Step 3 — confirm result
  confirmResult: ConfirmScanResult | null;
  confirmLoading: boolean;
  confirmError: string | null;

  // Which step the UI is on: 0=idle, 1=preview, 2=confirmed
  step: 0 | 1 | 2;
}

const initialState: ScannerState = {
  preview: null,
  previewLoading: false,
  previewError: null,
  selectedIds: [],
  confirmResult: null,
  confirmLoading: false,
  confirmError: null,
  step: 0,
};

/* =========================================================
   THUNKS
========================================================= */

// Step 1: Upload PDF → get preview (no DB writes)
export const previewScan = createAsyncThunk <
  ScanPreviewResult,
  File,
  { rejectValue: string }
>("scanner/preview", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("gazette", file);

    const { data } = await api.post("/scanner/scan/preview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data.data as ScanPreviewResult;
  } catch (err: unknown) {
    const error = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return rejectWithValue(
      error.response?.data?.message || "Scan preview failed"
    );
  }
});

// Step 2: Confirm selected IDs → write to DB + send emails
export const confirmScan = createAsyncThunk <
  ConfirmScanResult,
  string[],
  { rejectValue: string }
>("scanner/confirm", async (ids, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/scanner/scan/confirm", { ids });
    return data as ConfirmScanResult;
  } catch (err: unknown) {
    const error = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return rejectWithValue(
      error.response?.data?.message || "Confirm scan failed"
    );
  }
});

/* =========================================================
   SLICE
========================================================= */

const scannerSlice = createSlice({
  name: "scanner",
  initialState,
  reducers: {
    // Toggle a matched record's selection
    toggleSelectedId(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((i) => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    // Select / deselect all matched records
    selectAllIds(state, action: PayloadAction<string[]>) {
      state.selectedIds = action.payload;
    },
    clearSelectedIds(state) {
      state.selectedIds = [];
    },
    // Full reset back to step 0
    resetScanner: () => initialState,
    clearScannerErrors(state) {
      state.previewError = null;
      state.confirmError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== PREVIEW ===== */
      .addCase(previewScan.pending, (state) => {
        state.previewLoading = true;
        state.previewError = null;
        state.preview = null;
        state.step = 0;
      })
      .addCase(
        previewScan.fulfilled,
        (state, action: PayloadAction<ScanPreviewResult>) => {
          state.previewLoading = false;
          state.preview = action.payload;
          // Auto-select all matched records
          state.selectedIds = action.payload.matched.map((r) => r._id);
          state.step = 1;
        }
      )
      .addCase(previewScan.rejected, (state, action) => {
        state.previewLoading = false;
        state.previewError = action.payload ?? "Preview failed";
        state.step = 0;
      })

      /* ===== CONFIRM ===== */
      .addCase(confirmScan.pending, (state) => {
        state.confirmLoading = true;
        state.confirmError = null;
      })
      .addCase(
        confirmScan.fulfilled,
        (state, action: PayloadAction<ConfirmScanResult>) => {
          state.confirmLoading = false;
          state.confirmResult = action.payload;
          state.step = 2;
        }
      )
      .addCase(confirmScan.rejected, (state, action) => {
        state.confirmLoading = false;
        state.confirmError = action.payload ?? "Confirm failed";
      });
  },
});

export const {
  toggleSelectedId,
  selectAllIds,
  clearSelectedIds,
  resetScanner,
  clearScannerErrors,
} = scannerSlice.actions;

export default scannerSlice.reducer;