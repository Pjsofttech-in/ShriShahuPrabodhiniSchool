import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/g, "");
const API_REQUEST_BASE_URL = `${API_BASE_URL.replace(/(?:\/api)+$/i, "")}/api`;
const STATIC_ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

function getAuthToken() {
  const sessionToken = sessionStorage.getItem("ssp_token");
  return sessionToken ? sessionToken.replace(/^Bearer\s+/i, "").trim() : "";
}

function isPublicRequest(config) {
  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";

  // Login must remain unauthenticated. Other requests use the live session token when available.
  if (method === "post" && url.includes("/auth/") && url.includes("/login")) {
    return true;
  }
  return false;
}

const api = axios.create({
  baseURL: API_REQUEST_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof config.url === "string") {
    config.url = config.url.replace(/^\/api\/api(?=\/|$)/i, "/api");
  }

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
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header ADDED for protected endpoint");
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
    sessionStorage.setItem("ssp_token", String(token).replace(/^Bearer\s+/i, "").trim());
  } else {
    sessionStorage.removeItem("ssp_token");
  }
}

export { API_BASE_URL };
export default api;
