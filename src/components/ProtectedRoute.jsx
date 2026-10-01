import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();
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
    return <Navigate to="/login" replace state={{ next: `${location.pathname}${location.search}`, nextState: location.state }} />;
  }

  return children;
}
