import api, { API_BASE_URL } from "../utils/api.js";

const DYNAMIC_PROFILE_URL =
  import.meta.env.VITE_DYNAMIC_PROFILE_URL || window.location.hostname;
const LIVE_PROFILE_URL = /^https?:\/\//i.test(DYNAMIC_PROFILE_URL)
  ? DYNAMIC_PROFILE_URL
  : `https://${DYNAMIC_PROFILE_URL}`;

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
      "mentors",
      "students",
      "users",
      "syllabus",
      "answerKeys",
      "answerKey",
      "footers",
      "categories",
      "category",
      "categoryList",
      "testSeries",
      "testSerieses",
      "testSeriesCategories",
      "testSeriesCategory",
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

const LOCAL_TEST_SERIES = [
  {
    id: 15,
    title: "TestSeries",
    description: "Desc for ts Home",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    price: 0,
    sellingPrice: 0,
    mrp: 0,
    subject: "General Knowledge",
    category: "General Knowledge",
    categoryId: "general-knowledge",
    featureOne: "Feature1",
    featureTwo: "Feature2",
    featureThree: "Feature3",
    exams: [
      { id: 10, name: "ज्ञानमंथन राज्यस्तरीय परीक्षा", totalMarks: 30, totalQuestions: 15, duration: 10, testSeriesId: 15, active: true },
      { id: 11, name: "ज्ञानमंथन राज्यस्तरीय परीक्षा", totalMarks: 30, totalQuestions: 15, duration: 10, testSeriesId: 15, active: true },
      { id: 12, name: "शाहू फुले आंबेडकर ज्ञानमंथन राज्यस्तरीय परीक्षा", totalMarks: 10, totalQuestions: 5, duration: 20, testSeriesId: 15, active: true },
      { id: 13, name: "Maths", totalMarks: 10, totalQuestions: 5, duration: 20, testSeriesId: 15, active: true },
    ],
  },
  {
    id: 16,
    title: "Talent Hunt",
    description: "Practice with aptitude and reasoning drills.",
    image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop",
    price: 10,
    sellingPrice: 10,
    mrp: 15,
    subject: "Reasoning",
    category: "Aptitude",
    categoryId: "aptitude",
    featureOne: "Reasoning drills",
    featureTwo: "Speed practice",
    featureThree: "Daily mocks",
    exams: [{ id: 20, name: "Talent Hunt Mock 1", totalMarks: 25, totalQuestions: 10, duration: 15, testSeriesId: 16, active: true }],
  },
  {
    id: 17,
    title: "DemoTest",
    description: "A quick demo exam to test the learning flow.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    price: 0,
    sellingPrice: 0,
    mrp: 0,
    subject: "Demo",
    category: "Demo",
    categoryId: "demo",
    featureOne: "Quick practice",
    featureTwo: "Instant result",
    featureThree: "Beginner friendly",
    exams: [{ id: 30, name: "Demo Assessment", totalMarks: 10, totalQuestions: 5, duration: 10, testSeriesId: 17, active: true }],
  },
];

const LOCAL_EXAMS = LOCAL_TEST_SERIES.flatMap((series) =>
  (series.exams || []).map((exam) => ({
    ...exam,
    image: exam.image || series.image,
    examId: exam.id,
    name: exam.name || series.title,
    examName: exam.name || series.title,
    active: exam.active !== false,
    testSeriesId: exam.testSeriesId ?? series.id,
    totalMarks: exam.totalMarks ?? 30,
    totalQuestions: exam.totalQuestions ?? 15,
    duration: exam.duration ?? 10,
  }))
);

