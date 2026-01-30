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
  const { user, isAuthenticated, status, otpSent } = useSelector(
    (state: RootState) => state.auth
  );

  /* ======================
     1. Session still resolving
  ====================== */
  if (status === "loading") {
    // You can replace this with a spinner/skeleton if you want
    return null;
  }

  /* ======================
     2. Allow OTP verification route
     (user not authenticated yet)
  ====================== */
  if (
    otpSent &&
    !isAuthenticated &&
    location.pathname === "/verify-otp"
  ) {
    return <>{children}</>;
  }

  /* ======================
     3. Not authenticated → login
  ====================== */
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  /* ======================
     4. RBAC (Admin only)
  ====================== */
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  /* ======================
     5. Prevent admin accessing user-only routes
  ====================== */
  if (!adminOnly && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
