import api from "../utils/api.js";

const DYNAMIC_PROFILE_URL =
  import.meta.env.VITE_DYNAMIC_PROFILE_URL || window.location.hostname;

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

function getRelatedDistrictId(taluka) {
  return (
    taluka?.districtId ??
    taluka?.district_id ??
    taluka?.district?.id ??
    taluka?.district?.districtId ??
    taluka?.district?.district_id ??
    null
  );
}

function filterTalukasByDistrict(talukas, districtId) {
  const selectedDistrictId = String(districtId);
  const relatedTalukas = talukas.filter((taluka) => {
    const relatedDistrictId = getRelatedDistrictId(taluka);
    return relatedDistrictId !== null && String(relatedDistrictId) === selectedDistrictId;
  });

  const hasDistrictRelationship = talukas.some(
    (taluka) => getRelatedDistrictId(taluka) !== null
  );
  return hasDistrictRelationship ? relatedTalukas : talukas;
}

export async function fetchDistricts() {
  return requestFirstAvailable(["/api/districts"], "districts");
}

export async function fetchTalukas(districtId) {
  if (!districtId) return [];
  const talukas = await requestFirstAvailable(
    [
      `/api/talukas/district/${encodeURIComponent(districtId)}`,
      `/api/talukas?districtId=${encodeURIComponent(districtId)}`,
    ],
    "talukas"
  );

  return filterTalukasByDistrict(talukas, districtId);
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
    [`/api/centers/taluka/${encodeURIComponent(talukaId)}`],
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
  return normalizeList(response.data);
}

export async function fetchContactInfo() {
  try {
    const response = await api.get("/api2/contact-us");
    const payload = response?.data || {};

    return {
      id: payload.id ?? null,
      address: payload.address ?? "",
      contactNo: payload.contactNo ?? "",
      email: payload.email ?? "",
      mapLink: payload.mapLink ?? "",
    };
  } catch (error) {
    console.error("Failed to fetch contact information:", error);
    return null;
  }
}

export async function fetchCourses() {
  const response = await api.get("/api2/getAllCourses", {
    params: { url: DYNAMIC_PROFILE_URL },
  });

  return normalizeList(response.data).map((course) => ({
    id: course?.id,
    name: course?.courseName ?? "",
    desc: course?.courseDescription ?? "",
    image: course?.courseImage ?? "",
    color: course?.courseColor ?? "",
    duration: course?.duration ?? "",
    fee: course?.price != null ? String(course.price) : "",
  }));
}

export async function fetchDownloads() {
  const response = await api.get("/api/downloads");
  const downloadList = normalizeList(response.data);

  return downloadList.map((item, index) => {
    const title = item?.title ?? item?.name ?? item?.fileName ?? `Download ${index + 1}`;
    const fileUrl =
      item?.filePath ??
      item?.fileUrl ??
      item?.pdf ??
      item?.pdfUrl ??
      item?.url ??
      item?.link ??
      item?.file ??
      "#";

    return {
      id: item?.id ?? index + 1,
      title,
      file: fileUrl,
      fileName: item?.fileName ?? item?.name ?? title,
      description: item?.description ?? "",
      size: item?.size ?? item?.fileSize ?? "",
      pdf: fileUrl,
    };
  });
}

export async function fetchStudentById(studentId) {
  const response = await api.get(`/api/students/${encodeURIComponent(studentId)}`);
  const payload = response.data;
  return payload?.data ?? payload?.student ?? payload?.user ?? payload;
}

export async function fetchStudentByRollNo(rollNo) {
  const response = await api.get("/api/students", { params: { rollNo } });
  const payload = response.data;
  const students = Array.isArray(payload)
    ? payload
    : payload?.data || payload?.content || payload?.items || payload?.students || [];
  const student = Array.isArray(students) ? students[0] : students;
  return student || null;
}

export async function fetchStudentByMobile(mobile) {
  if (!mobile) return null;
  const response = await api.get("/api/students", { params: { mobile } });
  const payload = response.data;
  const students = Array.isArray(payload)
    ? payload
    : payload?.data || payload?.content || payload?.items || payload?.students || [];
  const student = Array.isArray(students) ? students[0] : students;
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