const LOCAL_QUESTION_BANK = {
  10: [
    { id: "q-10-1", examId: 10, question: "भारत की राजधानी है:", options: ["पुणे", "दिल्ली", "महाराष्ट्र", "कोलकाता"], correctIndex: 1, marks: 2, sequence: 1 },
    { id: "q-10-2", examId: 10, question: "गणित में 25 + 15 = ?", options: ["30", "35", "40", "45"], correctIndex: 2, marks: 2, sequence: 2 },
    { id: "q-10-3", examId: 10, question: "सूर्य का रंग क्या है?", options: ["नीला", "लाल", "हरा", "सुनहरा"], correctIndex: 1, marks: 2, sequence: 3 },
    { id: "q-10-4", examId: 10, question: "2 × 8 = ?", options: ["12", "14", "16", "18"], correctIndex: 2, marks: 2, sequence: 4 },
    { id: "q-10-5", examId: 10, question: "किस ग्रह को 'लाल ग्रह' कहा जाता है?", options: ["शनि", "मंगल", "बुध", "वरुण"], correctIndex: 1, marks: 2, sequence: 5 },
  ],
  11: [
    { id: "q-11-1", examId: 11, question: "भारत का राष्ट्रीय पक्षी कौन-सा है?", options: ["मयूर", "हंस", "काक", "पेड़"], correctIndex: 0, marks: 2, sequence: 1 },
    { id: "q-11-2", examId: 11, question: "100 ÷ 5 = ?", options: ["15", "20", "25", "30"], correctIndex: 1, marks: 2, sequence: 2 },
    { id: "q-11-3", examId: 11, question: "भाषा के सबसे छोटे इकाई को क्या कहते हैं?", options: ["वाक्य", "शब्द", "अक्षर", "अनुच्छेद"], correctIndex: 2, marks: 2, sequence: 3 },
    { id: "q-11-4", examId: 11, question: "पृथ्वी पर सबसे ज्यादा पानी कहाँ है?", options: ["मैदान", "समुद्र", "पहाड़", "घास"], correctIndex: 1, marks: 2, sequence: 4 },
    { id: "q-11-5", examId: 11, question: "पश्चिमी गोलार्ध में कौन-सी ऋतु है?", options: ["शरद", "ग्रीष्म", "शीत", "वसंत"], correctIndex: 1, marks: 2, sequence: 5 },
  ],
  12: [
    { id: "q-12-1", examId: 12, question: "6 + 4 = ?", options: ["8", "10", "12", "14"], correctIndex: 1, marks: 2, sequence: 1 },
    { id: "q-12-2", examId: 12, question: "कौन-सा प्राणी पानी में रहता है?", options: ["गाय", "मछली", "बिल्ली", "पश्ला"], correctIndex: 1, marks: 2, sequence: 2 },
    { id: "q-12-3", examId: 12, question: "निम्न में से कौन-सा चित्र है?", options: ["सूरज", "चाँद", "तारा", "पेड़"], correctIndex: 0, marks: 2, sequence: 3 },
    { id: "q-12-4", examId: 12, question: "5 × 3 = ?", options: ["10", "12", "15", "18"], correctIndex: 2, marks: 2, sequence: 4 },
    { id: "q-12-5", examId: 12, question: "भारतीय राष्ट्रीय झंडे में कुल रंग कितने हैं?", options: ["2", "3", "4", "5"], correctIndex: 1, marks: 2, sequence: 5 },
  ],
  13: [
    { id: "q-13-1", examId: 13, question: "9 - 4 = ?", options: ["3", "4", "5", "6"], correctIndex: 2, marks: 2, sequence: 1 },
    { id: "q-13-2", examId: 13, question: "7 × 2 = ?", options: ["12", "13", "14", "16"], correctIndex: 2, marks: 2, sequence: 2 },
    { id: "q-13-3", examId: 13, question: "मेरा देश कौन-सा है?", options: ["भारत", "जर्मनी", "अमेरिका", "फ्रांस"], correctIndex: 0, marks: 2, sequence: 3 },
    { id: "q-13-4", examId: 13, question: "12 + 8 = ?", options: ["18", "20", "22", "24"], correctIndex: 1, marks: 2, sequence: 4 },
    { id: "q-13-5", examId: 13, question: "कौन-सा पद्मा शब्द सही है?", options: ["पद्म", "पदमा", "पद्मा", "पदम"], correctIndex: 2, marks: 2, sequence: 5 },
  ],
  20: [
    { id: "q-20-1", examId: 20, question: "यदि 2, 4, 8, 16 है, तो अगला पद क्या होगा?", options: ["18", "24", "32", "36"], correctIndex: 2, marks: 2, sequence: 1 },
    { id: "q-20-2", examId: 20, question: "A, C, E, G, ?", options: ["H", "I", "J", "K"], correctIndex: 2, marks: 2, sequence: 2 },
    { id: "q-20-3", examId: 20, question: "जैसा: घोड़ा: टट्टू, तो बिल्ली: ?", options: ["बिल्ली", "बच्चा", "कूकर", "किल्ली"], correctIndex: 0, marks: 2, sequence: 3 },
    { id: "q-20-4", examId: 20, question: "5, 10, 15, 20, ?", options: ["22", "24", "25", "30"], correctIndex: 3, marks: 2, sequence: 4 },
    { id: "q-20-5", examId: 20, question: "विलोम का सही मिलान है: बड़ा है ?", options: ["नाटा", "छोटा", "काला", "उच्च"], correctIndex: 1, marks: 2, sequence: 5 },
  ],
  30: [
    { id: "q-30-1", examId: 30, question: "कंप्यूटर का मुख्य भाग क्या है?", options: ["माउस", "किबोर्ड", "CPU", "मॉनिटर"], correctIndex: 2, marks: 2, sequence: 1 },
    { id: "q-30-2", examId: 30, question: "2 + 2 = ?", options: ["3", "4", "5", "6"], correctIndex: 1, marks: 2, sequence: 2 },
    { id: "q-30-3", examId: 30, question: "जिनेमा का सही नाम क्या है?", options: ["कंप्यूटर", "विद्युत", "किसी तक"], correctIndex: 2, marks: 2, sequence: 3 },
    { id: "q-30-4", examId: 30, question: "जलेबी का रंग क्या है?", options: ["लाल", "नीला", "गुलाबी", "हरा"], correctIndex: 2, marks: 2, sequence: 4 },
    { id: "q-30-5", examId: 30, question: "11 + 9 = ?", options: ["18", "19", "20", "21"], correctIndex: 2, marks: 2, sequence: 5 },
  ],
};

function readLocalStorageObject(key, fallback = {}) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalStorageObject(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function getLocalTestSeriesFallback() {
  return LOCAL_TEST_SERIES.map((series) => ({
    id: series.id,
    title: series.title,
    description: series.description,
    image: series.image,
    price: series.price,
    sellingPrice: series.sellingPrice,
    mrp: series.mrp,
    subject: series.subject,
    category: series.category,
    categoryId: series.categoryId,
    featureOne: series.featureOne,
    featureTwo: series.featureTwo,
    featureThree: series.featureThree,
    features: [series.featureOne, series.featureTwo, series.featureThree].filter(Boolean),
    startDate: "",
    endDate: "",
    exams: (series.exams || []).map((exam) => ({
      id: exam.id,
      name: exam.name,
      image: exam.image,
      totalMarks: exam.totalMarks,
      totalQuestions: exam.totalQuestions,
      duration: exam.duration,
      active: exam.active !== false,
      testSeriesId: exam.testSeriesId,
    })),
  }));
}

function getLocalExamFallbackById(id) {
  const exam = LOCAL_EXAMS.find((entry) => String(entry.id) === String(id));
  return exam ? {
    id: exam.id,
    name: exam.name,
    examName: exam.name,
    image: exam.image,
    totalMarks: exam.totalMarks,
    totalQuestions: exam.totalQuestions,
    duration: exam.duration,
    maxAttempts: 1,
    startTime: "",
    endTime: "",
    testSeriesId: exam.testSeriesId,
    active: exam.active !== false,
    downloadTestPaper: false,
  } : null;
}

function getLocalSeriesFallbackById(id) {
  const item = LOCAL_TEST_SERIES.find((series) => String(series.id) === String(id));
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    image: item.image,
    price: item.price,
    sellingPrice: item.sellingPrice,
    mrp: item.mrp,
    subject: item.subject,
    featureOne: item.featureOne,
    featureTwo: item.featureTwo,
    featureThree: item.featureThree,
    features: [item.featureOne, item.featureTwo, item.featureThree].filter(Boolean),
    exams: (item.exams || []).map((exam) => ({
      id: exam.id,
      name: exam.name,
      image: exam.image,
      totalMarks: exam.totalMarks,
      totalQuestions: exam.totalQuestions,
      duration: exam.duration,
      active: exam.active !== false,
      testSeriesId: exam.testSeriesId,
    })),
  };
}

