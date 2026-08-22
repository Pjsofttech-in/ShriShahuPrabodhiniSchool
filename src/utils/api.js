import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");
const STATIC_ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

function getAuthToken() {
  return sessionStorage.getItem("ssp_token") || STATIC_ADMIN_TOKEN;
}

function isPublicRequest(config) {
  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";

  if (url === "/api/auth/login") return true;
  if (method === "post" && [
    "/api/students",
    "/api/payments/create-order",
    "/api/payments/verify",
  ].includes(url)) {
    return true;
  }

  if (method === "get" && (
    url === "/api/districts" ||
    url === "/api/downloads" ||
    url.startsWith("/api/downloads/") ||
    url === "/api2/getAllCourses" ||
    url === "/api2/contact-us" ||
    url.startsWith("/api/talukas") ||
    url.startsWith("/api/centers/taluka/") ||
    url.startsWith("/api/coordinators/center/")
  )) {
    return true;
  }

  if (method === "get" && url === "/api/students") {
    return Boolean(config.params?.mobile || config.params?.rollNo);
  }

  return false;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && !isPublicRequest(config)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAuthToken(token) {
  if (token) {
    sessionStorage.setItem("ssp_token", token);
  } else {
    sessionStorage.removeItem("ssp_token");
  }
}

export { API_BASE_URL };
export default api;
