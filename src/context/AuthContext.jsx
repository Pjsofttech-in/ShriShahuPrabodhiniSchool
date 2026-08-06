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
    if (authResponse?.token && authResponse?.user) {
      setAuthToken(authResponse.token);
      const u = authResponse.user;
      setUser(u);
      sessionStorage.setItem("ssp_user", JSON.stringify(u));
      return { success: true, user: u };
    }

    return { success: false, message: authResponse?.message || "Login failed." };
  }

  async function loginAdmin(username, password) {
    const response = await loginUser("admin", { username, password });
    return persistUser(response);
  }

  async function loginCoordinator(username, password) {
    const response = await loginUser("coordinator", { username, password });
    return persistUser(response);
  }

  async function loginStudent(rollNo, password) {
    const response = await loginUser("student", { rollNo, password });
    return persistUser(response);
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
