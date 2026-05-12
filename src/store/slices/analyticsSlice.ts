import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =======================
    TYPES & INTERFACES
======================= */

export interface MonthlyMetrics {
  count: number;
  approved: number;
  rejected: number;
  published: number;
  avgReceivingLeadTime: number | null;
  avgForwardingLeadTime: number | null;
}

export interface CourtMonthlyData {
  name: string;
  level: string;
  monthly: Record<number, MonthlyMetrics>; // key = 1–12
}

// { [courtId]: CourtMonthlyData }
export type MonthlyAnalyticsData = Record<string, CourtMonthlyData>;

export interface MonthlyAnalyticsResponse {
  year: number;
  data: MonthlyAnalyticsData;
}

/* =======================
    QUERY PARAMS
======================= */

export interface FetchMonthlyAnalyticsParams {
  year?: number;
  courtIds?: string[];
}

/* =======================
    THUNKS
======================= */

export const fetchMonthlyAnalytics = createAsyncThunk<
  MonthlyAnalyticsResponse,
  FetchMonthlyAnalyticsParams | undefined
>(
  "analytics/fetchMonthly",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { year = new Date().getFullYear(), courtIds = [] } = params;

      const query = new URLSearchParams({ year: String(year) });
      courtIds.forEach((id) => query.append("courtIds[]", id));

      const res = await api.get(`/analytics/monthly?${query}`);
      return res.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch monthly analytics",
      );
    }
  },
);

/* =======================
    STATE
======================= */

interface AnalyticsState {
  monthly: MonthlyAnalyticsData;
  year: number;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  monthly: {},
  year: new Date().getFullYear(),
  loading: false,
  error: null,
};

/* =======================
    SLICE
======================= */

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalytics(state) {
      state.monthly = {};
      state.error = null;
    },
    setYear(state, action: PayloadAction<number>) {
      state.year = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== FETCH MONTHLY ===== */
      .addCase(fetchMonthlyAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.monthly = action.payload.data;
        state.year = action.payload.year;
      })
      .addCase(fetchMonthlyAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "An unexpected error occurred";
      });
  },
});

export const { clearAnalytics, setYear } = analyticsSlice.actions;
export default analyticsSlice.reducer;