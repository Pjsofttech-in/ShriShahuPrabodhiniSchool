import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/g, "");
const API_REQUEST_BASE_URL = `${API_BASE_URL.replace(/(?:\/api)+$/i, "")}/api`;
const STATIC_ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "";

// Admin credentials for fetching live token
const ADMIN_CREDENTIALS = {
  email: "admin@gmail.com",
  password: "Admin@123"
};

// Token caching
let cachedAdminToken = "";
let adminTokenExpiresAt = 0;
let tokenFetchPromise = null;

// Extract expiration from JWT token
function getTokenExpiration(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return 0;
    const payload = JSON.parse(atob(parts[1]));
    return (payload.exp || 0) * 1000; // Convert to milliseconds
  } catch (e) {
    return 0;
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
      console.log("🔄 Fetching fresh admin token from backend...");
      const response = await axios.post(`${API_REQUEST_BASE_URL}/auth/admin/login`, ADMIN_CREDENTIALS, {
        timeout: 10000
      });
      
      const token = response?.data?.token || response?.data?.accessToken || response?.data?.data?.token;
      
      if (token) {
        cachedAdminToken = String(token).replace(/^Bearer\s+/i, "").trim();
        adminTokenExpiresAt = getTokenExpiration(cachedAdminToken);
        console.log("✅ Fresh admin token fetched from backend", {
          expiresAt: new Date(adminTokenExpiresAt).toISOString()
        });
        return cachedAdminToken;
      } else {
        throw new Error("No token in backend response");
      }
    } catch (error) {
      console.error("❌ Failed to fetch admin token:", {
        status: error?.response?.status,
        message: error?.message
      });
      
      // Fallback to static token if available
      if (STATIC_ADMIN_TOKEN) {
        cachedAdminToken = STATIC_ADMIN_TOKEN;
        adminTokenExpiresAt = getTokenExpiration(STATIC_ADMIN_TOKEN);
        console.log("⚠️ Using fallback static token from .env");
        return cachedAdminToken;
      }
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
  return sessionToken ? sessionToken.replace(/^Bearer\s+/i, "").trim() : "";
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

api.interceptors.request.use(async (config) => {
  if (typeof config.url === "string") {
    config.url = config.url.replace(/^\/api\/api(?=\/|$)/i, "/api");
  }

  const token = getAuthToken();
  const isPublic = isPublicRequest(config);
  const isEbookEndpoint = config.url?.includes("/vmMaterial") || config.url?.includes("/vmCategory") || config.url?.includes("/vmSubCategory");
  
  let tokenToUse = token;
  
  // For ebook endpoints: fetch fresh token from live backend if user not logged in
  if (isEbookEndpoint && !token) {
    try {
      tokenToUse = await getAdminToken();
      console.log("✅ Using fresh admin token from live backend for ebook request");
    } catch (error) {
      console.error("❌ Could not fetch admin token:", error.message);
    }
  }
  
  try {
    if (tokenToUse && !isPublic) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${tokenToUse}`;
      console.log("✅ Token ADDED", {
        type: isEbookEndpoint ? "ebook" : "protected",
        source: token ? "user-token" : "admin-token",
        url: config.url
      });
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
