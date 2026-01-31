import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =======================
   TYPES
======================= */

export interface Court {
  _id: string;
  name: string;
  level?: string;
}

export interface Auditor {
  _id: string;
  firstName: string;
  lastName: string;
}

export type Form60Compliance = "Approved" | "Rejected";
export type StatusAtGP = "Pending" | "Published";

export interface Record {
  _id: string;
  no: number;
  causeNo: string;
  nameOfDeceased: string;
  courtStation: Court;
  dateReceived: string;
  dateOfReceipt?: string;
  dateForwardedToGP?: string;
  receivingLeadTime: number | null;
  forwardingLeadTime: number | null;
  form60Compliance: Form60Compliance;
  rejectionReason?: string;
  statusAtGP: StatusAtGP;
  volumeNo?: string;
  datePublished?: string | null;
  kpiAlertSent: boolean;

  updatedBy?: Auditor | null;
  lastEditAction?: string;

  createdAt: string;
  updatedAt: string;
}

/* =======================
   DTOs
======================= */

export interface CreateRecordPayload {
  courtStation: string;
  causeNo: string;
  nameOfDeceased: string;
  dateReceived: string;
  dateOfReceipt?: string;
  dateForwardedToGP?: string;
  form60Compliance?: Form60Compliance;
  rejectionReason?: string;
}

export interface UpdateRecordPayload {
  id: string;
  data: Partial<CreateRecordPayload>;
}

export interface BulkForwardDatePayload {
  ids: string[];
  date: string;
}

export interface BulkUpdateResponse {
  success: boolean;
  modifiedCount: number;
  records: Record[];
}

export interface RecordStats {
  total: number;
  compliance: { approved: number; rejected: number };
  gpStatus: { pending: number; published: number };
  kpiBreaches: number;
  averages: { receivingLeadTime: number; forwardingLeadTime: number };
}

/* =======================
   HELPERS
======================= */

// Merge old record state with incoming update, safely preserving nested objects
const mergeRecord = (oldRec: Record, newRec: Partial<Record>): Record => ({
  ...oldRec,
  ...newRec,
  courtStation: newRec.courtStation ?? oldRec.courtStation,
  updatedBy: newRec.updatedBy ?? oldRec.updatedBy ?? null,
  lastEditAction: newRec.lastEditAction ?? oldRec.lastEditAction ?? "Updated record",
  updatedAt: newRec.updatedAt ?? oldRec.updatedAt,
});

/* =======================
   THUNKS
======================= */

export const fetchRecords = createAsyncThunk<Record[]>(
  "records/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/records/get");
      return res.data.records;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchRecordById = createAsyncThunk<Record, string>(
  "records/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/records/get/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const createRecord = createAsyncThunk<Record, CreateRecordPayload>(
  "records/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/records/create", payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const updateRecord = createAsyncThunk<Record, UpdateRecordPayload>(
  "records/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/records/update/${id}`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const deleteRecord = createAsyncThunk<string, string>(
  "records/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/records/delete/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchRecordStats = createAsyncThunk<RecordStats>(
  "records/stats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/records/stats");
      return res.data.stats;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const updateMultipleRecordsDateForwarded = createAsyncThunk<
  BulkUpdateResponse,
  BulkForwardDatePayload
>("records/bulkUpdateDateForwarded", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.put(
      "/records/update-multiple-date-forwarded",
      payload,
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

/* =======================
   SLICE
======================= */

interface RecordsState {
  records: Record[];
  selectedRecord: Record | null;
  stats: RecordStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: RecordsState = {
  records: [],
  selectedRecord: null,
  stats: null,
  loading: false,
  error: null,
};

const recordSlice = createSlice({
  name: "records",
  initialState,
  reducers: {
    clearSelectedRecord(state) {
      state.selectedRecord = null;
    },
    clearRecordsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== FETCH ALL ===== */
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })

      /* ===== FETCH ONE ===== */
      .addCase(fetchRecordById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRecord = action.payload;
      })

      /* ===== CREATE ===== */
      .addCase(createRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records.unshift(action.payload);
      })

      /* ===== UPDATE SINGLE ===== */
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;

        // Merge into records array
        const idx = state.records.findIndex(r => r._id === updated._id);
        if (idx !== -1) {
          state.records[idx] = mergeRecord(state.records[idx], updated);
        } else {
          state.records.unshift(updated);
        }

        // Merge into selectedRecord if it matches
        if (state.selectedRecord?._id === updated._id) {
          state.selectedRecord = mergeRecord(state.selectedRecord, updated);
        }
      })

      /* ===== BULK UPDATE ===== */
      .addCase(updateMultipleRecordsDateForwarded.fulfilled, (state, action) => {
        state.loading = false;

        action.payload.records.forEach(updated => {
          const idx = state.records.findIndex(r => r._id === updated._id);
          if (idx !== -1) {
            state.records[idx] = mergeRecord(state.records[idx], updated);
          }
        });
      })

      /* ===== DELETE ===== */
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.filter(r => r._id !== action.payload);
      })

      /* ===== STATS ===== */
      .addCase(fetchRecordStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })

      /* ===== MATCHERS ===== */
      .addMatcher(
        (action): action is PayloadAction => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action): action is PayloadAction<string> =>
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || "An unexpected error occurred";
        },
      );
  },
});

export const { clearSelectedRecord, clearRecordsError } = recordSlice.actions;
export default recordSlice.reducer;
