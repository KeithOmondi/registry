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
  const { user, isAuthenticated, loading, otpSent } = useSelector(
    (state: RootState) => state.auth
  );

  // 1. If still checking session → show nothing (or a spinner)
  if (loading) return null;

  // 2. Allow OTP page if OTP was sent but user is not yet authenticated
  // Assume OTP page is at /verify-otp
  if (otpSent && location.pathname === "/verify-otp") {
    return <>{children}</>;
  }

  // 3. Not logged in → redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Role-Based Access Control (RBAC)
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!adminOnly && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
