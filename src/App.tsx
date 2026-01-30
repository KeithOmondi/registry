import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import type { RootState, AppDispatch } from "./store/store";

import { refreshSession } from "./store/slices/authSlice";
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
import { AdminRecordsPage } from "./pages/admin/AdminRecordsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { Login } from "./pages/auth/Login";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(refreshSession());
  }, [dispatch]);

  if (status === "loading") return <div>Loading...</div>;

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

        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
