import { configureStore } from "@reduxjs/toolkit";
import recordsReducer from "./slices/recordsSlice";
import authReducer from "./slices/authSlice"
import courtsReducer from "./slices/courtsSlice";
import reportsReducer from "./slices/reportsSlice"
import userReducer from "./slices/userSlice";
import gazetteReducer from "./slices/gazetteSlice";
import gpReducer from "./slices/gpSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    records: recordsReducer,
    courts: courtsReducer,
    reports: reportsReducer,
    user: userReducer,
    gazette: gazetteReducer,
    gp: gpReducer
  },
});

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
