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
      "value",
      "values",
      "districts",
      "talukas",
      "schools",
      "centers",
      "coordinators",
      "students",
      "users",
      "answerKeys",
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

export async function submitContactForm(formData) {
  const response = await api.post("/api2/createContactForm", formData, {
    params: { url: DYNAMIC_PROFILE_URL },
  });
  return response.data;
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

export async function fetchHeroSections() {
  const response = await api.get("/api2/getAllHeroSections", {
    params: { url: DYNAMIC_PROFILE_URL },
  });

  return normalizeList(response.data).map((hero, index) => ({
    id: hero?.id ?? hero?.heroSectionId ?? index + 1,
    title: hero?.title ?? hero?.heroTitle ?? hero?.heroSectionTitle ?? "",
    subtitle:
      hero?.description ??
      hero?.heroDescription ??
      hero?.heroSectionDescription ??
      hero?.subtitle ??
      "",
    image:
      hero?.image ??
      hero?.heroImage ??
      hero?.heroSectionImage ??
      hero?.imageName ??
      hero?.heroImageName ??
      hero?.heroSectionImageName ??
      hero?.imageUrl ??
      "",
    link: hero?.url ?? hero?.link ?? hero?.buttonUrl ?? "#",
    linkLabel: hero?.buttonLabel ?? hero?.linkLabel ?? hero?.buttonText ?? "Learn More",
    priority: Number(hero?.priority ?? hero?.displayOrder ?? index),
  }));
}

export async function fetchAwards() {
  const response = await api.get("/api2/getAllAwards", {
    params: { url: DYNAMIC_PROFILE_URL },
  });

  return normalizeList(response.data).map((award, index) => ({
    id: award?.id ?? index + 1,
    title: award?.awardName ?? "Recognition",
    description: award?.description ?? "",
    by: award?.awardedBy ?? "Shri Shahu Prabodhini",
    awardedTo: award?.awardTo ?? "",
    year: award?.year ?? "",
    image: award?.awardImage ?? "",
  }));
}

export async function fetchToppers() {
  const response = await api.get("/api2/getAllToppers", {
    params: { url: DYNAMIC_PROFILE_URL },
  });

  return normalizeList(response.data).map((topper, index) => ({
    id: topper?.topperId ?? index + 1,
    name: topper?.name ?? "Sankalp Topper",
    score: topper?.totalMarks ?? "",
    className: topper?.className ?? "",
    post: topper?.post ?? "",
    rank: topper?.rank ?? "",
    year: topper?.year ?? "",
    image: topper?.topperImage || topper?.topperImages?.[0] || "",
    images: Array.isArray(topper?.topperImages) ? topper.topperImages : [],
  }));
}

export async function fetchGallery() {
  const response = await api.get("/api2/getAllGalleries", {
    params: { url: DYNAMIC_PROFILE_URL },
  });

  return normalizeList(response.data).map((gallery, index) => ({
    id: gallery?.galleryId ?? index + 1,
    eventName: gallery?.eventName ?? "",
    month: gallery?.month ?? "",
    title: gallery?.title ?? "Gallery",
    year: gallery?.year ?? "",
    link: gallery?.link ?? "",
    color: gallery?.galleryColor ?? "",
    images: Array.isArray(gallery?.galleryImages) ? gallery.galleryImages : [],
  }));
}

export async function fetchFaculties() {
  const response = await api.get("/api2/getAllFacilities", {
    params: { url: DYNAMIC_PROFILE_URL },
  });

  return normalizeList(response.data).map((faculty, index) => ({
    id: faculty?.id ?? index + 1,
    name: faculty?.facilityName ?? faculty?.facultyName ?? faculty?.name ?? "Faculty",
    experience: faculty?.experienceInYear ?? faculty?.experience ?? faculty?.experienceInYears ?? "",
    subject: faculty?.subject ?? faculty?.specialization ?? "",
    education: faculty?.facilityEducation ?? faculty?.facultyEducation ?? faculty?.education ?? "",
    description: faculty?.description ?? "",
    image: faculty?.facilityImage ?? faculty?.facilityImageName ?? faculty?.facultyImage ?? faculty?.image ?? faculty?.imageUrl ?? "",
  }));
}

export async function fetchTestimonials() {
  const response = await api.get("/api2/getAllTestimonials", {
    params: { url: DYNAMIC_PROFILE_URL },
  });

  return normalizeList(response.data).map((testimonial, index) => ({
    id: testimonial?.testimonialId ?? index + 1,
    title: testimonial?.testimonialTitle ?? "Student voice",
    name: testimonial?.testimonialName ?? "Student",
    exam: testimonial?.exam ?? "",
    post: testimonial?.post ?? "",
    rank: testimonial?.rank ?? "",
    description: testimonial?.description ?? "",
    image: testimonial?.testimonialImage ?? "",
  }));
}

export async function fetchAboutUs() {
  const response = await api.get("/api2/getAllAboutUs", {
    params: { url: DYNAMIC_PROFILE_URL },
  });
  return normalizeList(response.data).map((about, index) => ({
    id: about?.id ?? index + 1,
    title: about?.aboutUsTitle ?? "About Shri Shahu Prabodhini",
    description: about?.aboutUsDescription ?? "",
    image: about?.aboutUsImage ?? "",
    years: about?.totalYearsOfExcellence ?? "",
    centers: about?.totalExamCenters ?? "",
    faculties: about?.totalFaculties ?? "",
    students: about?.totalStudents ?? "",
  }));
}

export async function fetchVisionMissions() {
  const response = await api.get("/api2/getAllVisionMissions", {
    params: { url: DYNAMIC_PROFILE_URL },
  });
  return normalizeList(response.data).map((visionMission, index) => ({
    id: visionMission?.id ?? index + 1,
    vision: visionMission?.vision ?? "",
    mission: visionMission?.mission ?? "",
    directorMessage: visionMission?.directorMessage ?? "",
    directorName: visionMission?.directorName ?? "",
    directorImage: visionMission?.directorImage ?? "",
    description: visionMission?.description ?? "",
  }));
}

export async function fetchNotifications() {
  const response = await api.get("/api2/notifications");
  return normalizeList(response.data).map((notification, index) => ({
    id: notification?.id ?? index + 1,
    title: notification?.title ?? "Notification",
    description: notification?.description ?? "",
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
      item?.image ??
      item?.file ??
      "#";

    return {
      id: item?.id ?? index + 1,
      title,
      file: fileUrl,
      fileName: item?.fileName ?? item?.name ?? title,
      description: item?.description ?? "",
      size: item?.size ?? item?.fileSize ?? "",
      publishedAt: item?.publishedAt ?? item?.publishedDate ?? item?.createdAt ?? "",
      pdf: fileUrl,
    };
  });
}

export async function fetchAnswerKeys() {
  const response = await api.get("/api/answerkeys");
  const answerKeyList = normalizeList(response.data);

  return answerKeyList
    .filter((item) => item?.active !== false)
    .map((item, index) => {
      const fileUrl =
        item?.pdfUrl ??
        item?.pdf ??
        item?.fileUrl ??
        item?.filePath ??
        item?.link ??
        item?.url ??
        "#";

      return {
        id: item?.id ?? index + 1,
        title: item?.title ?? `Answer Key ${index + 1}`,
        file: fileUrl,
        link: item?.link ?? "",
        examId: item?.examId,
        publishedAt: item?.publishedAt ?? item?.publishedDate ?? item?.createdAt ?? "",
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
