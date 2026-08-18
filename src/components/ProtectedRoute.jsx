import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const currentRole = String(user?.role || user?.userRole || "").toLowerCase();
  const expectedRole = String(role || "").toLowerCase();

  if (!user || (currentRole !== expectedRole && !currentRole.includes(expectedRole))) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
