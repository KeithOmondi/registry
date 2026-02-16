import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  gpOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  gpOnly = false,
}) => {
  const location = useLocation();

  const { user, isAuthenticated, status, otpSent } = useSelector(
    (state: RootState) => state.auth,
  );

  /* =====================================
      1. AUTH LOADING
  ===================================== */
  if (status === "loading") return null; // or spinner

  /* =====================================
      2. OTP VERIFICATION FLOW
  ===================================== */
  if (otpSent && !isAuthenticated && location.pathname === "/verify-otp") {
    return <>{children}</>;
  }

  /* =====================================
      3. NOT AUTHENTICATED
  ===================================== */
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* =====================================
      4. ADMIN-ONLY ROUTES
  ===================================== */
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  /* =====================================
      5. GP-ONLY ROUTES
  ===================================== */
  if (gpOnly && user.role !== "gp") {
    return <Navigate to="/dashboard" replace />;
  }

  /* =====================================
      6. PREVENT ADMIN ACCESSING USER PAGES
  ===================================== */
  if (!adminOnly && !gpOnly && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  /* =====================================
      7. PREVENT GP ACCESSING USER PAGES
  ===================================== */
  if (!adminOnly && !gpOnly && user.role === "gp") {
    return <Navigate to="/gp" replace />;
  }

  return <>{children}</>;
};
