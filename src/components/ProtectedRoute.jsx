import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  let storedUser = null;

  try {
    storedUser = JSON.parse(sessionStorage.getItem("ssp_user") || "null");
  } catch {
    storedUser = null;
  }

  const activeUser = user || storedUser;
  const currentRole = String(activeUser?.role || activeUser?.userRole || "").toLowerCase();
  const expectedRole = String(role || "").toLowerCase();

  if (!activeUser || (currentRole !== expectedRole && !currentRole.includes(expectedRole))) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
