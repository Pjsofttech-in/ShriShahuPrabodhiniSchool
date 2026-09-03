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
      "syllabus",
      "answerKeys",
      "answerKey",
      "footers",
      "testSeries",
      "testSerieses",
      "exams",
      "attempts",
      "examAttempts",
      "exam_attempts",
      "results",
      "examResults",
      "questions",
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
  const payload = {
    name: String(formData?.name ?? "").trim(),
    mobileNo: String(formData?.mobileNo ?? "").trim(),
    email: String(formData?.email ?? "").trim(),
    course: String(formData?.course ?? "").trim(),
    subject: String(formData?.subject ?? "").trim(),
    academicYear: String(formData?.academicYear ?? "").trim(),
    description: String(formData?.description ?? "").trim(),
  };

  const response = await api.post("/api2/createContactForm", payload, {
    params: { url: DYNAMIC_PROFILE_URL },
  });

  return response.data;
}

export async function fetchFooter() {
  const response = await api.get("/api2/getAllFooters", {
    params: { url: DYNAMIC_PROFILE_URL },
  });
  const footer = normalizeList(response.data)[0];

  if (!footer) return null;

  return {
    title: footer.title ?? "",
    footerColor: footer.footerColor ?? footer.color ?? "",
    address: footer.address ?? "",
    phone: footer.mobileNumber ?? footer.mobileNo ?? footer.phone ?? footer.contactNo ?? "",
    email: footer.email ?? "",
    instagram: footer.instagramLink ?? footer.instagram ?? "",
    facebook: footer.facebookLink ?? footer.facebook ?? "",
    twitter: footer.twitterLink ?? footer.twitter ?? "",
    youtube: footer.youtubeLink ?? footer.youTubeLink ?? footer.youtube ?? "",
    whatsapp: footer.whatsappLink ?? footer.whatsAppLink ?? footer.whatsapp ?? "",
  };
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

export async function fetchFeatures() {
  const response = await api.get("/api2/getAllFeatures", {
    params: { url: DYNAMIC_PROFILE_URL },
  });

  return normalizeList(response.data).map((feature, index) => ({
    id: feature?.id ?? index + 1,
    title: feature?.title ?? "Feature",
    description: feature?.description ?? "",
    link: feature?.link ?? "",
    image: feature?.image ?? "",
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
    link: hero?.url ?? hero?.link ?? hero?.buttonUrl ?? "/register",
    linkLabel: hero?.buttonLabel ?? hero?.linkLabel ?? hero?.buttonText ?? "Register Now",
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

function normalizeExamEntry(entry, index = 0) {
  const exam = entry?.exam ?? entry?.testPaper ?? entry?.paper ?? entry?.examDetails ?? entry ?? {};

  const examId = exam?.examId ?? exam?.exam_id ?? entry?.examId ?? entry?.exam_id ?? exam?.id ?? entry?.id ?? index + 1;
  const examName = exam?.examName ?? exam?.name ?? exam?.title ?? entry?.title ?? `Test Paper ${index + 1}`;
  const examImage = exam?.image ?? exam?.imageUrl ?? exam?.examImage ?? exam?.photo ?? entry?.image ?? entry?.imageUrl ?? "";
  const examTotalMarks = exam?.totalMarks ?? exam?.marks ?? entry?.totalMarks ?? entry?.marks ?? "";
  const examTotalQuestions = exam?.totalQuestions ?? exam?.questions ?? entry?.totalQuestions ?? entry?.questions ?? "";
  const examDuration = exam?.duration ?? exam?.time ?? entry?.duration ?? entry?.time ?? "";

  return {
    id: examId,
    name: examName,
    image: examImage,
    totalMarks: examTotalMarks,
    totalQuestions: examTotalQuestions,
    duration: examDuration,
    maxAttempts: exam?.maxAttempts ?? entry?.maxAttempts ?? 1,
    startTime: exam?.startTime ?? entry?.startTime ?? "",
    endTime: exam?.endTime ?? entry?.endTime ?? "",
    testSeriesId: exam?.testSeriesId ?? exam?.testSeries?.id ?? entry?.testSeriesId ?? entry?.testSeries?.id ?? "",
    active: exam?.active !== false && entry?.active !== false,
    downloadTestPaper: exam?.downloadTestPaper === true || entry?.downloadTestPaper === true,
    sequence: entry?.sequence ?? exam?.sequence ?? index + 1,
  };
}

function extractLinkedExams(series) {
  const candidates = [
    series?.exams,
    series?.testSeriesExams,
    series?.testSeriesExam,
    series?.examList,
    series?.allExams,
    series?.tests,
    series?.testPapers,
    series?.papers,
  ];

  const flat = [];
  candidates.forEach((candidate) => {
    if (Array.isArray(candidate)) flat.push(...candidate);
  });

  if (!flat.length && series?.exam) flat.push(series.exam);

  return flat
    .map((entry, index) => normalizeExamEntry(entry, index))
    .filter((item) => item && (item.name || item.id || item.image));
}

function normalizeTestFeatures(series) {
  const source = Array.isArray(series?.features)
    ? series.features
    : [
        series?.testFeatureOne ?? series?.featureOne,
        series?.testFeatureTwo ?? series?.featureTwo,
        series?.testFeatureThree ?? series?.featureThree,
      ];

  return source
    .map((feature) => {
      if (typeof feature === "object") {
        return feature?.name ?? feature?.title ?? feature?.label ?? feature?.description ?? "";
      }
      return feature;
    })
    .map((feature) => String(feature ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 3);
}

export async function fetchTestSeries() {
  const response = await api.get("/api/test-series");
  return normalizeList(response.data).map((series, index) => ({
    id: series?.id ?? series?.testSeriesId ?? index + 1,
    title: series?.title ?? series?.name ?? "Test Series",
    description: series?.description ?? "",
    image: series?.image ?? series?.imageUrl ?? "",
    price: series?.price ?? null,
    sellingPrice: series?.sellingPrice ?? series?.salePrice ?? null,
    mrp: series?.mrp ?? null,
    subject: series?.subject ?? "",
    featureOne: series?.testFeatureOne ?? series?.featureOne ?? "",
    featureTwo: series?.testFeatureTwo ?? series?.featureTwo ?? "",
    featureThree: series?.testFeatureThree ?? series?.featureThree ?? "",
    features: normalizeTestFeatures(series),
    startDate: series?.startDate ?? "",
    endDate: series?.endDate ?? "",
    exams: extractLinkedExams(series),
  }));
}

export async function fetchTestSeriesById(id) {
  const response = await api.get(`/api/test-series/${id}`);
  const series = response.data?.data ?? response.data;
  const linkedExams = extractLinkedExams(series);

  if (linkedExams.length > 0) {
    return {
      id: series?.id ?? id,
      title: series?.title ?? series?.name ?? "Test Series",
      description: series?.description ?? "",
      image: series?.image ?? series?.imageUrl ?? "",
      price: series?.price ?? null,
      sellingPrice: series?.sellingPrice ?? series?.salePrice ?? null,
      mrp: series?.mrp ?? null,
      subject: series?.subject ?? "",
      featureOne: series?.testFeatureOne ?? series?.featureOne ?? "",
      featureTwo: series?.testFeatureTwo ?? series?.featureTwo ?? "",
      featureThree: series?.testFeatureThree ?? series?.featureThree ?? "",
      features: normalizeTestFeatures(series),
      exams: linkedExams,
    };
  }

  const allExams = await fetchExams();
  const seriesId = series?.id ?? series?.testSeriesId ?? id;
  const filteredExams = allExams.filter((exam) => {
    const testSeriesId = exam?.testSeriesId ?? exam?.testSeries?.id ?? "";
    return !testSeriesId || String(testSeriesId) === String(seriesId);
  });

  return {
    id: series?.id ?? id,
    title: series?.title ?? series?.name ?? "Test Series",
    description: series?.description ?? "",
    image: series?.image ?? series?.imageUrl ?? "",
    price: series?.price ?? null,
    sellingPrice: series?.sellingPrice ?? series?.salePrice ?? null,
    mrp: series?.mrp ?? null,
    subject: series?.subject ?? "",
    featureOne: series?.testFeatureOne ?? series?.featureOne ?? "",
    featureTwo: series?.testFeatureTwo ?? series?.featureTwo ?? "",
    featureThree: series?.testFeatureThree ?? series?.featureThree ?? "",
    features: normalizeTestFeatures(series),
    exams: filteredExams,
  };
}

export async function fetchEbookMaterials() {
  const response = await api.get("/api/vmMaterial/AllVMMaterials");
  return normalizeList(response.data);
}

export async function fetchEbookCategories() {
  const response = await api.get("/api/vmCategory/AllVMCategories");
  return normalizeList(response.data);
}

export async function fetchEbookSubcategories() {
  const response = await api.get("/api/vmSubCategory/AllVMSubCategories");
  return normalizeList(response.data);
}

export async function fetchExams() {
  const response = await api.get("/api/exams");
  return normalizeList(response.data).map((exam, index) => ({
    id: exam?.examId ?? exam?.exam_id ?? exam?.id ?? index + 1,
    name: exam?.examName ?? exam?.name ?? "Exam",
    image: exam?.image ?? exam?.imageUrl ?? "",
    totalMarks: exam?.totalMarks ?? "",
    totalQuestions: exam?.totalQuestions ?? "",
    duration: exam?.duration ?? "",
    maxAttempts: exam?.maxAttempts ?? 1,
    startTime: exam?.startTime ?? "",
    endTime: exam?.endTime ?? "",
    testSeriesId: exam?.testSeriesId ?? exam?.testSeries?.id ?? "",
    active: exam?.active !== false,
    downloadTestPaper: exam?.downloadTestPaper === true,
  }));
}

function unwrapResponse(data) {
  return data?.data ?? data?.result ?? data;
}

function getAttemptId(attempt) {
  const value = unwrapResponse(attempt);
  return value?.attemptId ?? value?.id ?? value?.attempt_id ?? null;
}

export async function startExamAttempt(examId, testSeriesId) {
  const params = { examId };
  if (testSeriesId) params.testSeriesId = testSeriesId;
  const response = await api.post("/api/exam-attempts/start", null, { params });
  const attempt = unwrapResponse(response.data);
  const attemptId = getAttemptId(attempt);
  if (!attemptId) throw new Error("The backend did not return an exam attempt ID.");
  return { ...attempt, attemptId };
}

export async function fetchAttemptQuestions(attemptId) {
  const response = await api.get(`/api/exam-attempts/${encodeURIComponent(attemptId)}/questions`);
  return normalizeList(response.data);
}

export async function saveAttemptAnswer(attemptId, answer) {
  const response = await api.post(
    `/api/exam-attempts/${encodeURIComponent(attemptId)}/answers`,
    answer
  );
  return response.data;
}

export async function submitExamAttempt(attemptId) {
  const response = await api.post(`/api/exam-attempts/${encodeURIComponent(attemptId)}/submit`);
  return unwrapResponse(response.data);
}

export async function fetchExamAttemptResult(attemptId) {
  const response = await api.get(`/api/exam-attempts/${encodeURIComponent(attemptId)}/result`);
  return unwrapResponse(response.data);
}

export function rememberExamAttempt(attemptId) {
  if (!attemptId) return;
  const saved = JSON.parse(sessionStorage.getItem("ssp_attempt_ids") || "[]");
  const ids = [String(attemptId), ...saved.filter((id) => String(id) !== String(attemptId))].slice(0, 20);
  sessionStorage.setItem("ssp_attempt_ids", JSON.stringify(ids));
}

export function rememberExamResult(result) {
  if (!result?.attemptId) return;
  const saved = JSON.parse(sessionStorage.getItem("ssp_attempt_results") || "[]");
  const attemptId = String(result.attemptId);
  const results = [result, ...saved.filter((item) => String(item?.attemptId) !== attemptId)].slice(0, 50);
  sessionStorage.setItem("ssp_attempt_results", JSON.stringify(results));
}

// Fetch exam results/attempts for a given student. Try several plausible endpoints the backend might expose.
export async function fetchStudentResults(studentId, profile = null) {
  if (!studentId) return [];
  const id = encodeURIComponent(studentId);
  const profileAttempts = [
    profile?.attempts,
    profile?.examAttempts,
    profile?.exam_attempts,
    profile?.results,
  ].find(Array.isArray) || [];

  if (profileAttempts.length) {
    const profileResults = [];
    for (const attempt of profileAttempts) {
      const attemptId = getAttemptId(attempt);
      if (!attemptId) continue;
      try {
        const result = await fetchExamAttemptResult(attemptId);
        profileResults.push({ ...attempt, ...result, attemptId });
      } catch (err) {
        profileResults.push({ ...attempt, attemptId });
      }
    }
    if (profileResults.length) return profileResults;
  }

  const endpoints = [
    "/api/exam-attempts/my",
    "/api/exam-attempts/me",
    "/api/exam-results/my",
    "/api/results/my",
    `/api/exam-attempts/student/${id}`,
    `/api/exam-attempts?studentId=${id}`,
    `/api/exam-results?studentId=${id}`,
    `/api/exam-results/student/${id}`,
    `/api/students/${id}/exam-results`,
    `/api/results?studentId=${id}`,
    `/api/results/student/${id}`,
  ];

  const endpointResults = [];
  for (const ep of endpoints) {
    try {
      const res = await api.get(ep);
      const list = normalizeList(res.data);
      if (list && list.length) {
        console.debug('fetchStudentResults: using endpoint', ep, 'returned', list.length, 'items');
        endpointResults.push(...list);
      }
    } catch (err) {
      console.debug('fetchStudentResults: endpoint', ep, 'failed with', err?.response?.status || err?.message || err);
    }
  }

  const savedAttemptIds = JSON.parse(sessionStorage.getItem("ssp_attempt_ids") || "[]");
  const rememberedResults = JSON.parse(sessionStorage.getItem("ssp_attempt_results") || "[]");
  const savedResults = [...endpointResults];
  for (const attemptId of savedAttemptIds) {
    try {
      const result = await fetchExamAttemptResult(attemptId);
      if (result) savedResults.push({ ...result, attemptId });
    } catch (err) {
      console.debug('fetchStudentResults: saved attempt failed', attemptId, err?.response?.status || err?.message || err);
    }
  }
  rememberedResults.forEach((result) => {
    if (!savedResults.some((item) => String(item.attemptId) === String(result.attemptId))) savedResults.push(result);
  });
  const uniqueResults = savedResults.filter((item, index, list) => {
    const itemId = item.attemptId ?? item.id ?? item.resultId ?? item.attempt_id;
    if (!itemId) return true;
    return list.findIndex((candidate) => String(candidate.attemptId ?? candidate.id ?? candidate.resultId ?? candidate.attempt_id) === String(itemId)) === index;
  });
  if (uniqueResults.length) return uniqueResults;

  console.warn('fetchStudentResults: no results found for student', studentId);
  return [];
}

export async function fetchVisionMissions() {
  const response = await api.get("/api2/getAllVisionMissions", {
    params: { url: DYNAMIC_PROFILE_URL },
  });
  const visionMissions = normalizeList(response.data).map((visionMission, index) => ({
    id: visionMission?.id ?? index + 1,
    vision: visionMission?.vision ?? "",
    mission: visionMission?.mission ?? "",
    directorMessage: visionMission?.directorMessage ?? "",
    directorName: visionMission?.directorName ?? "",
    directorImage: visionMission?.directorImage || visionMission?.directorImageUrl || visionMission?.directorPhoto || "",
    description: visionMission?.description ?? "",
  }));

  const liveDirectorImage = visionMissions.find((visionMission) => visionMission.directorImage)?.directorImage || "";
  return visionMissions.map((visionMission) => ({
    ...visionMission,
    directorImage: visionMission.directorImage || liveDirectorImage,
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

export async function fetchSyllabus() {
  const response = await api.get("/api/getAllSyllabus");
  return normalizeList(response.data).map((syllabus, index) => ({
    id: syllabus?.id ?? index + 1,
    title:
      syllabus?.title ??
      syllabus?.syllabusTitle ??
      syllabus?.name ??
      `Syllabus ${index + 1}`,
    link:
      syllabus?.link ??
      syllabus?.fileLink ??
      syllabus?.fileUrl ??
      syllabus?.url ??
      syllabus?.pdfUrl ??
      "",
  }));
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
        item?.file ??
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

export async function fetchStudentByEmail(email) {
  if (!email) return null;
  const response = await api.get("/api/students", { params: { email } });
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
  const roleEndpoint = `/api/auth/${role}/login`;
  
  try {
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Endpoint:", roleEndpoint);
    console.log("Role:", role);
    console.log("Credentials:", credentials);
    
    const response = await api.post(roleEndpoint, credentials);
    
    console.log("=== LOGIN SUCCESS ===");
    console.log("Full Response:", response);
    console.log("Response Data:", response.data);
    
    return response.data;
  } catch (error) {
    console.log("=== LOGIN FAILED ===");
    console.log("Status:", error?.response?.status);
    console.log("Data:", error?.response?.data);
    
    const errorData = error?.response?.data;
    const errorText = typeof errorData === "string"
      ? errorData
      : JSON.stringify(errorData || "");
    const roleEndpointUnavailable =
      error?.response?.status === 404 ||
      error?.response?.status === 401 ||
      error?.response?.status === 500 && /static resource|not found|no route/i.test(errorText);

    // Some deployments report a missing role route as HTTP 500 instead of 404.
    if (roleEndpointUnavailable) {
      try {
        console.log("Trying generic endpoint: /auth/login");
        const genericPayload = { role, ...credentials };
        console.log("Generic payload:", genericPayload);
        
        const response = await api.post("/api/auth/login", genericPayload);
        console.log("Generic endpoint success:", response.data);
        return response.data;
      } catch (fallbackError) {
        console.error("Generic endpoint also failed:", fallbackError?.response?.data);
        throw fallbackError;
      }
    }
    throw error;
  }
}

export async function requestPasswordOtp(identifier, method = "mobile") {
  const response = await api.post("/api/auth/student/forgot-password", {
    [method === "email" ? "email" : "mobile"]: String(identifier).trim(),
  });
  return response.data;
}

export async function verifyPasswordOtp(identifier, otp, method = "mobile") {
  const response = await api.post("/api/auth/student/verify-otp", {
    [method === "email" ? "email" : "mobile"]: String(identifier).trim(),
    otp: String(otp).trim(),
  });
  return response.data;
}

export async function resetStudentPassword(identifier, otp, newPassword, method = "mobile") {
  const response = await api.post("/api/auth/student/reset-password", {
    [method === "email" ? "email" : "mobile"]: String(identifier).trim(),
    otp: String(otp).trim(),
    newPassword,
  });
  return response.data;
}

export async function getMyProfile() {
  const response = await api.get("/api/auth/me");
  const payload = response.data;
  return payload?.data ?? payload?.student ?? payload?.user ?? payload;
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

    console.log("verifyRazorpayPayment - Response received:", {
      status: response.status,
      data: response.data,
      headers: response.headers
    });

    // Return the full data object (it might be wrapped or have multiple levels)
    const result = response.data;
    
    // If the backend returns a success flag, return a success indicator
    if (result?.success === true || result?.verified === true) {
      return result;
    }
    
    // If it's a string response, return as-is
    if (typeof result === "string") {
      return result;
    }
    
    // Otherwise return the data object
    return result;
  } catch (error) {
    console.error(
      "Payment verification failed:",
      error?.response?.data || error
    );

    throw error;
  }
}
