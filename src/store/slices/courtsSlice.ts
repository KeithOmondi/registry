import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* ================================
   Court Levels (no enum)
================================ */

export const CourtLevels = {
  HIGH_COURT: "High Court",
  LAW_COURTS: "Law Courts",
  KADHI_COURT: "Kadhi Court",
  CHILDRENS_COURT: "Children’s Court",
  SUB_REGISTRY: "Sub-Registry",
  OTHER: "Other",
} as const;

export type CourtLevel = (typeof CourtLevels)[keyof typeof CourtLevels];

/* ================================
   Types
================================ */

export interface Court {
  _id: string;
  name: string;
  level: CourtLevel;
  magistrate?: string;
  phone?: string;
  primaryEmail: string;
  secondaryEmails?: string[];
  code?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

interface CourtsState {
  courts: Court[];
  loading: boolean;
  error: string | null;
}

/* ================================
   Initial State
================================ */

const initialState: CourtsState = {
  courts: [],
  loading: false,
  error: null,
};

/* ================================
   Async Thunks
================================ */

// Fetch all courts
export const fetchCourts = createAsyncThunk<Court[], void, { rejectValue: string }>(
  "courts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/courts/get");
      // API returns { status, results, data: [...] }
      return Array.isArray(res.data.data) ? res.data.data : [];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch courts"
      );
    }
  }
);



// Create court
export const createCourt = createAsyncThunk<
  Court,
  Omit<Court, "_id" | "createdAt" | "updatedAt">,
  { rejectValue: string }
>("courts/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post("/courts/create", payload);
    return res.data.court ?? res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to create court"
    );
  }
});

// Update court
export const updateCourt = createAsyncThunk<
  Court,
  { id: string; data: Partial<Court> },
  { rejectValue: string }
>("courts/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/courts/update/${id}`, data);
    return res.data.court ?? res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to update court"
    );
  }
});

// Delete court
export const deleteCourt = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("courts/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/courts/delete/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to delete court"
    );
  }
});

/* ================================
   Slice
================================ */

const courtsSlice = createSlice({
  name: "courts",
  initialState,
  reducers: {
    clearCourtsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- FETCH ---------- */
      .addCase(fetchCourts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourts.fulfilled, (state, action: PayloadAction<Court[]>) => {
        state.loading = false;
        state.courts = action.payload;
      })
      .addCase(fetchCourts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch courts";
      })

      /* ---------- CREATE ---------- */
      .addCase(createCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourt.fulfilled, (state, action: PayloadAction<Court>) => {
        state.loading = false;
        state.courts.unshift(action.payload);
      })
      .addCase(createCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create court";
      })

      /* ---------- UPDATE ---------- */
      .addCase(updateCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourt.fulfilled, (state, action: PayloadAction<Court>) => {
        state.loading = false;
        state.courts = state.courts.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })
      .addCase(updateCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update court";
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteCourt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourt.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.courts = state.courts.filter(
          (c) => c._id !== action.payload
        );
      })
      .addCase(deleteCourt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete court";
      });
  },
});

export const { clearCourtsError } = courtsSlice.actions;

export default courtsSlice.reducer;