function getLocalQuestionsForExam(examId) {
  if (!examId) return [];

  const fallbackIds = new Set([
    String(examId),
    String(examId).trim(),
    String(Number(examId) || examId),
  ]);

  const legacyMap = {
    101: "10",
    102: "11",
    103: "12",
    104: "13",
    201: "20",
    301: "30",
  };

  const legacyKey = legacyMap[String(examId)];
  if (legacyKey) fallbackIds.add(legacyKey);

  const directQuestions = Array.from(fallbackIds)
    .map((key) => LOCAL_QUESTION_BANK[key])
    .find((questions) => Array.isArray(questions)) || [];

  return directQuestions.map((question, index) => ({
    ...question,
    id: question.id || `local-question-${examId}-${index + 1}`,
    questionId: question.id || `local-question-${examId}-${index + 1}`,
    questionText: question.question,
    correctAnswer: question.options[question.correctIndex],
    questionType: "MCQ",
    answerExplanation: "Demo solution",
    sequence: question.sequence ?? index + 1,
  }));
}

function getLocalAttemptRecord(attemptId) {
  const attempts = readLocalStorageObject("ssp_local_attempts", {});
  return attempts[String(attemptId)] || null;
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
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw error;
      }
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

export async function fetchMentors() {
  const response = await api.get("/api2/api/mentors", {
    params: { url: LIVE_PROFILE_URL },
  });

  return normalizeList(response.data).map((mentor, index) => ({
    id: mentor?.id ?? mentor?.mentorId ?? index + 1,
    name: mentor?.mentorName ?? mentor?.name ?? mentor?.fullName ?? "Mentor",
    designation: mentor?.designation ?? mentor?.mentorDesignation ?? mentor?.role ?? "Academic mentor",
    subject: mentor?.subject ?? mentor?.specialization ?? mentor?.expertise ?? "",
    experience: mentor?.experience ?? mentor?.experienceInYears ?? mentor?.yearsOfExperience ?? "",
    qualification: mentor?.qualification ?? mentor?.education ?? mentor?.mentorQualification ?? "",
    description: mentor?.description ?? mentor?.bio ?? mentor?.about ?? "",
    image: mentor?.mentorImage ?? mentor?.image ?? mentor?.imageUrl ?? mentor?.photo ?? "",
    active: mentor?.active ?? mentor?.isActive ?? true,
  }));
}

export async function fetchHeroSections() {
  const response = await api.get("/api2/getAllHeroSections", {
    params: { url: LIVE_PROFILE_URL },
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
    linkLabel:
      hero?.buttonText ??
      hero?.buttonLabel ??
      hero?.buttonName ??
      hero?.linkLabel ??
      hero?.ctaText ??
      "Register Now",
    priority: Number(hero?.priority ?? hero?.displayOrder ?? index),
  }));
}

export async function fetchMarquee() {
  const response = await api.get("/api2/marquee", {
    params: { url: LIVE_PROFILE_URL },
  });
  const marquee = response?.data?.data ?? response?.data?.result ?? response?.data ?? null;
  if (!marquee || typeof marquee !== "object") return [];

  const items = marquee.items ?? marquee.messages ?? marquee.texts ?? marquee.marqueeItems;
  if (Array.isArray(items)) return items.map((item) => typeof item === "string" ? item : item?.text ?? item?.title ?? "").filter(Boolean);

  return [marquee.name, marquee.text, marquee.message, marquee.content, marquee.title, marquee.marqueeText, marquee.marqueeMessage]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());
}

export async function fetchSlideBars() {
  const response = await api.get("/api2/getAllSlideBars", { params: { url: DYNAMIC_PROFILE_URL } });
  return normalizeList(response.data).map((slide, index) => ({
    id: slide?.id ?? slide?.slideBarId ?? slide?.slideId ?? index + 1,
    title: slide?.title ?? slide?.heading ?? slide?.slideBarTitle ?? slide?.name ?? "",
    subtitle: slide?.description ?? slide?.subtitle ?? slide?.subTitle ?? slide?.text ?? "",
    image: slide?.posterImage ?? slide?.poster ?? slide?.image ?? slide?.imageUrl ?? slide?.slideBarImage ?? slide?.slideBarImages?.[0] ?? "",
    link: slide?.buttonLink ?? slide?.buttonUrl ?? slide?.url ?? slide?.link ?? "/register",
    linkLabel: slide?.buttonName ?? slide?.buttonLabel ?? slide?.buttonText ?? slide?.linkLabel ?? "",
    priority: Number(slide?.priority ?? slide?.displayOrder ?? slide?.sequence ?? index),
    active: slide?.active ?? slide?.isActive ?? true,
  })).filter((slide) => slide.active !== false);
}

export async function fetchFAQs() {
  const response = await api.get("https://shrishahuprabodhini.in/api/api2/faqs");
  return normalizeList(response.data).map((faq, index) => ({
    id: faq?.id ?? index + 1,
    question: faq?.question ?? faq?.faqQuestion ?? faq?.title ?? faq?.questionText ?? "",
    answer: faq?.answer ?? faq?.faqAnswer ?? faq?.content ?? faq?.description ?? "",
    active: faq?.active ?? faq?.isActive ?? true,
    priority: Number(faq?.priority ?? faq?.displayOrder ?? faq?.sequence ?? index),
  })).filter((faq) => faq.active !== false && faq.question && faq.answer)
    .sort((first, second) => first.priority - second.priority);
}

