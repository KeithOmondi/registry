import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

export interface Court {
  _id: string;
  name: string;
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
  kpiAlertSent: boolean;
}

export interface RecordStats {
  total: number;
  compliance: { approved: number; rejected: number };
  gpStatus: { pending: number; published: number };
  kpiBreaches: number;
  averages: { receivingLeadTime: number; forwardingLeadTime: number };
}

/* ================== ASYNC THUNKS ================== */
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

export const fetchRecordStats = createAsyncThunk<RecordStats>(
  "records/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/records/stats");
      return res.data.data.summary[0]; // Matches updated controller
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

/* ================== SLICE ================== */
interface RecordsState {
  records: Record[];
  stats: RecordStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: RecordsState = {
  records: [],
  stats: null,
  loading: false,
  error: null,
};

const recordSlice = createSlice({
  name: "records",
  initialState,
  reducers: {
    clearRecordsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchRecords.fulfilled,
        (state, action: PayloadAction<Record[]>) => {
          state.records = action.payload;
          state.loading = false;
        },
      )
      .addCase(
        fetchRecordStats.fulfilled,
        (state, action: PayloadAction<RecordStats>) => {
          state.stats = action.payload;
          state.loading = false;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload || "An unexpected error occurred";
        },
      );
  },
});

export const { clearRecordsError } = recordSlice.actions;
export default recordSlice.reducer;
