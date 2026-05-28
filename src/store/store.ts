import { configureStore } from "@reduxjs/toolkit";
import recordsReducer from "./slices/recordsSlice";
import authReducer from "./slices/authSlice"
import courtsReducer from "./slices/courtsSlice";
import reportsReducer from "./slices/reportsSlice"
import userReducer from "./slices/userSlice";
import gazetteReducer from "./slices/gazetteSlice";
import gpReducer from "./slices/gpSlice"
import analyticsReducer from "./slices/analyticsSlice"
import scannerReducer from "./slices/scannerSlice";
import extractorReducer from "./slices/extractorSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    records: recordsReducer,
    courts: courtsReducer,
    reports: reportsReducer,
    user: userReducer,
    gazette: gazetteReducer,
    gp: gpReducer,
    analytics: analyticsReducer,
    scanner: scannerReducer,
    extractor: extractorReducer
  },
});

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store; // 👈 add this