export async function fetchExamSection() {
  const response = await api.get("https://shrishahuprabodhini.in/api/api2/exam-section");
  const section = response?.data?.data ?? response?.data?.result ?? response?.data ?? null;
  if (!section || typeof section !== "object") return null;

  return {
    ...section,
    name: section.name ?? section.examName ?? section.examTitle ?? section.title ?? "",
    description: section.description ?? section.examDescription ?? section.content ?? "",
    eligibleClasses: section.eligibleClasses ?? section.classes ?? section.eligibleClass ?? "",
    examDate: section.examDate ?? section.date ?? "",
    registrationDeadline: section.registrationDeadline ?? section.registrationLastDate ?? section.applicationClosingDate ?? section.lastDate ?? "",
    fee: section.fee ?? section.registrationFee ?? section.amount ?? null,
    pattern: section.pattern ?? section.examPattern ?? section.examStructure ?? "",
    centers: section.centers ?? section.centerCount ?? section.availableCenters ?? "",
  };
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
  const seriesList = await requestFirstAvailable([
    "/api/api/test-series",
    "/api/testSeries",
    "/api/testseries",
    "/api/api/test-series/all",
    "/api/testSeries/all",
    "/api/testseries/all",
    "/api/api/test-series/list",
    "/api/testSeries/list",
    "/api/testseries/list",
  ], "test series");

  if (seriesList.length > 0) {
    return seriesList.map((series, index) => ({
      id: series?.id ?? series?.testSeriesId ?? index + 1,
      title: series?.title ?? series?.name ?? "Test Series",
      description: series?.description ?? "",
      image: series?.image ?? series?.imageUrl ?? "",
      price: series?.price ?? null,
      sellingPrice: series?.sellingPrice ?? series?.salePrice ?? null,
      mrp: series?.mrp ?? null,
      subject: series?.subject ?? "",
      category: typeof (series?.category ?? series?.testCategory ?? series?.testSeriesCategory) === "object"
        ? (series?.category?.categoryName ?? series?.category?.name ?? series?.category?.title ?? series?.category?.category ?? series?.testCategory?.categoryName ?? series?.testCategory?.name ?? series?.testSeriesCategory?.categoryName ?? series?.testSeriesCategory?.name ?? "")
        : series?.category ?? series?.categoryName ?? series?.testCategory ?? series?.testSeriesCategory ?? series?.type ?? series?.testType ?? series?.subject ?? "",
      categoryId: series?.categoryId ?? series?.testCategoryId ?? series?.testSeriesCategoryId ?? series?.category?.id ?? series?.category?.categoryId ?? series?.testCategory?.id ?? series?.testSeriesCategory?.id ?? "",
      featureOne: series?.testFeatureOne ?? series?.featureOne ?? "",
      featureTwo: series?.testFeatureTwo ?? series?.featureTwo ?? "",
      featureThree: series?.testFeatureThree ?? series?.featureThree ?? "",
      features: normalizeTestFeatures(series),
      startDate: series?.startDate ?? "",
      endDate: series?.endDate ?? "",
      exams: extractLinkedExams(series),
    }));
  }

  return getLocalTestSeriesFallback();
}

export async function fetchTestSeriesCategories() {
  const categories = await requestFirstAvailable([
    "/api/categories",
    "/api/test-series/categories",
    "/api/testSeries/categories",
    "/api/testseries/categories",
    "/api/api/categories",
    "https://shrishahuprabodhini.in/api/api/categories",
    "https://shrishahuprabodhini.in/api/categories",
  ], "test series categories");

  if (categories.length > 0) {
    return categories.map((category, index) => ({
      id: category?.id ?? category?._id ?? category?.categoryId ?? index + 1,
      name: category?.categoryName ?? category?.name ?? category?.title ?? category?.category ?? category?.label ?? `Category ${index + 1}`,
    })).filter((category) => category.name);
  }

  return [...new Set(LOCAL_TEST_SERIES.map((series) => series.category))]
    .filter(Boolean)
    .map((name, index) => ({ id: `${String(name).toLowerCase().replace(/\s+/g, "-")}-${index + 1}`, name }));
}

