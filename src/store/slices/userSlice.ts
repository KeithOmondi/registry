import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axios";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  pjNumber?: string;
  role: "admin" | "gp" | "user";
  isActive: boolean;
  accountVerified: boolean;
  avatar?: string;
  createdAt: string;
}

interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  pjNumber?: string;
  password: string;
  role: User["role"];
}

interface UpdateUserPayload {
  id: string;
  data: Partial<Pick<User, "firstName" | "lastName" | "email">>;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  selectedUser: null,
  loading: false,
  error: null,
};

/* ── shared error extractor ── */
interface ApiError {
  response?: { data?: { message?: string } };
  message?: string;
}

const extractMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiError;
  return e?.response?.data?.message ?? e?.message ?? fallback;
};

/* =====================================
   ASYNC THUNKS
===================================== */

// USER: Get own profile  →  GET /user/me
export const fetchMyProfile = createAsyncThunk(
  "user/fetchMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/me");
      return response.data.data as User;
    } catch (err: unknown) {
      return rejectWithValue(extractMessage(err, "Failed to fetch profile"));
    }
  }
);

// USER: Update own profile  →  PATCH /user/me
export const updateMyProfile = createAsyncThunk(
  "user/updateMyProfile",
  async (
    data: Pick<User, "firstName" | "lastName" | "email">,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch("/user/me", data);
      return response.data.data as User;
    } catch (err: unknown) {
      return rejectWithValue(extractMessage(err, "Failed to update profile"));
    }
  }
);

// ADMIN: Get all users  →  GET /user/get
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/get");
      return response.data.data as User[];
    } catch (err: unknown) {
      return rejectWithValue(extractMessage(err, "Failed to fetch users"));
    }
  }
);

// ADMIN: Get single user by ID  →  GET /user/:id
export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/${id}`);
      return response.data.data as User;
    } catch (err: unknown) {
      return rejectWithValue(extractMessage(err, "Failed to fetch user"));
    }
  }
);

// ADMIN: Create user  →  POST /user/create
export const createUser = createAsyncThunk(
  "user/createUser",
  async (data: CreateUserPayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/create", data);
      return response.data.data as User;
    } catch (err: unknown) {
      return rejectWithValue(extractMessage(err, "Failed to create user"));
    }
  }
);

// ADMIN: Update user details  →  PATCH /user/:id
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ id, data }: UpdateUserPayload, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/user/${id}`, data);
      return response.data.data as User;
    } catch (err: unknown) {
      return rejectWithValue(extractMessage(err, "Failed to update user"));
    }
  }
);

// ADMIN: Toggle active status  →  PATCH /user/toggle-status/:userId
export const toggleUserStatus = createAsyncThunk(
  "user/toggleStatus",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/user/toggle-status/${userId}`);
      return response.data.data as User;
    } catch (err: unknown) {
      return rejectWithValue(extractMessage(err, "Failed to toggle user status"));
    }
  }
);

// ADMIN: Permanent delete  →  DELETE /user/:id
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/user/${id}`);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(extractMessage(err, "Failed to delete user"));
    }
  }
);

/* =====================================
   SLICE
===================================== */

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    logoutUser: (state) => {
      state.currentUser = null;
      state.users = [];
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── fetchMyProfile ──────────────────────────────
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── updateMyProfile ─────────────────────────────
      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── fetchAllUsers ───────────────────────────────
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── fetchUserById ───────────────────────────────
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── createUser ──────────────────────────────────
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── updateUser ──────────────────────────────────
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = action.payload;
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── toggleUserStatus ────────────────────────────
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── deleteUser ──────────────────────────────────
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload);
        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserError, clearSelectedUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;