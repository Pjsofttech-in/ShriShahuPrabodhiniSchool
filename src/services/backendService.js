import api from "../utils/api.js";

function looksLikeEntity(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const keys = Object.keys(value);
  return keys.some((key) => [
    "id",
    "_id",
    "districtId",
    "talukaId",
    "schoolId",
    "centerId",
    "coordinatorId",
    "districtName",
    "talukaName",
    "schoolName",
    "centerName",
    "coordinatorName",
    "name",
    "label",
    "fullName",
  ].includes(key));
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const queue = [payload];
  const visited = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    if (visited.has(current)) continue;
    visited.add(current);

    if (Array.isArray(current)) return current;

    for (const key of [
      "data",
      "content",
      "items",
      "list",
      "rows",
      "result",
      "records",
      "values",
      "districts",
      "talukas",
      "schools",
      "centers",
      "coordinators",
      "students",
      "users",
    ]) {
      const value = current[key];
      if (Array.isArray(value)) return value;
      if (value && typeof value === "object") queue.push(value);
    }

    if (looksLikeEntity(current)) return [current];
  }

  return [];
}

async function requestFirstAvailable(endpoints, label) {
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      const items = normalizeList(response.data);
      if (items.length > 0) return items;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.warn(`No data returned for ${label}. Last backend error:`, lastError.message || lastError);
  }

  return [];
}

export async function fetchDistricts() {
  return requestFirstAvailable(["/api/districts"], "districts");
}

export async function fetchTalukas(districtId) {
  if (!districtId) return [];
  return requestFirstAvailable(
    [
      `/api/talukas/district/${encodeURIComponent(districtId)}`,
      `/api/talukas?districtId=${encodeURIComponent(districtId)}`,
      "/api/talukas",
    ],
    "talukas"
  );
}

export async function fetchSchools(talukaId) {
  if (!talukaId) return [];
  return requestFirstAvailable(
    [
      `/api/schools/taluka/${encodeURIComponent(talukaId)}`,
      `/api/schools?talukaId=${encodeURIComponent(talukaId)}`,
      "/api/schools",
    ],
    "schools"
  );
}

export async function fetchCenters(talukaId) {
  if (!talukaId) return [];
  return requestFirstAvailable(
    [
      `/api/centers/taluka/${encodeURIComponent(talukaId)}`,
      `/api/centers?talukaId=${encodeURIComponent(talukaId)}`,
      "/api/centers",
    ],
    "centers"
  );
}

export async function fetchCoordinators(centerId = null) {
  if (centerId) {
    return requestFirstAvailable(
      [
        `/api/coordinators/center/${encodeURIComponent(centerId)}`,
        `/api/coordinators?centerId=${encodeURIComponent(centerId)}`,
      ],
      "coordinators"
    );
  }

  return requestFirstAvailable(["/api/coordinators"], "coordinators");
}

export async function fetchStudents(query = {}) {
  const response = await api.get("/api/students", { params: query });
  const payload = response.data;
  return Array.isArray(payload) ? payload : payload?.data || payload?.content || payload?.items || payload?.result || payload?.students || [];
}

export async function fetchStudentById(studentId) {
  const response = await api.get(`/api/students/${encodeURIComponent(studentId)}`);
  return response.data;
}

export async function fetchStudentByRollNo(rollNo) {
  const response = await api.get("/api/students", { params: { rollNo } });
  const student = Array.isArray(response.data) ? response.data[0] : response.data;
  return student || null;
}

export async function fetchStudentByMobile(mobile) {
  if (!mobile) return null;
  const response = await api.get("/api/students", { params: { mobile } });
  const student = Array.isArray(response.data) ? response.data[0] : response.data;
  return student || null;
}

export async function registerStudent(payload) {
  const response = await api.post("/api/students", payload);
  return response.data;
}

export async function loginUser(role, credentials) {
  const response = await api.post("/api/auth/login", { role, ...credentials });
  return response.data;
}

export async function getMyProfile() {
  const response = await api.get("/api/auth/me");
  return response.data;
}

export async function createRazorpayOrder(amount, mobileNo) {
  try {
    const response = await api.post("/api/payments/create-order", {
      amount,
      mobileNo,
      paymentStatus: "PENDING",
    });

    return response.data;
  } catch (error) {
    console.error(
      "Could not create Razorpay order:",
      error?.response?.data || error
    );

    throw error;
  }
}

export async function verifyRazorpayPayment({ orderId, paymentId, signature }) {
  try {
    const response = await api.post("/api/payments/verify", {
      orderId,
      paymentId,
      signature,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Payment verification failed:",
      error?.response?.data || error
    );

    throw error;
  }
}
