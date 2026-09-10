import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/g, "");
const API_REQUEST_BASE_URL = API_BASE_URL.replace(/(?:\/api)+$/i, "");

// Admin credentials for fetching live token
const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || "",
  password: import.meta.env.VITE_ADMIN_PASSWORD || "",
};

// Token caching
let cachedAdminToken = "";
let adminTokenExpiresAt = 0;
let tokenFetchPromise = null;

// Extract expiration from JWT token
function getTokenExpiration(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return Number.MAX_SAFE_INTEGER;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ? payload.exp * 1000 : Number.MAX_SAFE_INTEGER;
  } catch (e) {
    return Number.MAX_SAFE_INTEGER;
  }
}

// Check if cached token is still valid (with 60s buffer)
function isTokenValid(token, expiresAt) {
  return token && Date.now() < (expiresAt - 60000);
}

// Fetch fresh admin token from live backend
async function fetchFreshAdminToken() {
  // Prevent multiple simultaneous requests
  if (tokenFetchPromise) {
    return tokenFetchPromise;
  }

  tokenFetchPromise = (async () => {
    try {
      if (!ADMIN_CREDENTIALS.username || !ADMIN_CREDENTIALS.password) {
        throw new Error("Live admin credentials are not configured.");
      }

      const response = await axios.post(`${API_REQUEST_BASE_URL}/api/auth/admin/login`, ADMIN_CREDENTIALS, {
        timeout: 10000
      });
      
      const token = response?.data?.token ||
        response?.data?.accessToken ||
        response?.data?.access_token ||
        response?.data?.jwt ||
        response?.data?.data?.token ||
        response?.data?.data?.accessToken ||
        response?.data?.data?.access_token ||
        response?.data?.result?.token ||
        response?.data?.result?.accessToken ||
        response?.headers?.authorization ||
        response?.headers?.get?.("authorization");
      
      if (token) {
        cachedAdminToken = String(token).replace(/^Bearer\s+/i, "").trim();
        adminTokenExpiresAt = getTokenExpiration(cachedAdminToken);
        return cachedAdminToken;
      } else {
        throw new Error("No token in backend response");
      }
    } catch (error) {
      console.error("❌ Failed to fetch admin token:", {
        status: error?.response?.status,
        message: error?.message
      });
      
      throw error;
    } finally {
      tokenFetchPromise = null;
    }
  })();

  return tokenFetchPromise;
}

// Get admin token - returns cached if valid, otherwise fetches fresh
async function getAdminToken() {
  if (isTokenValid(cachedAdminToken, adminTokenExpiresAt)) {
    return cachedAdminToken;
  }
  return fetchFreshAdminToken();
}

const api = axios.create({
  baseURL: API_REQUEST_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

function getAuthToken() {
  const sessionToken = sessionStorage.getItem("ssp_token");
  const localToken = localStorage.getItem("ssp_token");
  const token = sessionToken || localToken;
  return token ? token.replace(/^Bearer\s+/i, "").trim() : "";
}

function isPublicRequest(config) {
  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";

  // Login must remain unauthenticated
  if (method === "post" && url.includes("/auth/") && url.includes("/login")) {
    return true;
  }

  return false;
}

function isEbookEndpoint(url = "") {
  return url.includes("/vmMaterial") || url.includes("/vmCategory") || url.includes("/vmSubCategory");
}

api.interceptors.request.use(async (config) => {
  if (typeof config.url === "string") {
    config.url = config.url.replace(/^\/api\/api(?=\/|$)/i, "/api");
  }

  const token = getAuthToken();
  const isPublic = isPublicRequest(config);
  const isAdminEndpoint = isEbookEndpoint(config.url) || config.url?.includes("/createContactForm");
  
  let tokenToUse = token;
  
  if (isAdminEndpoint && !token) {
    try {
      tokenToUse = await getAdminToken();
    } catch (error) {
      console.error("Could not fetch live admin token:", error.message);
    }
  }
  
  try {
    if (isPublic) {
      delete config.headers?.Authorization;
    } else if (tokenToUse) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${tokenToUse}`;
    }
  } catch (err) {
    console.error('❌ Failed to attach auth header', err);
  }
  
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
