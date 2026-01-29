// store/slices/reportsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface ReportState {
  summary: any;
  courtPerformance: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  summary: null,
  courtPerformance: [],
  loading: false,
  error: null,
};

export const fetchAnalytics = createAsyncThunk(
  "reports/fetchAnalytics",
  async (courtId: string = "all", { rejectWithValue }) => {
    try {
      const response = await axios.get(`/reports/analytics?courtId=${courtId}`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary[0] || null;
        state.courtPerformance = action.payload.courtPerformance;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default reportsSlice.reducer;