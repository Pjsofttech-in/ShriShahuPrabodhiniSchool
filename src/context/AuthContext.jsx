import React, { createContext, useContext, useState } from "react";
import { loginUser, getMyProfile } from "../services/backendService.js";
import { setAuthToken } from "../utils/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("ssp_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function persistUser(authResponse) {
    const payload = authResponse?.data ?? authResponse;
    const userData = payload?.user ?? payload?.student ?? authResponse?.user ?? authResponse?.student ?? payload;
    const token = payload?.token ?? authResponse?.token;

    if (token && userData) {
      const rawRole = userData.role || userData.userRole || userData.type || "student";
      const normalizedRole = String(rawRole).toLowerCase();
      const finalRole = normalizedRole.includes("admin") ? "admin" : normalizedRole.includes("coordinator") ? "coordinator" : normalizedRole.includes("student") ? "student" : "student";

      const normalizedUser = {
        ...userData,
        role: finalRole,
      };
      setAuthToken(token);
      setUser(normalizedUser);
      sessionStorage.setItem("ssp_user", JSON.stringify(normalizedUser));
      return { success: true, user: normalizedUser };
    }

    return { success: false, message: authResponse?.message || payload?.message || "Login failed." };
  }

  async function loginAdmin(username, password) {
    const response = await loginUser("admin", { username, password });
    return persistUser(response);
  }

  async function loginCoordinator(username, password) {
    const response = await loginUser("coordinator", { username, password });
    return persistUser(response);
  }

  async function loginStudent(identifier, password, loginMethod) {
    const value = String(identifier || "").trim();
    const isEmail = loginMethod === "email" || (!loginMethod && value.includes("@"));

    try {
      const payload = isEmail
        ? { email: value, password }
        : { mobile: value, password };

      const response = await loginUser("student", payload);
      const persisted = await persistUser(response);
      if (persisted.success) {
        const authPayload = response?.data ?? response;
        const responseUser = authPayload?.user ?? authPayload?.student ?? {};
        const enrichedUser = {
          ...persisted.user,
          ...(isEmail ? { email: value } : { mobile: value }),
          studentId:
            persisted.user?.studentId ??
            responseUser?.studentId ??
            responseUser?.student?.id ??
            (responseUser?.role ? responseUser?.id : undefined),
          rollNo: persisted.user?.rollNo ?? responseUser?.rollNo,
        };
        setUser(enrichedUser);
        sessionStorage.setItem("ssp_user", JSON.stringify(enrichedUser));
        return { ...persisted, user: enrichedUser };
      }

      return {
        success: false,
        message: response?.message || response?.error || "Invalid email, mobile number, or password.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Invalid email, mobile number, or password.",
      };
    }
  }

  async function refreshProfile() {
    try {
      const profile = await getMyProfile();
      if (profile) {
        setUser(profile);
        sessionStorage.setItem("ssp_user", JSON.stringify(profile));
      }
    } catch (err) {
      console.error("Profile refresh failed", err);
    }
  }

  function logout() {
    setAuthToken(null);
    setUser(null);
    sessionStorage.removeItem("ssp_user");
  }

  return (
    <AuthContext.Provider
      value={{ user, loginAdmin, loginCoordinator, loginStudent, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
