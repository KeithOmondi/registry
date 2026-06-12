import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import type { RootState, AppDispatch } from "./store/store";
import { refreshSession } from "./store/slices/authSlice";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import { UserLayout } from "./components/user/UserLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import GpLayout from "./components/gp/GpLayout";

/* ================= USER ================= */
import DashboardPage from "./pages/user/Dashboard";
import RecordsPage from "./pages/user/Records";
import CreateRecordPage from "./pages/user/CreateRecord";
import ReportsPage from "./pages/user/Reports";
import NotForwardedPage from "./pages/user/NotForwarded";
//import ScansPage from "./pages/user/Scans";

/* ================= ADMIN ================= */
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import AdminRecordsPage from "./pages/admin/AdminRecordsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminEntryPage from "./pages/admin/AdminEntry";
import AdminGpRecordsPage from "./pages/admin/AdminGpRecords";

/* ================= GP ================= */
import GpDashboard from "./pages/Gp/GpDashboard";
import GpRecordsPage from "./pages/Gp/Recods";
import RecordsFormPage from "./pages/Gp/RecordsForm";

/* ================= AUTH ================= */
import { Login } from "./pages/auth/Login";
import Analytics from "./pages/user/Analytics";
import ScannerPage from "./pages/user/ScannerPage";
import ProbateExtractor from "./pages/user/ProbateExtractor";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminScan from "./pages/admin/AdminScan";
import AdminCourts from "./pages/admin/AdminCourts";
import UserSettings from "./pages/user/UserSettings";

/* ================================================= */

function App() {
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated, status } = useSelector(
    (state: RootState) => state.auth,
  );

  /* =========================================
     Silent session restore (runs in background)
  ========================================= */
  useEffect(() => {
    dispatch(refreshSession());
  }, [dispatch]);

  /* =========================================
     Show loader ONLY if user already authenticated
  ========================================= */
  const showAppLoader = isAuthenticated && status === "loading";

  if (showAppLoader) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F9F9F7]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-[#004832] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            ⚖️
          </div>
        </div>

        <p className="mt-4 text-[#004832] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Restoring session...
        </p>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* ================= LOGIN ================= */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* ================= USER ROUTES ================= */}
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
                <ScannerPage />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/records/analytics"
          element={
            <ProtectedRoute>
              <UserLayout>
                <Analytics />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/records/extract"
          element={
            <ProtectedRoute>
              <UserLayout>
                <ProbateExtractor />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/records/settings"
          element={
            <ProtectedRoute>
              <UserLayout>
                <UserSettings />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}
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

        <Route
          path="/admin/gp"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminGpRecordsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminAnalytics />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/scan"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminScan />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courts"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <AdminCourts />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= GP ROUTES ================= */}
        <Route
          path="/gp"
          element={
            <ProtectedRoute gpOnly>
              <GpLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GpDashboard />} />
          <Route path="dashboard" element={<GpDashboard />} />
          <Route path="records" element={<GpRecordsPage />} />
          <Route path="form" element={<RecordsFormPage />} />
          <Route path="*" element={<Navigate to="/gp" replace />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
