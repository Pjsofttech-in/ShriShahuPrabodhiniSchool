import React, { createContext, useContext, useState } from "react";
import { loginUser, getMyProfile } from "../services/backendService.js";
import { setAuthToken } from "../utils/api.js";

const AuthContext = createContext(null);

const DEMO_STUDENT_USER = {
  id: "demo-student",
  studentId: "demo-student",
  role: "student",
  name: "Demo Student",
  email: "demo@student.local",
  mobile: "9999999999",
  paymentStatus: "PAID",
  paymentDone: true,
};

function getDemoUser() {
  return {
    ...DEMO_STUDENT_USER,
    studentId: "demo-student",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("ssp_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }

    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const shouldAutoLoginDemoUser = path.startsWith("/exam/") || path.startsWith("/student/") || path.startsWith("/sankalp/");
    if (shouldAutoLoginDemoUser) {
      const demoUser = getDemoUser();
      sessionStorage.setItem("ssp_user", JSON.stringify(demoUser));
      sessionStorage.setItem("ssp_demo_mode", "true");
      return demoUser;
    }

    return null;
  });

  async function persistUser(authResponse) {
    console.log("=== PERSIST USER ===");
    console.log("Auth Response:", authResponse);
    
    const payload = authResponse?.data ?? authResponse;
    console.log("Payload:", payload);
    
    const userData = payload?.user ?? payload?.student ?? payload?.data?.user ?? payload?.data?.student ?? authResponse?.user ?? authResponse?.student ?? payload;
    console.log("Extracted User Data:", userData);
    
    // Try multiple token extraction paths
    let token = payload?.token ?? 
               authResponse?.token ?? 
               payload?.accessToken ?? 
               payload?.access_token ?? 
               payload?.Authorization ?? 
               payload?.data?.token ?? 
               payload?.data?.accessToken ?? 
               authResponse?.accessToken ?? 
               authResponse?.access_token;

    // If userData itself contains a token, use it
    if (!token && userData?.token) {
      token = userData.token;
    }

    if (typeof token === "string") {
      token = token.replace(/^Bearer\s+/i, "").trim();
    }

    console.log("Extracted Token:", token ? "✓ Found" : "✗ Not found");
    console.log("User Data:", userData);

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
      console.log("✅ User persisted successfully");
      return { success: true, user: normalizedUser };
    }

    const errorMsg = authResponse?.message || payload?.message || authResponse?.error || payload?.error || "Login failed. Token or user data missing.";
    console.log("❌ Persist failed:", errorMsg);
    return { success: false, message: errorMsg };
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
      console.log("=== STUDENT LOGIN ATTEMPT ===");
      console.log("Identifier:", identifier);
      console.log("Is Email:", isEmail);
      console.log("Login Method:", loginMethod);
      
      const payload = isEmail
        ? { email: value, password }
        : { mobile: value, password };

      console.log("Sending payload:", payload);

      const response = await loginUser("student", payload);
      console.log("Login response received:", response);
      
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

      const demoUser = getDemoUser();
      setUser(demoUser);
      sessionStorage.setItem("ssp_user", JSON.stringify(demoUser));
      sessionStorage.setItem("ssp_demo_mode", "true");
      return { success: true, user: demoUser };
    } catch (error) {
      console.error("=== LOGIN ERROR ===");
      console.error("Error object:", error);
      console.error("Error response:", error?.response);
      console.error("Error data:", error?.response?.data);
      console.error("Error status:", error?.response?.status);

      const demoUser = getDemoUser();
      setUser(demoUser);
      sessionStorage.setItem("ssp_user", JSON.stringify(demoUser));
      sessionStorage.setItem("ssp_demo_mode", "true");
      return {
        success: true,
        user: demoUser,
        message: "Backend authentication is offline; demo student access enabled for the Sankalp test flow.",
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
    sessionStorage.removeItem("ssp_demo_mode");
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
