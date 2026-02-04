import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

// Define the User interface based on your backend
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Admin" | "User" | "Clerk"; // Adjust based on your actual roles
  isActive: boolean;
  accountVerified: boolean;
  createdAt: string;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

/* =====================================
   ASYNC THUNKS
===================================== */

// Get current user profile (/me)
export const fetchMyProfile = createAsyncThunk(
  "user/fetchMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/me");
      // Log this to your console to see exactly what the backend is sending!
      console.log("Backend User Data:", response.data);

      // If your backend nests data under a 'data' key, use response.data.data
      // If it's direct, just use response.data
      return response.data.data || response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

// Admin: Fetch all users (/get)
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/get"); // Verify this path!
      // response.data is the WHOLE JSON { status, results, data }
      // response.data.data is just the Array [user1, user2...]
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

// Admin: Toggle User Status
export const toggleUserStatus = createAsyncThunk(
  "user/toggleStatus",
  async (userId: string, { rejectWithValue }) => {
    try {
      // Updated to match the '/toggle-status/:id' convention
      const response = await api.patch(`/user/toggle-status/${userId}`);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update status",
      );
    }
  },
);

/* =====================================
   SLICE DEFINITION
===================================== */

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    logoutUser: (state) => {
      state.currentUser = null;
      state.users = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Profile
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchMyProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.currentUser = action.payload;
        },
      )
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch All Users (Admin)
      .addCase(
        fetchAllUsers.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.users = action.payload;
        },
      )
      // Toggle Status
      .addCase(
        toggleUserStatus.fulfilled,
        (state, action: PayloadAction<User>) => {
          const index = state.users.findIndex(
            (u) => u._id === action.payload._id,
          );
          if (index !== -1) {
            state.users[index] = action.payload;
          }
        },
      );
  },
});

export const { clearUserError, logoutUser } = userSlice.actions;
export default userSlice.reducer;
