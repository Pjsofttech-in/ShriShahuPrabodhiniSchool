import api from "../utils/api.js";

export async function fetchDistricts() {
  const response = await api.get("/api/districts");
  return response.data || [];
}

export async function fetchTalukas(districtId) {
  const response = await api.get(`/api/talukas/district/${districtId}`);
  return response.data || [];
}

export async function fetchCenters(talukaId) {
  const response = await api.get(`/api/centers/taluka/${talukaId}`);
  return response.data || [];
}

export async function fetchCoordinators() {
  const response = await api.get("/api/coordinators");
  return response.data || [];
}

export async function fetchStudents(query = {}) {
  const response = await api.get("/api/students", { params: query });
  return response.data || [];
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

export async function createRazorpayOrder(amount) {
  try {
    const response = await api.post("/api/razorpay/order", { amount });
    return response.data;
  } catch (error) {
    console.error("Could not create Razorpay order", error);
    return null;
  }
}
