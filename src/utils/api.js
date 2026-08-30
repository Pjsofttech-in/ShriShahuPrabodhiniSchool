import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/g, "");
const STATIC_ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

function getAuthToken() {
  const sessionToken = sessionStorage.getItem("ssp_token");
  
  // NEVER use static token - only use session token
  // Static token is only for environment setup, never for actual requests
  if (sessionToken) {
    console.log("Using session token for auth");
    return sessionToken;
  }
  
  console.log("No session token available");
  return "";
}

function isPublicRequest(config) {
  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";

  // Login endpoints - ALL public, NEVER send auth header
  if (method === "post" && url.includes("/auth/") && url.includes("/login")) {
    return true;
  }

  if (method === "post" && [
    "/api/students",
    "/api/payments/create-order",
    "/api/payments/verify",
    "/api2/createContactForm",
  ].includes(url)) {
    return true;
  }

  if (method === "get" && (
    url === "/api/districts" ||
    url === "/api/getAllSyllabus" ||
    url === "/api/downloads" ||
    url.startsWith("/api/downloads/") ||
    url.startsWith("/api2/") ||
    url.startsWith("/api/talukas") ||
    url.startsWith("/api/centers/taluka/") ||
    url.startsWith("/api/coordinators/center/") ||
    url === "/api/test-series" ||
    url.startsWith("/api/test-series/") ||
    url === "/api/exams" ||
    url.startsWith("/api/exams/")
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
  const isPublic = isPublicRequest(config);
  
  console.log("🔍 REQUEST INTERCEPTOR", {
    method: config.method?.toUpperCase(),
    url: config.url,
    isPublicRequest: isPublic,
    tokenExists: !!token,
    tokenLength: token ? token.length : 0,
    headersBeforAuth: { ...config.headers },
  });
  
  try {
    if (token && !isPublic) {
      config.headers = config.headers || {};
      config.headers.Authorization = 'Bearer ' + token;
      console.log("✅ Authorization header ADDED for protected endpoint");
    } else if (isPublic && config.headers?.Authorization) {
      console.log("⚠️  REMOVING Authorization header from public endpoint");
      delete config.headers.Authorization;
    } else if (isPublic) {
      console.log("✅ Public endpoint - NO Authorization header sent");
    }
  } catch (err) {
    console.error('❌ Failed to attach auth header', err);
  }
  
  console.log("Final headers:", config.headers);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("📥 RESPONSE RECEIVED", {
      status: response.status,
      url: response.config.url,
      dataKeys: Object.keys(response.data || {}),
      fullData: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ RESPONSE ERROR", {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      url: error?.config?.url,
      method: error?.config?.method,
      errorData: error?.response?.data,
      errorHeaders: error?.response?.headers,
    });
    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) {
    sessionStorage.setItem("ssp_token", token);
  } else {
    sessionStorage.removeItem("ssp_token");
  }
}

export { API_BASE_URL };
export default api;