export async function fetchTestSeriesById(id) {
  let payload = null;
  let lastError = null;

  const candidates = [
    `/api/api/test-series/${id}`,
    `/api/testSeries/${id}`,
    `/api/testseries/${id}`,
    `/api/api/test-series/get/${id}`,
    `/api/testSeries/get/${id}`,
    `/api/testseries/get/${id}`,
    `/api/api/test-series/id/${id}`,
    `/api/testSeries/id/${id}`,
    `/api/testseries/id/${id}`,
  ];

  for (const endpoint of candidates) {
    try {
      const response = await api.get(endpoint);
      const candidate = response?.data?.data ?? response?.data?.result ?? response?.data ?? null;

      if (candidate && ((Array.isArray(candidate) && candidate.length) || (typeof candidate === "object" && Object.keys(candidate).length))) {
        payload = candidate;
        break;
      }

      payload = candidate;
    } catch (error) {
      lastError = error;
    }
  }

  const localFallback = getLocalSeriesFallbackById(id);

  if (!payload) {
    if (localFallback) return localFallback;
    throw lastError || new Error(`Unable to load test series ${id}`);
  }

  const normalizedPayload = Array.isArray(payload)
    ? payload.find((entry) => String(entry?.id ?? entry?.testSeriesId ?? "") === String(id)) ?? payload[0]
    : payload;

  const series = normalizedPayload?.data ?? normalizedPayload?.result ?? normalizedPayload;
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

function normalizeLeaderboardRows(payload) {
  return normalizeList(payload).map((row, index) => ({
    rank: row?.rank ?? index + 1,
    studentId: row?.studentId ?? row?.student_id ?? row?.student?.id ?? "-",
    studentName: row?.studentName ?? row?.student_name ?? row?.student?.name ?? row?.student?.fullName ?? "Student",
    obtainedMarks: row?.obtainedMarks ?? row?.obtained_marks ?? row?.score ?? 0,
    totalMarks: row?.totalMarks ?? row?.total_marks ?? row?.maxMarks ?? 0,
    percentage: row?.percentage ?? row?.percent ?? 0,
    timeTakenSeconds: row?.timeTakenSeconds ?? row?.time_taken_seconds ?? row?.durationSeconds ?? row?.duration ?? null,
    correctQuestions: row?.correctQuestions ?? row?.correct_questions ?? 0,
    incorrectQuestions: row?.incorrectQuestions ?? row?.incorrect_questions ?? 0,
    solvedQuestions: row?.solvedQuestions ?? row?.solved_questions ?? 0,
    unsolvedQuestions: row?.unsolvedQuestions ?? row?.unsolved_questions ?? 0,
    startedAt: row?.startedAt ?? row?.started_at ?? row?.startTime ?? row?.start_time ?? row?.attempt?.startedAt ?? null,
    submittedAt: row?.submittedAt ?? row?.submitted_at ?? row?.submitTime ?? row?.submit_time ?? row?.attempt?.submittedAt ?? null,
  }));
}

export async function fetchExamLeaderboard(examId) {
  const response = await api.get(`/api/leaderboard/exam/${encodeURIComponent(examId)}`);
  return normalizeLeaderboardRows(response.data);
}

export async function fetchTestSeriesLeaderboard(testSeriesId) {
  const response = await api.get(`/api/leaderboard/test-series/${encodeURIComponent(testSeriesId)}`);
  return normalizeLeaderboardRows(response.data);
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
  try {
    const response = await api.get("/api/exams");
    const exams = normalizeList(response.data);
    if (exams.length > 0) {
      return exams.map((exam, index) => ({
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
  } catch (error) {
    console.warn("fetchExams failed; using local fallback dataset.", error?.message || error);
  }

  return LOCAL_EXAMS;
}

export async function fetchQuestionsByExamId(examId) {
  try {
    const response = await api.get("/api/questions");
    const questions = normalizeList(response.data);
    const filteredQuestions = questions
      .filter((question) => question?.active !== false)
      .filter((question) => {
        const questionExamId = question?.examId ?? question?.exam_id ?? question?.examID ?? question?.exam?.id ?? question?.exam?.examId ?? question?.exam?.exam_id;
        return !examId || String(questionExamId ?? "") === String(examId);
      })
      .sort((first, second) => Number(first?.sequence ?? first?.questionSequence ?? first?.question_sequence ?? 0) - Number(second?.sequence ?? second?.questionSequence ?? second?.question_sequence ?? 0));

    if (filteredQuestions.length > 0) {
      return filteredQuestions;
    }
  } catch (error) {
    console.warn("fetchQuestionsByExamId failed; using local fallback dataset.", error?.message || error);
  }

  return getLocalQuestionsForExam(examId);
}

function unwrapResponse(data) {
  return data?.data ?? data?.result ?? data;
}

function getAttemptId(attempt) {
  const value = unwrapResponse(attempt);
  return value?.attemptId ?? value?.id ?? value?.attempt_id ?? null;
}

function getIsoNow() {
  return new Date().toISOString();
}

function normalizeAttemptTimingFields(value) {
  const source = unwrapResponse(value) || value || {};
  const startedAt =
    source?.startedAt ??
    source?.started_at ??
    source?.startTime ??
    source?.start_time ??
    source?.startDateTime ??
    source?.start_date_time ??
    source?.startedOn ??
    source?.started_on ??
    source?.dateStarted ??
    source?.date_started ??
    source?.attemptStartedAt ??
    source?.attempt_started_at ??
    source?.createdAt ??
    source?.created_at ??
    source?.examStartedAt ??
    source?.exam_started_at ??
    null;
  const submittedAt =
    source?.submittedAt ??
    source?.submitted_at ??
    source?.submitTime ??
    source?.submit_time ??
    source?.submittedTime ??
    source?.submitted_time ??
    source?.submissionTime ??
    source?.submission_time ??
    source?.submittedOn ??
    source?.submitted_on ??
    source?.completedAt ??
    source?.completed_at ??
    source?.finishedAt ??
    source?.finished_at ??
    source?.endTime ??
    source?.end_time ??
    source?.attemptSubmittedAt ??
    source?.attempt_submitted_at ??
    source?.updatedAt ??
    source?.updated_at ??
    null;
  return { ...source, startedAt, submittedAt };
}

export async function startExamAttempt(examId, testSeriesId) {
  const startedAt = getIsoNow();
  const params = { examId, startedAt };
  if (testSeriesId) params.testSeriesId = testSeriesId;

  try {
    const response = await api.post("/api/exam-attempts/start", { examId, testSeriesId: testSeriesId ?? null, startedAt }, { params });
    const attempt = normalizeAttemptTimingFields(response.data);
    const attemptId = getAttemptId(attempt);
    if (!attemptId) throw new Error("The backend did not return an exam attempt ID.");
    return { ...attempt, attemptId, startedAt: attempt.startedAt ?? startedAt };
  } catch (error) {
    const attemptId = `local-attempt-${Date.now()}`;
    const attempts = readLocalStorageObject("ssp_local_attempts", {});
    attempts[attemptId] = { attemptId, examId, testSeriesId: testSeriesId ?? null, startedAt };
    writeLocalStorageObject("ssp_local_attempts", attempts);
    return { attemptId, examId, testSeriesId: testSeriesId ?? null, startedAt, offline: true };
  }
}

export async function fetchAttemptQuestions(attemptId) {
  try {
    const response = await api.get(`/api/exam-attempts/${encodeURIComponent(attemptId)}/questions`);
    return normalizeList(response.data);
  } catch (error) {
    const attempt = getLocalAttemptRecord(attemptId);
    const examId = attempt?.examId;
    if (!examId) return [];
    return getLocalQuestionsForExam(examId);
  }
}

export async function saveAttemptAnswer(attemptId, answer) {
  try {
    const response = await api.post(
      `/api/exam-attempts/${encodeURIComponent(attemptId)}/answers`,
      answer
    );
    return response.data;
  } catch (error) {
    const answers = readLocalStorageObject("ssp_local_answers", {});
    const key = String(attemptId);
    answers[key] = answers[key] || {};
    answers[key][String(answer?.questionId ?? "")] = answer;
    writeLocalStorageObject("ssp_local_answers", answers);
    return { success: true, offline: true };
  }
}

export async function submitExamAttempt(attemptId) {
  const submittedAt = getIsoNow();

  try {
    const response = await api.post(
      `/api/exam-attempts/${encodeURIComponent(attemptId)}/submit`,
      { attemptId, submittedAt, finishedAt: submittedAt, status: "SUBMITTED" }
    );
    return normalizeAttemptTimingFields(response.data);
  } catch (error) {
    const attempt = getLocalAttemptRecord(attemptId);
    const examId = attempt?.examId;
    const questions = getLocalQuestionsForExam(examId);
    const savedAnswers = readLocalStorageObject("ssp_local_answers", {});
    const answerMap = savedAnswers[String(attemptId)] || {};

    let obtainedMarks = 0;
    const questionResults = questions.map((question) => {
      const answerValue = answerMap[String(question.id)]?.selectedAnswer ?? answerMap[String(question.questionId)]?.selectedAnswer ?? null;
      const selectedIndex = question.options.findIndex((option) => String(option) === String(answerValue));
      const isCorrect = selectedIndex === Number(question.correctIndex ?? question.correct_index ?? -1);
      if (isCorrect) obtainedMarks += Number(question.marks || 1);
      return {
        questionId: question.id,
        selectedAnswer: answerValue,
        correctAnswer: question.options[question.correctIndex],
        isCorrect,
        marksObtained: isCorrect ? Number(question.marks || 1) : 0,
      };
    });

    const result = {
      resultId: `local-result-${attemptId}`,
      attemptId,
      examId,
      obtainedMarks,
      startedAt: attempt?.startedAt ?? null,
      submittedAt,
      totalMarks: questions.reduce((total, question) => total + Number(question.marks || 1), 0),
      percentage: questions.length ? Math.round((obtainedMarks / questions.reduce((total, question) => total + Number(question.marks || 1), 0)) * 100) : 0,
      questions: questionResults,
      offline: true,
    };

    const persistedResults = readLocalStorageObject("ssp_local_results", {});
    persistedResults[result.resultId] = result;
    writeLocalStorageObject("ssp_local_results", persistedResults);
    return result;
  }
}

export async function fetchExamAttemptResult(attemptId) {
  try {
    const response = await api.get(`/api/exam-attempts/${encodeURIComponent(attemptId)}/result`);
    return normalizeAttemptTimingFields(response.data);
  } catch (error) {
    const results = readLocalStorageObject("ssp_local_results", {});
    const resultId = Object.keys(results).find((key) => String(results[key]?.attemptId) === String(attemptId));
    return resultId ? results[resultId] : { attemptId, startedAt: null, submittedAt: null, offline: true };
  }
}

export async function fetchStudentResultById(resultId) {
  try {
    const response = await api.get(`/api/results/${encodeURIComponent(resultId)}`);
    return unwrapResponse(response.data);
  } catch (error) {
    const results = readLocalStorageObject("ssp_local_results", {});
    return results[String(resultId)] || { resultId, offline: true };
  }
}

export function rememberExamAttempt(attemptId, startedAt = new Date().toISOString()) {
  if (!attemptId) return;
  let saved = [];
  try { saved = JSON.parse(sessionStorage.getItem("ssp_attempt_ids") || "[]"); } catch { saved = []; }
  const ids = [String(attemptId), ...saved.filter((id) => String(id) !== String(attemptId))].slice(0, 20);
  sessionStorage.setItem("ssp_attempt_ids", JSON.stringify(ids));
  rememberExamStartedAt(attemptId, startedAt);
}

const ATTEMPT_TIMESTAMPS_KEY = "ssp_exam_attempt_timestamps";

function readAttemptTimestamps() {
  try {
    const value = JSON.parse(sessionStorage.getItem(ATTEMPT_TIMESTAMPS_KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export function getRememberedExamTimestamps(attemptId) {
  return readAttemptTimestamps()[String(attemptId)] || {};
}

export function rememberExamStartedAt(attemptId, startedAt = new Date().toISOString()) {
  if (!attemptId) return;
  const timestamps = readAttemptTimestamps();
  const key = String(attemptId);
  timestamps[key] = { ...timestamps[key], startedAt: timestamps[key]?.startedAt || startedAt };
  sessionStorage.setItem(ATTEMPT_TIMESTAMPS_KEY, JSON.stringify(timestamps));
}

export function rememberExamSubmittedAt(attemptId, submittedAt = new Date().toISOString()) {
  if (!attemptId) return;
  const timestamps = readAttemptTimestamps();
  const key = String(attemptId);
  timestamps[key] = { ...timestamps[key], submittedAt };
  sessionStorage.setItem(ATTEMPT_TIMESTAMPS_KEY, JSON.stringify(timestamps));
}

export function rememberExamResult(result) {
  if (!result?.attemptId) return;
  const saved = JSON.parse(sessionStorage.getItem("ssp_attempt_results") || "[]");
  const attemptId = String(result.attemptId);
  const results = [result, ...saved.filter((item) => String(item?.attemptId) !== attemptId)].slice(0, 50);
  sessionStorage.setItem("ssp_attempt_results", JSON.stringify(results));
}

// Fetch the complete result history for the authenticated student.
export async function fetchStudentResults(studentId, profile = null) {
  if (!studentId) return [];
  const id = encodeURIComponent(studentId);
  try {
    const response = await api.get(`/api/results/student/${id}`);
    const persistedResults = normalizeList(response.data);
    return persistedResults.filter(Boolean).filter((item, index, list) => {
      const itemId = item.attemptId ?? item.id ?? item.resultId ?? item.attempt_id;
      if (!itemId) return true;
      return list.findIndex((candidate) => String(candidate.attemptId ?? candidate.id ?? candidate.resultId ?? candidate.attempt_id) === String(itemId)) === index;
    });
  } catch (error) {
    console.warn("fetchStudentResults: persisted result history failed", error?.response?.status || error?.message);
    throw error;
  }
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

export async function fetchResultsPdfs() {
  const response = await api.get("/results-pdfs");
  return normalizeList(response.data).map((item, index) => ({
    id: item?.id ?? item?.resultsPdfId ?? index + 1,
    title: item?.title ?? item?.name ?? item?.pdfTitle ?? item?.fileName ?? `Results PDF ${index + 1}`,
    file: item?.filePdf ?? item?.pdfFile ?? item?.fileUrl ?? item?.pdfUrl ?? item?.filePath ?? item?.file ?? item?.url ?? item?.link ?? "#",
    description: item?.description ?? item?.examName ?? item?.resultName ?? "",
    size: item?.size ?? item?.fileSize ?? "",
    publishedAt: item?.publishedAt ?? item?.publishedDate ?? item?.createdAt ?? "",
  }));
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
    description: syllabus?.description ?? syllabus?.details ?? syllabus?.summary ?? "",
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
  const response = await api.get(`${API_BASE_URL}/api/api/students/${encodeURIComponent(studentId)}`);
  const payload = response.data;
  return normalizeStudent(payload?.data ?? payload?.student ?? payload?.user ?? payload);
}

function normalizeStudent(student) {
  if (!student || typeof student !== "object") return student;
  const payment = student.payment ?? student.latestPayment ?? student.paymentDetails ?? student.payment_details ?? {};
  const paymentHistory = [
    student.paymentHistory,
    student.payment_history,
    student.paymentHistoryList,
    student.payment_history_list,
    student.payments,
    student.paymentRecords,
    student.payment_records,
    student.transactions,
  ].flatMap((value) => Array.isArray(value) ? value : value && typeof value === "object" ? Object.values(value) : []).filter((item) => item && typeof item === "object");
  const latestHistoryPayment = paymentHistory.find((item) => {
    const status = item.paymentStatus ?? item.payment_status ?? item.paymentStatusName ?? item.payment_status_name ?? item.transactionStatus ?? item.transaction_status ?? item.status ?? item.state;
    return [item.paymentDone, item.isPaymentDone, item.payment_done, item.isPaid, item.paid, item.paymentCompleted, item.payment_completed].some((value) =>
      value === true || value === 1 || String(value).toLowerCase() === "true" || String(value) === "1"
    ) || ["PAID", "SUCCESS", "SUCCESSFUL", "COMPLETED", "CAPTURED", "PAYMENT SUCCESSFUL"].includes(String(status ?? "").trim().toUpperCase());
  }) ?? paymentHistory[paymentHistory.length - 1] ?? {};
  const paymentStatus =
    student.paymentStatus ??
    student.payment_status ??
    student.paymentStatusName ??
    student.payment_status_name ??
    payment.paymentStatus ??
    payment.payment_status ??
    payment.paymentStatusName ??
    payment.payment_status_name ??
    payment.transactionStatus ??
    payment.transaction_status ??
    payment.status ??
    payment.state ??
    latestHistoryPayment.paymentStatus ??
    latestHistoryPayment.payment_status ??
    latestHistoryPayment.status ??
    latestHistoryPayment.state ??
    "";
  const paymentId =
    student.paymentId ??
    student.payment_id ??
    student.razorpayPaymentId ??
    student.transactionId ??
    student.transaction_id ??
    payment.paymentId ??
    payment.payment_id ??
    payment.razorpayPaymentId ??
    payment.transactionId ??
    payment.transaction_id ??
    latestHistoryPayment.paymentId ??
    latestHistoryPayment.payment_id ??
    latestHistoryPayment.razorpayPaymentId ??
    latestHistoryPayment.transactionId ??
    latestHistoryPayment.transaction_id ??
    "";
  const rawPaymentAmount =
    student.amount ??
    student.amountPaid ??
    student.paidAmount ??
    student.paymentAmount ??
    student.registrationFee ??
    payment.amount ??
    payment.amountPaid ??
    payment.paidAmount ??
    payment.paymentAmount ??
    payment.registrationFee ??
    payment.totalAmount ??
    latestHistoryPayment.amount ??
    latestHistoryPayment.amountPaid ??
    latestHistoryPayment.paidAmount ??
    latestHistoryPayment.paymentAmount ??
    null;
  const paymentAmount = rawPaymentAmount == null
    ? null
    : Number(rawPaymentAmount) > 100000
      ? Number(rawPaymentAmount) / 100
      : Number(rawPaymentAmount);
  const normalizedPaymentStatus = String(paymentStatus).trim().toUpperCase();
  const paymentDone =
    [student.paymentDone, student.isPaymentDone, student.payment_done, student.isPaid, student.paid, student.paymentCompleted, student.payment_completed, payment.paymentDone, payment.isPaymentDone, payment.isPaid, payment.paid, payment.paymentCompleted, payment.payment_completed, latestHistoryPayment.paymentDone, latestHistoryPayment.isPaymentDone, latestHistoryPayment.payment_done, latestHistoryPayment.isPaid, latestHistoryPayment.paid, latestHistoryPayment.paymentCompleted, latestHistoryPayment.payment_completed].some((value) =>
      value === true || value === 1 || String(value).toLowerCase() === "true" || String(value) === "1"
    ) ||
    ["PAID", "SUCCESS", "SUCCESSFUL", "COMPLETED", "CAPTURED", "PAYMENT SUCCESSFUL"].includes(normalizedPaymentStatus);
  const isPaymentDone =
    paymentDone;

  return {
    ...student,
    id: student.id ?? student.studentId,
    studentId: student.studentId ?? student.id,
    name: student.name ?? student.studentName ?? student.fullName ?? "",
    studentName: student.studentName ?? student.name ?? student.fullName ?? "",
    fatherName: student.fatherName ?? "",
    lastName: student.lastName ?? "",
    email: student.email ?? student.emailId ?? "",
    mobile: student.mobile ?? student.mobileNo ?? student.phone ?? student.contactNumber ?? "",
    gender: student.gender ?? student.studentGender ?? "",
    dateOfBirth: student.dateOfBirth ?? student.dob ?? student.birthDate ?? "",
    class: student.class ?? student.studentClass ?? student.className ?? "",
    studentClass: student.studentClass ?? student.class ?? student.className ?? "",
    medium: student.medium ?? student.schoolMedium ?? "",
    schoolName: student.schoolName ?? student.school ?? student.instituteName ?? "",
    school: student.school ?? student.schoolName ?? student.instituteName ?? "",
    address: student.address ?? student.residentialAddress ?? "",
    village: student.village ?? student.villageName ?? "",
    district: student.district ?? student.districtName ?? "",
    districtId: student.districtId ?? "",
    districtName: student.districtName ?? student.district ?? "",
    taluka: student.taluka ?? student.talukaName ?? "",
    talukaId: student.talukaId ?? "",
    talukaName: student.talukaName ?? student.taluka ?? "",
    state: student.state ?? student.stateName ?? "",
    pincode: student.pincode ?? student.pinCode ?? student.zipCode ?? "",
    centerId: student.centerId ?? student.examCenterId ?? student.examCenter?.id ?? student.center?.id ?? "",
    centerName: student.centerName ?? student.examCenter?.name ?? student.center?.name ?? "",
    coordinatorId: student.coordinatorId ?? student.coordinator?.id ?? "",
    coordinatorName: student.coordinatorName ?? student.coordinator?.name ?? student.coordinator?.fullName ?? "",
    active: student.active ?? null,
    createdAt: student.createdAt ?? "",
    updatedAt: student.updatedAt ?? "",
    isPaymentDone,
    paymentStatus: paymentStatus || (paymentDone ? "PAID" : ""),
    paymentDone,
    paymentId,
    paymentMode: student.paymentMode ?? payment.paymentMode ?? payment.mode ?? latestHistoryPayment.paymentMode ?? latestHistoryPayment.mode ?? "",
    amount: Number.isFinite(paymentAmount) ? paymentAmount : rawPaymentAmount,
    paymentAmount: Number.isFinite(paymentAmount) ? paymentAmount : rawPaymentAmount,
  };
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
  const students = await fetchAllStudentsForLookup();
  return students.find((student) => String(student.mobile ?? student.mobileNo ?? student.phone ?? "") === String(mobile)) || null;
}

export async function fetchStudentByEmail(email) {
  if (!email) return null;
  const students = await fetchAllStudentsForLookup();
  return students.find((student) => String(student.email ?? student.emailId ?? "").toLowerCase() === String(email).toLowerCase()) || null;
}

async function fetchAllStudentsForLookup() {
  try {
    const response = await api.post("/api/students/filter", {}, {
      params: { page: 0, size: 1000, sort: "studentName,asc" },
    });
    return normalizeList(response.data).filter(Boolean).map(normalizeStudent);
  } catch (filterError) {
    const response = await api.get("/api/students");
    return normalizeList(response.data).filter(Boolean).map(normalizeStudent);
  }
}

export async function registerStudent(payload) {
  const response = await api.post("/api/students", payload);
  return response.data;
}

export async function loginUser(role, credentials) {
  const roleEndpoint = `/api/auth/${role}/login`;

  function includeHeaderToken(response) {
    const payload = response?.data;
    const headerToken =
      response?.headers?.authorization ||
      response?.headers?.Authorization ||
      response?.headers?.get?.("authorization");

    if (!headerToken || !payload || typeof payload !== "object") {
      return payload;
    }

    if (payload.token || payload.accessToken || payload.access_token || payload.jwt) {
      return payload;
    }

    return {
      ...payload,
      token: headerToken,
    };
  }
  
  try {
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Endpoint:", roleEndpoint);
    console.log("Role:", role);
    console.log("Credentials:", credentials);
    
    const response = await api.post(roleEndpoint, credentials);
    
    console.log("=== LOGIN SUCCESS ===");
    console.log("Full Response:", response);
    console.log("Response Data:", response.data);
    
    return includeHeaderToken(response);
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
        return includeHeaderToken(response);
      } catch (fallbackError) {
        console.error("Generic endpoint also failed:", fallbackError?.response?.data);
        throw fallbackError;
      }
    }
    throw error;
  }
}

export async function requestPasswordOtp(identifier) {
  const response = await api.post("/api/auth/forgot-password", {
    email: String(identifier).trim(),
  });
  return response.data;
}

export async function verifyPasswordOtp(identifier, otp) {
  const response = await api.post("/api/auth/verify-forgot-password-otp", {
    email: String(identifier).trim(),
    otp: String(otp).trim(),
  });
  return response.data;
}

export async function resetStudentPassword(identifier, newPassword) {
  const response = await api.post("/api/auth/reset-password", {
    email: String(identifier).trim(),
    newPassword,
  });
  return response.data;
}

export async function getMyProfile() {
  const response = await api.get(`${API_BASE_URL}/api/api/auth/me`);
  const payload = response.data;
  return payload?.data ?? payload?.student ?? payload?.user ?? payload;
}

export async function createRazorpayOrder(amount, mobileNo, metadata = {}) {
  try {
    const response = await api.post("/api/payments/create-order", {
      amount,
      mobileNo,
      paymentStatus: "PENDING",
      ...metadata,
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

export async function verifyRazorpayPayment({ orderId, paymentId, signature, ...metadata }) {
  try {
    const response = await api.post("/api/payments/verify", {
      orderId,
      paymentId,
      signature,
      ...metadata,
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
