import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/g, "");
const API_REQUEST_BASE_URL = API_BASE_URL;
const STATIC_ADMIN_TOKEN = import.meta.env.VITE_PUBLIC_API_TOKEN || import.meta.env.VITE_ADMIN_TOKEN || "";

const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || "admin@gmail.com",
  password: import.meta.env.VITE_ADMIN_PASSWORD || "123",
};

let cachedAdminToken = "";
let adminTokenExpiresAt = 0;
let tokenFetchPromise = null;

function normalizeToken(rawToken) {
  if (!rawToken) return "";
  const token = String(rawToken).trim();
  return token.replace(/^Bearer\s+/i, "").trim();
}

function getTokenExpiration(token) {
  try {
    const value = normalizeToken(token);
    if (!value) return Number.MAX_SAFE_INTEGER;

    const parts = value.split(".");
    if (parts.length !== 3) return Number.MAX_SAFE_INTEGER;

    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ? payload.exp * 1000 : Number.MAX_SAFE_INTEGER;
  } catch (error) {
    return Number.MAX_SAFE_INTEGER;
  }
}

function isTokenValid(token, expiresAt) {
  return !!token && Date.now() < (expiresAt - 60000);
}

function extractTokenFromResponse(response) {
  if (!response) return "";

  const data = response?.data ?? {};
  const headerToken =
    response?.headers?.authorization ||
    response?.headers?.Authorization ||
    response?.headers?.get?.("authorization");

  const candidates = [
    data?.token,
    data?.accessToken,
    data?.access_token,
    data?.jwt,
    data?.data?.token,
    data?.data?.accessToken,
    data?.data?.access_token,
    data?.result?.token,
    data?.result?.accessToken,
    data?.result?.access_token,
    data?.auth?.token,
    data?.auth?.accessToken,
    headerToken,
  ];

  const token = candidates.find((value) => typeof value === "string" && value.trim());
  return normalizeToken(token || "");
}

async function fetchFreshAdminToken() {
  if (tokenFetchPromise) return tokenFetchPromise;

  tokenFetchPromise = (async () => {
    const loginEndpoints = [
      `${API_BASE_URL}/api/auth/admin/login`,
      `${API_BASE_URL}/api/api/auth/admin/login`,
      `${API_BASE_URL}/api/admin/login`,
      `${API_BASE_URL}/api/api/admin/login`,
    ];

    let lastError = null;

    for (const endpoint of loginEndpoints) {
      try {
        if (!ADMIN_CREDENTIALS.username || !ADMIN_CREDENTIALS.password) {
          throw new Error("Admin credentials are not configured. Set VITE_ADMIN_USERNAME and VITE_ADMIN_PASSWORD.");
        }

        const response = await axios.post(endpoint, ADMIN_CREDENTIALS, { timeout: 10000 });
        const token = extractTokenFromResponse(response);

        if (token) {
          cachedAdminToken = token;
          adminTokenExpiresAt = getTokenExpiration(token);
          setAdminToken(token);
          return token;
        }

        throw new Error("Live admin login did not return a token.");
      } catch (error) {
        lastError = error;
        console.warn(`Admin token fetch failed at ${endpoint}:`, error?.message || error);
      }
    }

    const staticToken = normalizeToken(STATIC_ADMIN_TOKEN);
    if (staticToken) {
      cachedAdminToken = staticToken;
      adminTokenExpiresAt = getTokenExpiration(staticToken);
      setAdminToken(staticToken);
      return staticToken;
    }

    throw lastError || new Error("No admin token available.");
  })();

  try {
    return await tokenFetchPromise;
  } finally {
    tokenFetchPromise = null;
  }
}

async function getAdminToken() {
  const storedToken = getStoredToken("admin_token");
  if (storedToken && isTokenValid(storedToken, getTokenExpiration(storedToken))) {
    return storedToken;
  }

  if (isTokenValid(cachedAdminToken, adminTokenExpiresAt)) {
    return cachedAdminToken;
  }

  return fetchFreshAdminToken();
}

function getAuthToken() {
  return getStoredToken("ssp_token");
}

function getStoredToken(...storageKeys) {

  for (const key of storageKeys) {
    const value = sessionStorage.getItem(key) || localStorage.getItem(key) || "";
    const token = normalizeToken(value);

    if (token) return token;
  }

  return "";
}

function isPublicRequest(config) {
  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";

  return method === "post" && url.includes("/auth/") && url.includes("/login");
}

function isProtectedCategoryEndpoint(url = "") {
  return url.includes("/api/api/categories") || url.includes("/api/categories") || url.includes("/api/test-series/categories") || url.includes("/api/testSeries/categories") || url.includes("/api/testseries/categories");
}

function isLeaderboardEndpoint(url = "") {
  return url.includes("/api/api/leaderboard/") || url.includes("/api/leaderboard/");
}

const api = axios.create({
  baseURL: API_REQUEST_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  if (typeof config.url === "string") {
    config.url = config.url.replace(/^\/api\/api(?=\/|$)/i, "/api");
  }

  const token = getAuthToken();
  const isPublic = isPublicRequest(config);
  const isProtected = isProtectedCategoryEndpoint(config.url) || isLeaderboardEndpoint(config.url) || config.url?.includes("/createContactForm");

  let tokenToUse = token;
  const tokenIsMissingOrExpired = !tokenToUse || !isTokenValid(tokenToUse, getTokenExpiration(tokenToUse));

  if (isProtected && tokenIsMissingOrExpired) {
    try {
      tokenToUse = await getAdminToken();
    } catch (error) {
      console.error("Could not fetch live admin token for protected endpoint:", error?.message || error);
    }
  }

  try {
    if (isPublic) {
      delete config.headers?.Authorization;
    } else if (tokenToUse) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${tokenToUse}`;
    }
  } catch (error) {
    console.error("Failed to attach auth header", error);
  }

  return config;
});

export function setAuthToken(token) {
  const normalized = normalizeToken(token);

  if (normalized) {
    sessionStorage.setItem("ssp_token", normalized);
    localStorage.setItem("ssp_token", normalized);
    return;
  }

  sessionStorage.removeItem("ssp_token");
  localStorage.removeItem("ssp_token");
}

function setAdminToken(token) {
  const normalized = normalizeToken(token);

  if (normalized) {
    sessionStorage.setItem("admin_token", normalized);
    localStorage.setItem("admin_token", normalized);
    return;
  }

  sessionStorage.removeItem("admin_token");
  localStorage.removeItem("admin_token");
}

export { API_BASE_URL };
export default api;
