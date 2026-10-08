import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
export function ProtectedRoute({ roles, loginPath }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="state-card" role="status">
        Checking session...
      </div>
    );
  if (!user || !roles.includes(user.role))
    return <Navigate to={loginPath} replace />;
  if (user.role !== "SUPER_ADMIN" && !user.tenantId)
    return (
      <div className="state-card" role="alert">
        Your account needs a store assignment. Contact the platform owner.
      </div>
    );
  return <Outlet />;
}
