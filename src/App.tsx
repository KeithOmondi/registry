import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

// Ensure these types are correctly exported from your store.ts
import type { RootState, AppDispatch } from "./store/store";

import { refreshSession } from "./store/slices/authSlice";
import { fetchMyProfile } from "./store/slices/userSlice"; 
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { UserLayout } from "./components/user/UserLayout";
import { AdminLayout } from "./components/admin/AdminLayout";

import DashboardPage from "./pages/user/Dashboard";
import RecordsPage from "./pages/user/Records";
import CreateRecordPage from "./pages/user/CreateRecord";
import ReportsPage from "./pages/user/Reports";
import NotForwardedPage from "./pages/user/NotForwarded";
import ScansPage from "./pages/user/Scans";

import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { Login } from "./pages/auth/Login";
import AdminRecordsPage from "./pages/admin/AdminRecordsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminEntryPage from "./pages/admin/AdminEntry";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  
  // FIX: Explicitly typing the state in useSelector fixes the 'unknown' error
  const { status, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { loading: userLoading } = useSelector((state: RootState) => state.user);

  /* =====================================
      1. REFRESH SESSION ON MOUNT
  ===================================== */
  useEffect(() => {
    dispatch(refreshSession());
  }, [dispatch]);

  /* =====================================
      2. HYDRATE USER PROFILE
  ===================================== */
  useEffect(() => {
    // If the session is valid but we don't have the user profile yet, fetch it
    if (isAuthenticated) {
      dispatch(fetchMyProfile());
    }
  }, [isAuthenticated, dispatch]);

  /* =====================================
      3. GLOBAL LOADING STATE
  ===================================== */
  // We stay in loading state if auth is checking OR if we are logged in but fetching the name
  if (status === "loading" || (isAuthenticated && userLoading)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F9F9F7]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-[#004832] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xl">⚖️</div>
        </div>
        <p className="mt-4 text-[#004832] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* USER ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserLayout>
                <DashboardPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <UserLayout>
                <RecordsPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/records/create"
          element={
            <ProtectedRoute>
              <UserLayout>
                <CreateRecordPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/records/reports"
          element={
            <ProtectedRoute>
              <UserLayout>
                <ReportsPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/records/gp"
          element={
            <ProtectedRoute>
              <UserLayout>
                <NotForwardedPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/records/scans"
          element={
            <ProtectedRoute>
              <UserLayout>
                <ScansPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/records"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminRecordsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminReportsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/entries"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminEntryPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;