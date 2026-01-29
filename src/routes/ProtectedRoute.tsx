import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  const location = useLocation();
  // We now use isAuthenticated and user from the updated auth slice
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  // 1. If we are still checking cookies, show nothing (or a small spinner)
  // This acts as a secondary safety net to the check in App.tsx
  if (loading) {
    return null; 
  }

  // 2. Not logged in → redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role-Based Access Control (RBAC)
  
  // User trying to access an Admin-only route
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin trying to access a standard User route (Optional: depends on your UX preference)
  // If you want Admins to be restricted ONLY to the admin panel:
  if (!adminOnly && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};