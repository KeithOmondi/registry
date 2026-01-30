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
    (state: RootState) => state.auth,
  );

  if (status === "loading") return null; // or spinner

  if (otpSent && !isAuthenticated && location.pathname === "/verify-otp")
    return <>{children}</>;

  if (!isAuthenticated || !user)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (adminOnly && user.role !== "admin")
    return <Navigate to="/dashboard" replace />;
  if (!adminOnly && user.role === "admin")
    return <Navigate to="/admin" replace />;

  return <>{children}</>;
};
