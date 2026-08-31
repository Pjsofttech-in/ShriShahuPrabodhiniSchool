import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/g, "");
const API_REQUEST_BASE_URL = `${API_BASE_URL.replace(/(?:\/api)+$/i, "")}/api`;
const STATIC_ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

function getAuthToken() {
  const token = sessionStorage.getItem("ssp_token") || STATIC_ADMIN_TOKEN;
  return token ? token.replace(/^Bearer\s+/i, "").trim() : "";
}

function isPublicRequest(config) {
  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";

  return method === "post" && url.includes("/auth/") && url.includes("/login");
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
  try {
    if (token && !isPublicRequest(config)) {
      // Attach Bearer token without template literal to avoid interpolation
      config.headers = config.headers || {};
      config.headers.Authorization = 'Bearer ' + token;
    }
  } catch (err) {
    console.error('Failed to attach auth header', err);
  }
  return config;
});

export function setAuthToken(token) {
  if (token) {
    sessionStorage.setItem("ssp_token", String(token).replace(/^Bearer\s+/i, "").trim());
  } else {
    sessionStorage.removeItem("ssp_token");
  }
}

export { API_BASE_URL };
export default api;
