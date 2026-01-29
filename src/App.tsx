import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

//import { AppDispatch, RootState } from "./store/store";
import { refreshSession } from "./store/slices/authSlice";

// Components & Routes
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { UserLayout } from "./components/user/UserLayout";
import DashboardPage from "./pages/user/Dashboard";
import RecordsPage from "./pages/user/Records";
import CreateRecordPage from "./pages/user/CreateRecord";
import ReportsPage from "./pages/user/Reports";
import NotForwardedPage from "./pages/user/NotForwarded";

// Admin
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminRecordsPage } from "./pages/admin/AdminRecordsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { Login } from "./pages/auth/Login";
import type { AppDispatch, RootState } from "./store/store";
import ScansPage from "./pages/user/Scans";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // 1. On mount, check if HttpOnly cookies are valid and get user profile
    dispatch(refreshSession());
  }, [dispatch]);

  // 2. Prevent the Router from rendering until we know the auth status.
  // This is the key to stopping the "Redirect to Login" loop on refresh.
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a3a32] text-white">
        <img 
          src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png" 
          alt="Judiciary" 
          className="w-24 mb-4 animate-pulse" 
        />
        <p className="text-sm tracking-widest uppercase opacity-70">Initializing Portal...</p>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* ========== USER ROUTES ========== */}
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
                <ReportsPage/>
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/records/gp"
          element={
            <ProtectedRoute>
              <UserLayout>
                <NotForwardedPage/>
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/records/scans"
          element={
            <ProtectedRoute>
              <UserLayout>
                <ScansPage/>
              </UserLayout>
            </ProtectedRoute>
          }
        />

        {/* ========== ADMIN ROUTES ========== */}
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
        
        {/* Catch-all or Default Redirect could go here */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;