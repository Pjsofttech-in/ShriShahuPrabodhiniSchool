import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BadgeCheck, BookOpen, Building2, CheckCircle2, CreditCard, Download, FileText, GraduationCap, LayoutDashboard, Mail, ShieldCheck, Trophy, User } from "lucide-react";
import schoolLogo from "../../asset/logo.png";
import DashboardShell from "../../components/DashboardShell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getMyProfile,
  fetchStudentById,
  fetchStudentByMobile,
  fetchStudentByEmail,
  fetchCoordinators,
  fetchCenters,
  fetchQuestionsByExamId,
  fetchStudentResults,
  fetchExamAttemptResult,
  fetchStudentResultById,
  getRememberedExamTimestamps,
  fetchTestSeries,
  fetchEbookMaterials,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../services/backendService.js";
import { payWithRazorpay } from "../../utils/razorpay.js";
import { API_BASE_URL } from "../../utils/api.js";
import { getTestSeriesPayments, hasPaidForTestSeries, hasPaidStudentFees, isSuccessfulPayment, saveTestSeriesPayment } from "../../utils/testSeriesAccess.js";

const tabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "profile", label: "My Profile", icon: User },
  { key: "solve", label: "Solve Test Series", icon: Trophy },
  { key: "ebooks", label: "Ebooks", icon: BookOpen },
  { key: "result", label: "My Result", icon: FileText },
];

function isPaymentFlagSet(student) {
  return [
    student?.paymentDone,
    student?.isPaymentDone,
    student?.payment_done,
    student?.isPaid,
    student?.paid,
    student?.paymentCompleted,
    student?.payment_completed,
    student?.payment?.paymentDone,
    student?.payment?.isPaymentDone,
    student?.payment?.isPaid,
    student?.payment?.paid,
    student?.payment?.paymentCompleted,
    student?.payment?.payment_completed,
  ].some((value) => value === true || value === 1 || String(value).toLowerCase() === "true" || String(value) === "1");
}

function getDisplayedPaymentAmount(student) {
  const amountKeys = new Set(["amount", "amountPaid", "paidAmount", "paymentAmount", "registrationFee", "totalAmount", "totalPaid", "amount_paid", "paid_amount", "payment_amount", "amountInPaise", "amount_paid_paise", "paidAmountInPaise"]);
  const visited = new Set();
  function findAmount(value, depth = 0) {
    if (!value || typeof value !== "object" || depth > 6 || visited.has(value)) return null;
    visited.add(value);
    for (const [key, nestedValue] of Object.entries(value)) {
      if (amountKeys.has(key) && nestedValue !== null && nestedValue !== "" && Number.isFinite(Number(nestedValue))) return key.toLowerCase().includes("paise") ? Number(nestedValue) / 100 : nestedValue;
    }
    for (const nestedValue of Object.values(value)) {
      const found = findAmount(nestedValue, depth + 1);
      if (found !== null) return found;
    }
    return null;
  }
  const rawAmount = findAmount(student);
  if (rawAmount == null || rawAmount === "") return null;
  const amount = Number(rawAmount);
  if (!Number.isFinite(amount)) return rawAmount;
  return amount > 100000 ? amount / 100 : amount;
}

function normaliseStudentEbook(item) {
  const subcategory = item?.vmSubcategory ?? item?.subcategory ?? {};
  const category = item?.category ?? subcategory?.vmCategory ?? {};
  const value = (keys, fallback = "") => keys.map((key) => item?.[key]).find((entry) => entry !== undefined && entry !== null && entry !== "") ?? fallback;
  const status = String(value(["status"], "free")).toLowerCase();
  return {
    id: item?.id,
    title: value(["chapterName", "materialName", "title"], "Untitled material"),
    materialType: value(["materialtype", "materialType", "materialTypeName"], "Ebook"),
    categoryName: value(["categoryName"], category?.categoryName ?? category?.name ?? ""),
    thumbnail: value(["thumbnailFile", "thumbnail", "image", "imageUrl"], ""),
    pdfFile: value(["pdfFile", "fileUrl", "pdf", "pdfPath", "filePath", "file", "downloadUrl", "url"], ""),
    status,
    mrp: Number(item?.mrp ?? 0),
    price: Number(item?.price ?? 0),
  };
}

function findQuestionList(payload) {
  const sources = [payload, payload?.data, payload?.result, payload?.data?.result].filter((source) => source && typeof source === "object");
  return sources.flatMap((source) => [
    source.questions,
    source.questionResponses,
    source.resultQuestions,
    source.resultQuestionResponses,
    source.questionResults,
    source.studentAnswers,
    source.answers,
    source.answerDetails,
    source.questionAnswerDetails,
    source.question_answer_details,
    source.details,
    source.questionList,
    source.questionsList,
    source.items,
  ].filter((items) => Array.isArray(items) && items.length > 0))[0] || null;
}

function getQuestionId(question) {
  return question?.questionId ?? question?.question_id ?? question?.question?.id ?? question?.question?.questionId ?? question?.id ?? null;
}

function getQuestionText(question) {
  const questionData = question?.question && typeof question.question === "object" ? question.question : question;
  return question?.questionText ?? question?.question_text ?? question?.text ?? (typeof question?.question === "string" ? question.question : null) ?? questionData?.questionText ?? questionData?.text ?? questionData?.question ?? "";
}

function getQuestionOptions(question) {
  const questionData = question?.question && typeof question.question === "object" ? question.question : question;
  let options = question?.options ?? question?.choices ?? question?.optionList ?? questionData?.options ?? [
    question?.optionA ?? questionData?.optionA,
    question?.optionB ?? questionData?.optionB,
    question?.optionC ?? questionData?.optionC,
    question?.optionD ?? questionData?.optionD,
  ].filter((option) => option != null && option !== "");
  if (typeof options === "string") {
    try { options = JSON.parse(options); } catch { options = options.split("|").map((option) => option.trim()).filter(Boolean); }
  }
  if (options && !Array.isArray(options) && typeof options === "object") options = Object.values(options);
  return Array.isArray(options)
    ? options.map((option) => option && typeof option === "object" ? option.text ?? option.label ?? option.value ?? option.optionText ?? option.option_text ?? "" : option).filter((option) => option != null && option !== "")
    : [];
}

function answerOptionIndex(value, options) {
  if (value == null || !options.length) return -1;
  if (typeof value === "object") value = value.text ?? value.label ?? value.value ?? value.answer ?? value.option ?? value.id;
  if (value == null) return -1;

  const normalizedValue = String(value).trim().toLowerCase();
  const exactIndex = options.findIndex((option) => String(option).trim().toLowerCase() === normalizedValue);
  if (exactIndex >= 0) return exactIndex;
  if (/^[a-d]$/i.test(normalizedValue)) return normalizedValue.toUpperCase().charCodeAt(0) - 65;
  const labeledOption = normalizedValue.match(/^([a-d])[).:\-]\s*/i);
  if (labeledOption) return labeledOption[1].toUpperCase().charCodeAt(0) - 65;
  if (/^\d+$/.test(normalizedValue)) {
    const index = Number(normalizedValue);
    if (index >= 0 && index < options.length) return index;
  }
  return -1;
}

function calculateAttemptScore(questions) {
  if (!Array.isArray(questions) || questions.length === 0) return null;
  let score = 0;
  let maxScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  for (const row of questions) {
    const nestedQuestion = row?.question && typeof row.question === "object" ? row.question : {};
    const detail = row?.detail && typeof row.detail === "object" ? row.detail : {};
    const options = getQuestionOptions(row);
    const selectedAnswer = row?.selectedAnswer ?? row?.selected_answer ?? row?.studentAnswer ?? row?.student_answer ?? row?.answerText ?? row?.response ?? row?.selectedOption ?? row?.selected_option ?? detail.selectedAnswer ?? detail.studentAnswer;
    const selectedIndexValue = row?.selectedIndex ?? row?.selected_index ?? row?.answerIndex ?? row?.answer_index ?? row?.studentAnswerIndex ?? row?.student_answer_index ?? detail.selectedIndex ?? detail.answerIndex;
    const selectedIndex = selectedIndexValue == null ? answerOptionIndex(selectedAnswer, options) : answerOptionIndex(selectedIndexValue, options);
    const explicitCorrect = [row?.isCorrect, row?.is_correct, row?.correctness, detail.isCorrect, detail.is_correct, detail.correctness, typeof row?.correct === "boolean" ? row.correct : undefined]
      .find((value) => typeof value === "boolean");
    const correctIndexValue = row?.correctIndex ?? row?.correct_index ?? row?.correctAnswerIndex ?? row?.correct_answer_index ?? row?.correctOptionIndex ?? row?.correct_option_index ?? nestedQuestion.correctIndex ?? nestedQuestion.correct_index;
    const rawCorrectAnswer = row?.correctAnswer ?? row?.correct_answer ?? row?.correctOption ?? row?.correct_option ?? row?.answerKey ?? row?.answer_key ?? row?.answerExplanationKey ?? nestedQuestion.correctAnswer ?? nestedQuestion.correct_answer ?? nestedQuestion.correctOption ?? nestedQuestion.correct_option ?? nestedQuestion.answerKey ?? nestedQuestion.answer_key;
    const correctIndex = correctIndexValue == null ? answerOptionIndex(rawCorrectAnswer, options) : answerOptionIndex(correctIndexValue, options);
    const normalizedSelectedAnswer = selectedAnswer == null ? "" : String(typeof selectedAnswer === "object" ? selectedAnswer.text ?? selectedAnswer.label ?? selectedAnswer.value ?? selectedAnswer.answer ?? "" : selectedAnswer).trim().toLowerCase();
    const normalizedCorrectAnswer = rawCorrectAnswer == null ? "" : String(typeof rawCorrectAnswer === "object" ? rawCorrectAnswer.text ?? rawCorrectAnswer.label ?? rawCorrectAnswer.value ?? rawCorrectAnswer.answer ?? "" : rawCorrectAnswer).trim().toLowerCase();
    const hasCorrectAnswer = explicitCorrect !== undefined || correctIndex >= 0 || Boolean(normalizedCorrectAnswer);
    if (!hasCorrectAnswer) return null;

    const weightValue = nestedQuestion.marksPerQuestion ?? nestedQuestion.marks_per_question ?? nestedQuestion.questionMarks ?? nestedQuestion.question_marks ?? nestedQuestion.marks ?? nestedQuestion.weight ?? row?.maxMarks ?? row?.max_marks ?? row?.totalMarks ?? row?.total_marks ?? row?.marksTotal ?? row?.marks_total;
    const weight = Number(weightValue);
    const questionMarks = Number.isFinite(weight) && weight > 0 ? weight : 1;
    maxScore += questionMarks;

    const answered = selectedAnswer != null && String(typeof selectedAnswer === "object" ? selectedAnswer.text ?? selectedAnswer.label ?? selectedAnswer.value ?? selectedAnswer.answer ?? "" : selectedAnswer).trim() !== "" || selectedIndex >= 0;
    if (!answered) {
      unansweredCount += 1;
      continue;
    }

    const canCompareAnswers = correctIndex >= 0 || Boolean(normalizedCorrectAnswer);
    const isCorrect = canCompareAnswers
      ? (selectedIndex >= 0 && correctIndex >= 0 && selectedIndex === correctIndex) || (normalizedSelectedAnswer !== "" && normalizedSelectedAnswer === normalizedCorrectAnswer)
      : explicitCorrect === true;
    if (isCorrect) {
      score += questionMarks;
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }
  }

  return {
    score,
    maxScore,
    percentage: maxScore ? Math.round((score / maxScore) * 100) : 0,
    correctCount,
    incorrectCount,
    unansweredCount,
  };
}

async function enrichAttemptWithQuestions(attempt) {
  const attemptId = attempt?.attemptId ?? attempt?.attempt_id ?? attempt?.id ?? attempt?.resultId;
  let enrichedAttempt = { ...attempt, ...(attempt?.data ?? {}), attemptId };
  const rememberedTimestamps = getRememberedExamTimestamps(attemptId);
  if (!getResultTimestamp(enrichedAttempt, "started", false) && rememberedTimestamps.startedAt) enrichedAttempt.startedAt = rememberedTimestamps.startedAt;
  if (!getResultTimestamp(enrichedAttempt, "submitted", false) && rememberedTimestamps.submittedAt) enrichedAttempt.submittedAt = rememberedTimestamps.submittedAt;
  const result = enrichedAttempt.result ?? enrichedAttempt;
  const examId = result.examId ?? result.exam_id ?? result.data?.examId ?? result.data?.exam_id ?? result.exam?.id ?? result.exam?.examId ?? attempt.examId ?? attempt.exam_id ?? attempt.data?.examId ?? attempt.exam?.id;
  const answerRows = findQuestionList(result);

  if (examId) {
    try {
      const questionBank = await fetchQuestionsByExamId(examId);
      if (questionBank.length > 0 && answerRows?.length) {
        const questions = answerRows.map((answerRow, index) => {
          const answerText = getQuestionText(answerRow).trim().toLowerCase();
          const matchingQuestion = questionBank.find((question) => {
            const sameId = getQuestionId(question) != null && String(getQuestionId(question)) === String(getQuestionId(answerRow));
            const sameText = answerText && getQuestionText(question).trim().toLowerCase() === answerText;
            return sameId || sameText;
          }) || questionBank[index];
          return { ...matchingQuestion, ...answerRow, question: answerRow.question ?? matchingQuestion };
        });
        enrichedAttempt = enrichedAttempt.result
          ? { ...enrichedAttempt, result: { ...enrichedAttempt.result, questions } }
          : { ...enrichedAttempt, questions };
      }
    } catch (error) {
      console.warn("Could not load question keys for score calculation.", error);
    }
  }

  const questions = findQuestionList(enrichedAttempt.result ?? enrichedAttempt);
  return questions?.length ? applyCalculatedScore(enrichedAttempt, questions) : enrichedAttempt;
}

function applyCalculatedScore(attempt, questions) {
  const calculated = calculateAttemptScore(questions);
  if (!calculated) return attempt;
  const result = attempt?.result && typeof attempt.result === "object" ? attempt.result : attempt;
  const scoredResult = {
    ...result,
    obtainedMarks: calculated.score,
    score: calculated.score,
    totalMarks: calculated.maxScore,
    maxScore: calculated.maxScore,
    percentage: calculated.percentage,
    correctQuestions: calculated.correctCount,
    incorrectQuestions: calculated.incorrectCount,
    unattemptedQuestions: calculated.unansweredCount,
  };
  return attempt?.result && typeof attempt.result === "object"
    ? { ...attempt, result: scoredResult }
    : scoredResult;
}

function getPassFailStatus(percentage, fallback = "Submitted") {
  const numericPercentage = Number(String(percentage ?? "").trim().replace(/%$/, ""));
  if (percentage == null || percentage === "" || !Number.isFinite(numericPercentage)) return fallback;
  return numericPercentage >= 35 ? "Pass" : "Fail";
}

function getPerformanceStatus(percentage) {
  const numericPercentage = Number(String(percentage ?? "").trim().replace(/%$/, ""));
  if (!Number.isFinite(numericPercentage)) return "Performance unavailable";
  if (numericPercentage > 80) return "Best Performance";
  if (numericPercentage >= 50) return "Good Performance";
  if (numericPercentage >= 35) return "Average Performance";
  return "Needs Improvement";
}

function getAttemptSummary(attempt) {
  const result = attempt?.result && typeof attempt.result === "object" ? attempt.result : attempt;
  const metadata = { ...attempt, ...attempt?.data, ...attempt?.attempt, ...result, ...result?.data };
  const questions = findQuestionList(result) || [];
  const calculated = calculateAttemptScore(questions);
  const readNumber = (...values) => {
    for (const value of values) {
      if (value === null || value === undefined || value === "") continue;
      const number = Number(value);
      if (Number.isFinite(number)) return number;
    }
    return null;
  };
  const score = calculated?.score ?? readNumber(metadata.obtainedMarks, metadata.obtained_marks, metadata.score, metadata.marks, metadata.totalMarksObtained);
  const totalMarks = calculated?.maxScore ?? readNumber(metadata.maxScore, metadata.totalMarks, metadata.total_marks, metadata.maxMarks, metadata.total);
  const totalQuestions = readNumber(metadata.totalQuestions, metadata.total_questions, questions.length) ?? questions.length;
  const attemptedQuestions = readNumber(metadata.attemptedCount, metadata.attemptedQuestions, metadata.answeredCount, metadata.solvedQuestions, metadata.solved_questions)
    ?? questions.filter((question) => question.selectedAnswer ?? question.selected_answer ?? question.studentAnswer ?? question.student_answer ?? question.answerText ?? question.response ?? question.answer).length;
  const correctCount = calculated?.correctCount ?? readNumber(metadata.correctQuestions, metadata.correct_questions, metadata.correctCount, metadata.correct_count);
  const incorrectCount = calculated?.incorrectCount ?? readNumber(metadata.incorrectQuestions, metadata.incorrect_questions, metadata.incorrectCount, metadata.incorrect_count);
  const unansweredCount = calculated?.unansweredCount ?? readNumber(metadata.unattemptedCount, metadata.unattemptedQuestions, metadata.unansweredCount, metadata.unanswered_questions)
    ?? (totalQuestions > 0 ? Math.max(0, totalQuestions - attemptedQuestions) : null);
  const percentage = calculated?.percentage ?? readNumber(metadata.percentage, metadata.percent) ?? (score != null && totalMarks ? Math.round((score / totalMarks) * 100) : null);

  return {
    status: getPassFailStatus(percentage, metadata.status ?? metadata.resultStatus ?? "Submitted"),
    score,
    totalMarks,
    percentage,
    totalQuestions,
    attemptedQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    startedAt: getResultTimestamp(attempt, "started"),
    submittedAt: getResultTimestamp(attempt, "submitted"),
  };
}

function unwrapPaymentRecords(value) {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(unwrapPaymentRecords);

  const recordKeys = ["id", "paymentId", "payment_id", "transactionId", "transaction_id", "referenceNumber", "reference_number", "orderId", "order_id", "status", "paymentStatus", "paymentStatusName", "transactionStatus", "amount", "paidAmount", "paidAt", "paymentDate"];
  if (recordKeys.some((key) => value[key] != null)) return [value];

  return Object.values(value).flatMap(unwrapPaymentRecords);
}

function getPaymentHistory(student, localPayments) {
  const profileSources = [student, student?.data, student?.student, student?.profile].filter(Boolean);
  const profilePayments = profileSources.flatMap((source) => [
    source.paymentHistory,
    source.payment_history,
    source.paymentHistoryList,
    source.payment_history_list,
    source.paymentHistoryData,
    source.payment_history_data,
    source.payments,
    source.studentPayments,
    source.paymentList,
    source.transactionList,
    source.transaction_list,
    source.paymentResponses,
    source.paymentRecords,
    source.payment_records,
    source.paymentTransactions,
    source.transactionHistory,
    source.transaction_history,
    source.latestTransaction,
    source.latest_transaction,
    source.transactions,
    source.payment,
    source.latestPayment,
    source.paymentDetails,
  ].flatMap(unwrapPaymentRecords));
  const allPayments = [...profilePayments, ...Object.values(localPayments)];
  const uniquePayments = new Map();

  allPayments.forEach((payment, index) => {
    const key = payment.paymentId ?? payment.payment_id ?? payment.razorpayPaymentId ?? payment.orderId ?? payment.order_id ?? payment.id ?? `${payment.testSeriesId ?? "payment"}-${payment.paidAt ?? payment.createdAt ?? index}-${payment.amount ?? ""}`;
    uniquePayments.set(String(key), payment);
  });

  return Array.from(uniquePayments.values()).sort((first, second) => {
    const firstDate = new Date(first.paidAt ?? first.paymentDate ?? first.createdAt ?? first.created_at ?? 0).getTime();
    const secondDate = new Date(second.paidAt ?? second.paymentDate ?? second.createdAt ?? second.created_at ?? 0).getTime();
    return secondDate - firstDate;
  });
}

function getResultTimestamp(result, type, includeMetadataFallback = true) {
  const explicitKeys = type === "started"
    ? ["startedAt", "started_at", "startTime", "start_time", "startedOn", "started_on", "startedDate", "startedDateTime", "started_date_time", "startDate", "start_date", "startDateTime", "start_date_time", "start_datetime", "dateStarted", "date_started", "startTimestamp", "start_timestamp", "attemptStartedAt", "attempt_started_at", "attemptStartTime", "attempt_start_time", "attemptStartDate", "attemptStartDateTime", "attempt_start_date_time", "actualStartTime", "examStartedAt", "exam_started_at", "timeStarted", "time_started", "createdAt", "created_at", "createdOn", "created_on", "dateCreated", "date_created"]
    : ["submittedAt", "submitted_at", "submitTime", "submit_time", "submittedTime", "submitted_time", "submitDateTime", "submit_date_time", "submitted_date_time", "submittedOn", "submitted_on", "submittedDate", "submittedDateTime", "submitDate", "submit_date", "dateSubmitted", "date_submitted", "submissionTime", "submission_time", "submissionDateTime", "attemptSubmittedAt", "attempt_submitted_at", "attemptSubmitTime", "attempt_submit_time", "attemptEndDateTime", "attempt_end_date_time", "completedAt", "completed_at", "completedOn", "completed_on", "completedDate", "completedDateTime", "completed_date", "completed_date_time", "dateCompleted", "date_completed", "completionTime", "completionDate", "endTime", "end_time", "endDate", "endDateTime", "end_date_time", "finishTime", "finishedAt", "finished_at", "updatedAt", "updated_at", "updatedOn", "updated_on", "modifiedAt", "modified_at"];
  const metadataKeys = includeMetadataFallback
    ? type === "started"
      ? ["createdAt", "created_at", "createdOn", "created_on", "createdDate", "createdDateTime", "created_date", "created_date_time", "dateCreated", "date_created"]
      : ["updatedAt", "updated_at", "updatedOn", "updated_on", "updatedDate", "updatedDateTime", "modifiedAt", "modified_at", "modifiedDate", "modified_date"]
    : [];
  const timestampValues = new Map();
  const visited = new Set();
  const pending = [{ value: result, depth: 0 }];

  while (pending.length) {
    const { value, depth } = pending.pop();
    if (!value || typeof value !== "object" || depth > 6 || visited.has(value)) continue;
    visited.add(value);

    for (const [key, candidate] of Object.entries(value)) {
      const normalizedKey = String(key).trim().toLowerCase();
      const keySet = new Set([...explicitKeys, ...metadataKeys].map((item) => String(item).trim().toLowerCase()));
      if (candidate != null && candidate !== "" && keySet.has(normalizedKey)) {
        timestampValues.set(normalizedKey, candidate);
      }
    }

    for (const key of [...explicitKeys, ...metadataKeys]) {
      if (!timestampValues.has(String(key).trim().toLowerCase()) && value[key] != null && value[key] !== "") timestampValues.set(String(key).trim().toLowerCase(), value[key]);
    }
    Object.values(value).forEach((child) => pending.push({ value: child, depth: depth + 1 }));
  }

  const candidates = [...explicitKeys, ...metadataKeys].map((key) => String(key).trim().toLowerCase());
  for (const key of candidates) {
    if (timestampValues.has(key)) return timestampValues.get(key);
  }
  return null;
}

function formatDateTime(value) {
  if (value == null || value === "") return "—";
  let normalizedValue = Array.isArray(value)
    ? new Date(Date.UTC(value[0], (value[1] ?? 1) - 1, value[2] ?? 1, value[3] ?? 0, value[4] ?? 0, value[5] ?? 0))
    : value;
  if (typeof normalizedValue === "number" && Math.abs(normalizedValue) < 1e12) normalizedValue *= 1000;
  if (typeof normalizedValue === "string" && /^\d+$/.test(normalizedValue)) {
    const numericValue = Number(normalizedValue);
    if (Number.isFinite(numericValue)) normalizedValue = numericValue < 1e12 ? numericValue * 1000 : numericValue;
  }
  const date = new Date(normalizedValue);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isQuestionMarkedForReview(question) {
  const sources = [question, question?.detail, question?.answer, question?.question].filter((source) => source && typeof source === "object");
  return sources.some((source) => [
    source.markedForReview,
    source.marked_for_review,
    source.isMarkedForReview,
    source.is_marked_for_review,
    source.isMarked,
    source.marked,
    source.reviewed,
    source.review,
  ].some((value) => value === true || value === 1 || String(value).toLowerCase() === "true" || String(value) === "1"));
}

export default function StudentDashboard({ defaultTab = "profile" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(defaultTab);
  const [student, setStudent] = useState(null);
  const [center, setCenter] = useState(null);
  const [coordinator, setCoordinator] = useState(null);
  const { user, refreshProfile } = useAuth();
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);
  const [attemptModalView, setAttemptModalView] = useState("summary");
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState("");
  const [certificateFileName, setCertificateFileName] = useState("performance-certificate.pdf");
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [testSeries, setTestSeries] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  useEffect(() => {
    setTab(location.state?.tab ?? defaultTab);
  }, [defaultTab, location.state]);

  useEffect(() => {
    async function loadData() {
      let studentData = user;

      try {
        const profile = await getMyProfile();
        if (profile && typeof profile === "object") {
          const nestedStudent = profile.student ?? profile.data?.student ?? {};
          studentData = { ...user, ...profile, ...nestedStudent };
        }
      } catch (err) {
        console.warn("Could not load the authenticated student profile.", err);
      }

      try {
        const lookupIds = [
          studentData?.studentId,
          studentData?.student?.id,
          studentData?.id,
          studentData?.userId,
          user?.studentId,
          user?.student?.id,
          user?.id,
          user?.userId,
        ].filter(Boolean);
        for (const id of lookupIds) {
          try {
            const found = await fetchStudentById(id);
            if (found) {
              studentData = {
                ...studentData,
                ...found,
                paymentDone: Boolean(found.paymentDone || found.isPaymentDone || found.payment_done || studentData.paymentDone || studentData.isPaymentDone || studentData.payment_done),
                isPaymentDone: Boolean(found.paymentDone || found.isPaymentDone || found.payment_done || studentData.paymentDone || studentData.isPaymentDone || studentData.payment_done),
              };
              break;
            }
          } catch (err) {
            console.warn("Student lookup by id failed.", err);
          }
        }

        const profileMobile = studentData?.mobile ?? studentData?.mobileNo ?? studentData?.phone;
        const profileEmail = studentData?.email ?? studentData?.emailId;
        if (profileMobile || profileEmail) {
          const matchedStudent = profileMobile
            ? await fetchStudentByMobile(profileMobile)
            : await fetchStudentByEmail(profileEmail);
          if (matchedStudent) {
            studentData = {
              ...studentData,
              ...matchedStudent,
              paymentDone: Boolean(matchedStudent.paymentDone || matchedStudent.isPaymentDone || matchedStudent.payment_done || studentData.paymentDone || studentData.isPaymentDone || studentData.payment_done),
              isPaymentDone: Boolean(matchedStudent.paymentDone || matchedStudent.isPaymentDone || matchedStudent.payment_done || studentData.paymentDone || studentData.isPaymentDone || studentData.payment_done),
            };
          }
        }

      } catch (err) {
        console.warn("Could not enrich the student profile from the students API.", err);
      }

      if (!studentData) return;
      setStudent(studentData);

      const [centersResult, coordinatorsResult] = await Promise.allSettled([
        fetchCenters(),
        fetchCoordinators(),
      ]);
      const centers = centersResult.status === "fulfilled" ? centersResult.value : [];
      const coordinators = coordinatorsResult.status === "fulfilled" ? coordinatorsResult.value : [];

      const centerId = studentData?.examCenterId ?? studentData?.centerId ?? studentData?.center?.id ?? studentData?.center_id;
      const coordinatorId = studentData?.coordinatorId ?? studentData?.coordinator?.id ?? studentData?.coordinator_id;

      setCenter(centers.find((c) => String(c.id) === String(centerId) || String(c.centerId) === String(centerId) || String(c.center_id) === String(centerId)) || null);
      setCoordinator(coordinators.find((c) => String(c.id) === String(coordinatorId) || String(c.coordinatorId) === String(coordinatorId) || String(c.coordinator_id) === String(coordinatorId)) || null);
    }

    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    fetchTestSeries().then(setTestSeries).catch(() => setTestSeries([]));
    fetchEbookMaterials().then((items) => setEbooks(items.map(normaliseStudentEbook).filter((item) => item.id != null))).catch(() => setEbooks([]));
  }, []);

  // Load student results/attempts
  useEffect(() => {
    async function loadResults() {
      if (!student) return;
      setLoadingResults(true);
      setResultsError("");
      try {
        const studentId = student.id ?? student.studentId ?? user?.studentId;
        if (!studentId) {
          setResults([]);
          return;
        }
        const persistedResults = await fetchStudentResults(String(studentId), student);
        const resultStudentId = persistedResults.find((result) => result?.studentId)?.studentId;
        if (resultStudentId && String(resultStudentId) !== String(student.id ?? student.studentId)) {
          const resultStudent = await fetchStudentById(resultStudentId).catch(() => null);
          if (resultStudent) setStudent((current) => ({ ...current, ...resultStudent }));
        }
        const loadedResults = (Array.isArray(persistedResults) ? persistedResults : []).filter((item, index, list) => {
          const itemId = item.attemptId ?? item.id ?? item.resultId ?? item.attempt_id;
          if (!itemId) return true;
          return list.findIndex((candidate) => String(candidate.attemptId ?? candidate.id ?? candidate.resultId ?? candidate.attempt_id) === String(itemId)) === index;
        });
        const hydratedResults = await Promise.all(loadedResults.map(async (item) => {
          const itemAttemptId = item.attemptId ?? item.id ?? item.resultId ?? item.attempt_id;
          if (!itemAttemptId) return enrichAttemptWithQuestions(item);
          try {
            const liveResult = await fetchExamAttemptResult(itemAttemptId);
            return enrichAttemptWithQuestions({ ...item, ...liveResult, attemptId: itemAttemptId });
          } catch (error) {
            console.warn(`Could not load live timestamps for attempt ${itemAttemptId}.`, error);
            return enrichAttemptWithQuestions(item);
          }
        }));
        setResults(hydratedResults.sort((first, second) => {
          const firstDate = new Date(first?.submittedAt ?? first?.startedAt ?? first?.createdAt ?? 0).getTime();
          const secondDate = new Date(second?.submittedAt ?? second?.startedAt ?? second?.createdAt ?? 0).getTime();
          return secondDate - firstDate;
        }));
      } catch (err) {
        console.warn('Could not load student results', err);
        setResultsError(err?.response?.data?.message || err?.response?.data?.error || err?.message || "Unable to load your assessment history.");
        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    }

    loadResults();
  }, [student, user]);

  if (!student) return <div className="min-h-[60vh] flex items-center justify-center">Loading profile...</div>;

  const rollNo = student.rollNo || student.roll_number || student.rollNumber || student.id || student.studentId || "—";
  const studentId = student.id ?? student.studentId ?? user?.studentId ?? user?.id;
  const paymentRecords = getTestSeriesPayments(studentId);
  const paymentHistory = getPaymentHistory(student, paymentRecords);
  const latestSuccessfulPayment = paymentHistory.find(isSuccessfulPayment);
  const paymentStatusFromApi =
    (isPaymentFlagSet(student) ? "PAID" : "") ||
    student.paymentStatus ||
    student.payment_status ||
    student.paymentStatusName ||
    student.payment_status_name ||
    student.transactionStatus ||
    student.transaction_status ||
    student.payment?.status ||
    student.payment?.paymentStatus ||
    student.payment?.payment_status ||
    student.payment?.paymentStatusName ||
    student.payment?.transactionStatus ||
    (student.paymentId || student.payment_id || student.razorpayPaymentId ? "Paid" : "Pending");
  const isStudentFeePaid = Boolean(isPaymentFlagSet(student)) || hasPaidStudentFees(student) || ["paid", "success", "successful", "completed", "captured", "payment successful"].includes(String(paymentStatusFromApi).trim().toLowerCase());
  const isPaymentSuccessful = isStudentFeePaid || Boolean(latestSuccessfulPayment);
  const paymentAmount = getDisplayedPaymentAmount(student) ?? (latestSuccessfulPayment ? getDisplayedPaymentAmount(latestSuccessfulPayment) : null);
  const paymentStatus = isPaymentSuccessful ? "PAID" : String(paymentStatusFromApi).toUpperCase();
  const paymentMode = student.paymentMode || latestSuccessfulPayment?.paymentMode || latestSuccessfulPayment?.mode || (isPaymentSuccessful ? "ONLINE" : "—");
  const selectedSeries = location.state?.purchaseSeries || location.state?.testSeries || null;
  const selectedSeriesPaid = selectedSeries ? (isStudentFeePaid || hasPaidForTestSeries(selectedSeries.id, studentId)) : false;
  const profilePaymentAmount = selectedSeries
    ? Number(selectedSeries.sellingPrice ?? selectedSeries.price ?? 0)
    : Number(student.registrationFee ?? student.registration_fee ?? student.feeAmount ?? student.fee_amount ?? student.amountDue ?? student.amount_due ?? 100);
  const paymentRequired = selectedSeries ? !selectedSeriesPaid : !isPaymentSuccessful;
  const hiddenProfileKeys = new Set(["password", "confirmPassword", "token", "accessToken", "refreshToken", "payment", "latestPayment", "paymentDetails"]);
  const additionalDetails = Object.entries(student).filter(([key, value]) => {
    if (hiddenProfileKeys.has(key) || value == null || value === "" || typeof value === "object") return false;
    return !["id", "studentId", "name", "studentName", "lastName", "fatherName", "gender", "dateOfBirth", "rollNo", "roll_number", "rollNumber", "email", "mobile", "mobileNo", "phone", "address", "village", "state", "pincode", "pinCode", "zipCode", "studentClass", "class", "className", "medium", "school", "schoolName", "instituteName", "district", "districtName", "districtId", "taluka", "talukaName", "talukaId", "centerId", "examCenterId", "centerName", "coordinatorId", "coordinatorName", "active", "paymentStatus", "payment_status", "paymentDone", "isPaymentDone", "paymentId", "payment_id", "razorpayPaymentId", "paymentMode", "amount", "registrationFee", "paymentAmount", "createdAt", "updatedAt"].includes(key);
  });
  const marks = 70 + (String(rollNo).charCodeAt(String(rollNo).length - 1 || 0) % 30);
  const displayName = [student.studentName || student.name, student.lastName].filter(Boolean).join(" ") || "Student";
  const profileInitials = displayName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const completedResults = results.filter((result) => {
    const status = String(result?.status ?? result?.resultStatus ?? result?.result?.status ?? "").toLowerCase();
    return !status || !/pending|started|in.progress|in_progress/i.test(status);
  }).length;
  const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

  async function viewAttempt(attempt, initialView = "questions") {
    setAttemptModalView(initialView);
    const attemptId = attempt.attemptId ?? attempt.id ?? attempt.resultId ?? attempt.attempt_id;
    const resultId = attempt.resultId ?? attempt.result?.id ?? attempt.id;
    if (!attemptId) {
      setSelectedAttempt(attempt);
      setShowAttemptModal(true);
      return;
    }

    try {
      const [attemptDetails, resultDetails] = await Promise.allSettled([
        fetchExamAttemptResult(attemptId),
        resultId ? fetchStudentResultById(resultId) : Promise.resolve(null),
      ]);
      const liveResult = attemptDetails.status === "fulfilled" ? attemptDetails.value : null;
      const historyResult = resultDetails.status === "fulfilled" ? resultDetails.value : null;
      if (!liveResult && !historyResult) throw new Error("No result data was returned for this attempt.");
      // The attempt endpoint is the source of truth for lifecycle timestamps.
      const enrichedAttempt = await enrichAttemptWithQuestions({ ...attempt, ...historyResult, ...liveResult, attemptId });
      setSelectedAttempt(enrichedAttempt);
    } catch (error) {
      console.warn("Could not load exam attempt result.", error);
      setSelectedAttempt({ ...attempt, attemptId });
    }
    setShowAttemptModal(true);
  }

  async function generatePerformanceCertificateDocument(attempt) {
    const { jsPDF } = await import("jspdf");
    const result = attempt.result ?? attempt;
    const metadata = { ...attempt, ...attempt.data, ...attempt.attempt, ...result, ...result.data };
    const summary = getAttemptSummary(attempt);
    const studentName = metadata.studentName ?? metadata.name ?? student?.studentName ?? student?.name ?? "Student";
    const studentClass = metadata.studentClass ?? metadata.class ?? student?.studentClass ?? student?.class ?? "—";
    const examName = metadata.examName ?? metadata.exam_name ?? metadata.exam?.name ?? metadata.title ?? "Sankalp Scholarship Exam";
    const percentage = summary.percentage ?? 0;
    const issuedDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    const orange = [233, 108, 24];
    const orangeDark = [204, 72, 16];
    const cream = [246, 241, 234];
    const navy = [21, 54, 91];

    const logoImage = await fetch(schoolLogo)
      .then(async (response) => {
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .catch(() => null);

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, width, height, "F");

    pdf.setFillColor(...orange);
    pdf.roundedRect(0, 0, width, 30, 0, 0, "F");
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(20, 15, width - 40, 200, 10, 10, "F");

    if (logoImage) {
      pdf.addImage(logoImage, "PNG", width / 2 - 15, 8, 30, 30);
    }

    pdf.setTextColor(...navy);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("SHRI SHAHU PRABODHINI", width / 2, 48, { align: "center" });
    pdf.setFontSize(9);
    pdf.text("School of Excellence", width / 2, 54, { align: "center" });

    pdf.setFillColor(...cream);
    pdf.roundedRect(28, 62, width - 56, 128, 10, 10, "F");
    pdf.setDrawColor(...orange);
    pdf.setLineWidth(1.6);
    pdf.roundedRect(30, 64, width - 60, 124, 10, 10, "S");

    pdf.setTextColor(...navy);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("CERTIFICATE OF ACADEMIC EXCELLENCE", width / 2, 82, { align: "center" });

    pdf.setTextColor(...orange);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("This is to recognize", width / 2, 97, { align: "center" });

    pdf.setTextColor(...navy);
    pdf.setFont("times", "bolditalic");
    pdf.setFontSize(26);
    pdf.text(String(studentName), width / 2, 116, { align: "center" });

    pdf.setTextColor(...navy);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    const descriptor = `for outstanding academic achievement during the ${new Date().getFullYear() - 1}-${new Date().getFullYear()} academic year at Shri Shahu Prabodhini School.`;
    const descriptorLines = pdf.splitTextToSize(descriptor, 150);
    pdf.text(descriptorLines, width / 2, 132, { align: "center" });

    pdf.setTextColor(...navy);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(`Class: ${studentClass}`, width / 2, 154, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(`Academic Session: ${new Date().getFullYear() - 1}-${new Date().getFullYear()}`, width / 2, 166, { align: "center" });
    pdf.text(`Issued on: ${issuedDate}`, width / 2, 172, { align: "center" });
    pdf.text(`Percentage: ${percentage}%`, width / 2, 178, { align: "center" });

    pdf.setDrawColor(...orange);
    pdf.setLineWidth(0.8);
    pdf.line(42, 188, 118, 188);
    pdf.line(width - 118, 188, width - 42, 188);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("AUTHORIZED SIGNATORY", 80, 198, { align: "center" });
    pdf.text("PRINCIPAL", width - 80, 198, { align: "center" });

    const fileName = `performance-certificate-${String(studentName).replace(/\s+/g, "-").toLowerCase()}.pdf`;
    const pdfBlob = pdf.output("blob");
    return { fileName, blob: pdfBlob, url: URL.createObjectURL(pdfBlob) };
  }

  async function openPerformanceCertificate(attempt) {
    try {
      const { url, fileName } = await generatePerformanceCertificateDocument(attempt);
      setCertificatePreviewUrl(url);
      setCertificateFileName(fileName);
      setShowCertificatePreview(true);
    } catch (error) {
      console.error("Unable to generate certificate preview.", error);
    }
  }

  async function downloadPerformanceCertificate(attempt) {
    try {
      const { url, fileName } = await generatePerformanceCertificateDocument(attempt);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("Unable to download certificate.", error);
    }
  }

  async function downloadAttemptResult(attempt) {
    const { jsPDF } = await import("jspdf");
    const result = attempt.result ?? attempt;
    const metadata = { ...attempt, ...attempt.data, ...attempt.attempt, ...result, ...result.data };
    const summary = getAttemptSummary(attempt);
    const score = summary.score ?? "-";
    const totalMarks = summary.totalMarks ?? "-";
    const percentage = summary.percentage ?? "-";
    const examName = metadata.examName ?? metadata.exam_name ?? metadata.exam?.name ?? "Exam Attempt";
    const attemptId = metadata.attemptId ?? metadata.id ?? metadata.resultId ?? "-";
    const status = summary.status;
    const startedAt = getResultTimestamp(attempt, "started");
    const submittedAt = getResultTimestamp(attempt, "submitted");
    const questions = findQuestionList(result) || [];
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    let cursorY = 14;

    const addPageIfNeeded = (height = 10) => {
      if (cursorY + height <= pageHeight - 14) return;
      pdf.addPage();
      cursorY = 14;
      pdf.setFillColor(23, 59, 95);
      pdf.rect(0, 0, pageWidth, 8, "F");
    };
    const drawLabelValue = (label, value, x, y, width) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(label.toUpperCase(), x, y);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(23, 59, 95);
      pdf.text(pdf.splitTextToSize(String(value ?? "-"), width), x, y + 5);
    };

    pdf.setFillColor(23, 59, 95);
    pdf.rect(0, 0, pageWidth, 43, "F");
    pdf.setFillColor(243, 185, 61);
    pdf.circle(pageWidth - 22, 13, 13, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(21);
    pdf.text("SHRI SHAHU", margin, 17);
    pdf.setFontSize(9);
    pdf.text("PRABODHINI SCHOOL  |  EXAM RESULT", margin, 24);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Official student performance report", margin, 32);
    cursorY = 55;

    pdf.setTextColor(23, 59, 95);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.text(String(examName), margin, cursorY);
    cursorY += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Attempt ID: ${attemptId}`, margin, cursorY);
    cursorY += 10;

    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(margin, cursorY, pageWidth - margin * 2, 55, 3, 3, "FD");
    const columnWidth = (pageWidth - margin * 2 - 12) / 3;
    drawLabelValue("Status", status, margin + 6, cursorY + 9, columnWidth - 5);
    drawLabelValue("Score", `${score} / ${totalMarks}`, margin + 6 + columnWidth, cursorY + 9, columnWidth - 5);
    drawLabelValue("Percentage", `${percentage}%`, margin + 6 + columnWidth * 2, cursorY + 9, columnWidth - 5);
    drawLabelValue("Started", formatDateTime(startedAt).replace("—", "-"), margin + 6, cursorY + 25, columnWidth - 5);
    drawLabelValue("Submitted", formatDateTime(submittedAt).replace("—", "-"), margin + 6 + columnWidth, cursorY + 25, columnWidth - 5);
    drawLabelValue("Questions", summary.totalQuestions || questions.length || "-", margin + 6 + columnWidth * 2, cursorY + 25, columnWidth - 5);
    drawLabelValue("Correct", summary.correctCount ?? "-", margin + 6, cursorY + 41, columnWidth - 5);
    drawLabelValue("Incorrect", summary.incorrectCount ?? "-", margin + 6 + columnWidth, cursorY + 41, columnWidth - 5);
    drawLabelValue("Not attempted", summary.unansweredCount ?? "-", margin + 6 + columnWidth * 2, cursorY + 41, columnWidth - 5);
    cursorY += 65;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(23, 59, 95);
    pdf.text("Question Review", margin, cursorY);
    cursorY += 8;

    questions.forEach((question, index) => {
      const questionData = question.question && typeof question.question === "object" ? question.question : question;
      let options = question.options ?? question.choices ?? question.optionList ?? questionData.options ?? [question.optionA ?? questionData.optionA, question.optionB ?? questionData.optionB, question.optionC ?? questionData.optionC, question.optionD ?? questionData.optionD].filter((option) => option != null && option !== "");
      if (typeof options === "string") {
        try { options = JSON.parse(options); } catch (error) { options = options.split("|").map((option) => option.trim()).filter(Boolean); }
      }
      const selected = question.selectedAnswer ?? question.selected_answer ?? question.studentAnswer ?? question.student_answer ?? question.answerText ?? question.answer ?? "Not answered";
      const rawCorrect = question.correctAnswer ?? question.correct_answer ?? question.correctOption ?? question.correct_option ?? question.answerKey ?? null;
      const correctIndex = rawCorrect !== null && /^[A-Z]$/i.test(String(rawCorrect).trim()) ? String(rawCorrect).trim().toUpperCase().charCodeAt(0) - 65 : -1;
      const correct = correctIndex >= 0 && Array.isArray(options) ? options[correctIndex] : rawCorrect ?? "Not available";
      const selectedText = typeof selected === "object" ? JSON.stringify(selected) : String(selected);
      const correctText = typeof correct === "object" ? JSON.stringify(correct) : String(correct);
      const isCorrect = question.correct === true || (selectedText !== "Not answered" && selectedText.trim() === correctText.trim());
      const questionText = question.questionText ?? question.question_text ?? questionData.question ?? questionData.text ?? "Question";
      const explanation = question.answerExplanation ?? question.answer_explanation ?? question.explanation ?? question.solution ?? "Not available";
      const markedForReview = isQuestionMarkedForReview(question);
      const optionLines = Array.isArray(options) && options.length ? options.map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${option}`) : ["Options not available"];
      const bodyLines = [
        ...pdf.splitTextToSize(`Q${index + 1}. ${questionText}`, pageWidth - margin * 2 - 12),
        ...(markedForReview ? ["MARKED FOR REVIEW"] : []),
        ...optionLines.flatMap((option) => pdf.splitTextToSize(String(option), pageWidth - margin * 2 - 20)),
        ...pdf.splitTextToSize(`Student answer: ${selectedText}`, pageWidth - margin * 2 - 20),
        ...pdf.splitTextToSize(`Correct answer: ${correctText}`, pageWidth - margin * 2 - 20),
        ...pdf.splitTextToSize(`Explanation: ${explanation}`, pageWidth - margin * 2 - 20),
      ];
      const cardHeight = 10 + bodyLines.length * 4.5;
      addPageIfNeeded(cardHeight + 5);
      pdf.setFillColor(isCorrect ? 236 : 254, isCorrect ? 253 : 242, isCorrect ? 245 : 242);
      pdf.setDrawColor(isCorrect ? 167 : 254, isCorrect ? 243 : 202, isCorrect ? 208 : 202);
      pdf.roundedRect(margin, cursorY, pageWidth - margin * 2, cardHeight, 2, 2, "FD");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(23, 59, 95);
      pdf.text(bodyLines[0], margin + 6, cursorY + 7);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      let bodyY = cursorY + 13;
      bodyLines.slice(1).forEach((line, lineIndex) => {
        const isStudent = line.startsWith("Student answer:");
        const isCorrectAnswer = line.startsWith("Correct answer:");
        pdf.setTextColor(isStudent && !isCorrect ? 185 : isCorrectAnswer || (isStudent && isCorrect) ? 5 : 71, isStudent && !isCorrect ? 28 : isCorrectAnswer || (isStudent && isCorrect) ? 150 : 85, isCorrectAnswer || (isStudent && isCorrect) ? 105 : 105);
        pdf.text(line, margin + 8, bodyY);
        bodyY += 4.5;
      });
      cursorY += cardHeight + 5;
    });
    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      pdf.setPage(page);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Shri Shahu Prabodhini School  |  Page ${page} of ${pageCount}`, margin, pageHeight - 7);
    }
    pdf.save(`exam-result-${attemptId}.pdf`);
  }

  async function handleSeriesPayment(series) {
    const amount = Number(series.sellingPrice ?? series.price ?? 0);
    if (!amount || !student) return;
    setPaymentError("");
    setPaymentTarget(series);

    try {
      const metadata = { testSeriesId: series.id, testSeriesTitle: series.title, amount };
      const order = await createRazorpayOrder(amount, student.mobile, metadata);
      if (!order?.id || !String(order.id).startsWith("order_")) throw new Error("Invalid Razorpay order received from the server.");

      payWithRazorpay({
        amount,
        amountInPaise: Number(order.amount),
        currency: order.currency || "INR",
        name: student.studentName || student.name,
        email: student.email,
        contact: student.mobile,
        orderId: order.id,
        description: `${series.title} Test Series`,
        onSuccess: async ({ paymentId, orderId, signature }) => {
          try {
            const verification = await verifyRazorpayPayment({ orderId: orderId || order.id, paymentId, signature, ...metadata });
            const verified = verification === "Payment Successful" || verification?.success === true || verification?.verified === true || verification?.message === "Payment verified";
            if (!verified) throw new Error("Payment verification failed.");
            const record = saveTestSeriesPayment(series.id, { ...metadata, studentId, paymentId, orderId: orderId || order.id, signature, status: "PAID" });
            setPaymentTarget(null);
            setPaymentSuccess(record);
          } catch (error) {
            setPaymentError(error?.response?.data?.message || error?.message || "Payment verification failed. Please try again.");
            setPaymentTarget(null);
          }
        },
        onFailure: (message) => {
          setPaymentError(message || "Payment was not completed. Please try again.");
          setPaymentTarget(null);
        },
      });
    } catch (error) {
      setPaymentError(error?.response?.data?.message || error?.message || "Unable to create payment order. Please try again.");
      setPaymentTarget(null);
    }
  }

  async function handleProfilePayment() {
    if (selectedSeries) {
      await handleSeriesPayment(selectedSeries);
      return;
    }
    if (!student || !Number.isFinite(profilePaymentAmount) || profilePaymentAmount <= 0 || paymentTarget) return;

    setPaymentError("");
    setPaymentTarget("student-fees");
    const metadata = {
      studentId,
      studentName: student.studentName || student.name,
      paymentType: "STUDENT_FEES",
      purpose: "STUDENT_FEES",
      amount: profilePaymentAmount,
    };

    try {
      const order = await createRazorpayOrder(profilePaymentAmount, student.mobile, metadata);
      if (!order?.id || !String(order.id).startsWith("order_")) throw new Error("Invalid Razorpay order received from the server.");

      payWithRazorpay({
        amount: profilePaymentAmount,
        amountInPaise: Number(order.amount),
        currency: order.currency || "INR",
        name: student.studentName || student.name,
        email: student.email,
        contact: student.mobile,
        orderId: order.id,
        description: "Student fees",
        onSuccess: async ({ paymentId, orderId, signature }) => {
          try {
            const verifiedPayment = await verifyRazorpayPayment({ orderId: orderId || order.id, paymentId, signature, ...metadata });
            const verified = verifiedPayment === "Payment Successful" || verifiedPayment?.success === true || verifiedPayment?.verified === true || verifiedPayment?.message === "Payment verified";
            if (!verified) throw new Error("Payment verification failed.");
            const record = saveTestSeriesPayment("student-fees", {
              ...metadata,
              testSeriesTitle: "Student fees",
              paymentId,
              orderId: orderId || order.id,
              signature,
              status: "PAID",
            });
            setStudent((current) => ({
              ...current,
              paymentDone: true,
              isPaymentDone: true,
              paymentStatus: "PAID",
              paymentId,
              paymentMode: "ONLINE",
              amount: profilePaymentAmount,
            }));
            setPaymentTarget(null);
            setPaymentSuccess(record);
            refreshProfile?.();
          } catch (error) {
            setPaymentError(error?.response?.data?.message || error?.message || "Payment verification failed. Please try again.");
            setPaymentTarget(null);
          }
        },
        onFailure: (message) => {
          setPaymentError(message || "Payment was not completed. Please try again.");
          setPaymentTarget(null);
        },
      });
    } catch (error) {
      setPaymentError(error?.response?.data?.message || error?.message || "Unable to create payment order. Please try again.");
      setPaymentTarget(null);
    }
  }

  function openSeries(series) {
    navigate(`/sankalp/test-series/${series.id}`);
  }

  function ebookMediaUrl(value) {
    if (!value) return "";
    if (/^(https?:|data:|blob:)/i.test(String(value))) return value;
    const origin = API_BASE_URL.replace(/\/api(?:\/.*)?$/i, "").replace(/\/+$/g, "");
    return `${origin}/${String(value).replace(/^\/+/, "")}`;
  }

  return (
    <DashboardShell title="Student" roleLabel="Student" tabs={tabs} activeTab={tab} onTabChange={setTab}>
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="card p-6 text-center"><p className="font-mono font-bold text-navy text-lg">{rollNo}</p><p className="text-xs text-muted mt-1">Roll Number</p></div>
            <div className="card p-6 text-center"><p className="font-display font-bold text-navy text-lg">{student.class || student.studentClass || "—"}</p><p className="text-xs text-muted mt-1">Class</p></div>
            <div className="card p-6 text-center"><p className="font-display font-bold text-navy text-lg">{paymentStatus}</p><p className="text-xs text-muted mt-1">Payment Status</p></div>
          </div>
          <PaymentHistoryGroup paymentHistory={paymentHistory} formatDate={formatDate} />
        </div>
      )}
      {tab === "solve" && (
        <div className="space-y-5">
          <div>
            <p className="eyebrow text-gold-dark">Student practice</p>
            <h2 className="mt-1 text-2xl font-bold text-navy">Solve Test Series</h2>
            <p className="mt-1 text-sm text-muted">Free series are ready to solve. Paid series appear here after successful payment.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {testSeries.map((series) => {
              const isFree = (series.price !== null && series.price !== undefined && series.price !== "" && Number(series.price) === 0) || (series.sellingPrice !== null && series.sellingPrice !== undefined && series.sellingPrice !== "" && Number(series.sellingPrice) === 0);
              const paid = isStudentFeePaid || hasPaidForTestSeries(series.id, studentId);
              return (
                <article key={series.id} className="card flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3"><h3 className="font-display text-lg font-bold text-navy">{series.title}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${isFree || paid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{isFree ? "Free" : paid ? "Paid" : "Fee pending"}</span></div>
                  <p className="text-sm text-muted">{isFree ? "Open access" : `₹${Number(series.sellingPrice ?? series.price).toLocaleString("en-IN")}`}</p>
                  <button type="button" onClick={() => isFree || paid ? openSeries(series) : handleSeriesPayment(series)} className="btn-primary mt-auto w-full justify-center">{isFree || paid ? "Solve Test Series" : "Buy Test Series"}</button>
                </article>
              );
            })}
          </div>
        </div>
      )}
      {tab === "ebooks" && (
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl bg-[linear-gradient(120deg,#173b5f_0%,#205b78_55%,#e86516_145%)] p-6 text-white shadow-[0_16px_35px_rgba(23,59,95,0.18)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f8d77e]">Student library</p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Your Ebooks</h2>
            <p className="mt-2 max-w-xl text-sm text-white/75">Browse study material, previews and learning resources from the complete ebook library.</p>
          </section>
          {ebooks.length === 0 ? <div className="card p-10 text-center text-muted">No ebooks are available right now.</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{ebooks.map((ebook) => {
            const isFree = ebook.status === "free" || ebook.price <= 0;
            const hasAccess = isFree || isStudentFeePaid;
            const image = ebookMediaUrl(ebook.thumbnail);
            return <article key={ebook.id} className="group overflow-hidden rounded-2xl border border-[#f3d1ae] bg-white shadow-[0_10px_25px_rgba(23,59,95,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(232,101,22,0.16)]">
              <div className="aspect-[1.7] overflow-hidden bg-[#fff0df]">{image ? <img src={image} alt={ebook.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[#e86516]"><BookOpen size={38} /></div>}</div>
              <div className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a65a2b]">{ebook.materialType}</p><h3 className="mt-1 line-clamp-2 font-display text-lg font-bold text-[#d9570b]">{ebook.title}</h3></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${isFree || hasAccess ? "bg-green-50 text-green-700" : "bg-[#fff0df] text-[#d9570b]"}`}>{isFree ? "Free" : hasAccess ? "Paid" : `₹${ebook.price}`}</span></div><p className="mt-2 text-xs text-muted">{ebook.categoryName || "Study material"}</p><a href={hasAccess ? (ebookMediaUrl(ebook.pdfFile) || "/sankalp/ebook") : undefined} target={ebook.pdfFile ? "_blank" : undefined} rel="noreferrer" className={`mt-4 flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-bold ${hasAccess ? "bg-[#e86516] text-white hover:bg-[#c84c0b]" : "pointer-events-none bg-slate-100 text-slate-400"}`}>{hasAccess ? "View Ebook" : "Buy Ebook"}</a></div>
            </article>;
          })}</div>}
        </div>
      )}
      {tab === "profile" && (
        <div className="space-y-5">
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#173b5f] via-[#205b78] to-[#317f89] p-6 text-white shadow-[0_16px_35px_rgba(23,59,95,0.18)] sm:p-8">
            <div className="absolute -right-14 -top-20 h-52 w-52 rounded-full border-[24px] border-white/10" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#f3b93d] text-xl font-extrabold text-[#173b5f] shadow-lg">{profileInitials}</div>
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#f8d77e]">Student profile</p>
                  <h2 className="font-display text-2xl font-bold sm:text-3xl">{displayName}</h2>
                  <p className="mt-1 text-sm text-white/75">Student ID: {student.id ?? student.studentId ?? "—"}</p>
                </div>
              </div>
              <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${student.active === false ? "border-red-200/30 bg-red-400/15 text-red-100" : "border-emerald-200/30 bg-emerald-400/15 text-emerald-50"}`}>
                <BadgeCheck size={16} /> {student.active === false ? "Inactive account" : "Active student"}
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-3">
            <ProfileStat icon={GraduationCap} label="Class & medium" value={`${student.studentClass || student.class || "—"} · ${student.medium || "—"}`} />
            <ProfileStat icon={Trophy} label="Tests completed" value={String(completedResults)} />
            <ProfileStat icon={ShieldCheck} label="Payment" value={paymentStatus} positive={isPaymentSuccessful} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ProfileGroup icon={User} title="Personal details">
              <Row label="Father name" value={student.fatherName || "—"} />
              <Row label="Last name" value={student.lastName || "—"} />
              <Row label="Gender" value={student.gender || "—"} />
              <Row label="Date of birth" value={formatDate(student.dateOfBirth)} />
              <Row label="Roll number" value={rollNo} />
            </ProfileGroup>
            <ProfileGroup icon={Mail} title="Contact details">
              <Row label="Email" value={student.email || "—"} />
              <Row label="Mobile" value={student.mobile || "—"} />
              <Row label="Address" value={student.address || "—"} />
              <Row label="Village" value={student.village || "—"} />
              <Row label="State / pincode" value={`${student.state || "—"} / ${student.pincode || "—"}`} />
            </ProfileGroup>
            <ProfileGroup icon={Building2} title="Education & centre">
              <Row label="School" value={student.school || student.schoolName || "—"} />
              <Row label="District" value={`${student.districtName || student.district || "—"} (${student.districtId ?? "—"})`} />
              <Row label="Taluka" value={`${student.talukaName || student.taluka || "—"} (${student.talukaId ?? "—"})`} />
              <Row label="Centre" value={`${student.centerName || center?.centerName || center?.name || "—"} (${student.centerId ?? "—"})`} />
              <Row label="Coordinator" value={`${student.coordinatorName || coordinator?.name || coordinator?.fullName || "—"} (${student.coordinatorId ?? "—"})`} />
            </ProfileGroup>
            <ProfileGroup icon={CreditCard} title="Account & payment">
              <Row label="Payment done" value={isPaymentSuccessful ? "Yes" : "No"} />
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-2">
                <dt className="text-muted">Payment status</dt>
                <dd className="flex items-center gap-2 text-right font-semibold text-navy">
                  <span>{paymentRequired ? "PENDING" : paymentStatus}</span>
                  {paymentRequired && <button type="button" onClick={handleProfilePayment} disabled={Boolean(paymentTarget)} className="inline-flex items-center gap-1 rounded-md bg-[#e86516] px-2.5 py-1.5 text-xs font-bold text-white shadow-[0_4px_10px_rgba(232,101,22,0.25)] transition hover:-translate-y-0.5 hover:bg-[#c84c0b] disabled:cursor-wait disabled:opacity-60">{paymentTarget ? "Processing..." : <><CreditCard size={13} /> Pay ₹{profilePaymentAmount.toLocaleString("en-IN")}</>}</button>}
                </dd>
              </div>
              <Row label="Payment mode" value={paymentMode} />
              <Row label="Amount" value={paymentAmount == null ? "—" : `₹${Number(paymentAmount).toLocaleString("en-IN")}`} />
              <Row label="Member since" value={formatDate(student.createdAt)} />
            </ProfileGroup>
            {additionalDetails.length > 0 && (
              <ProfileGroup icon={FileText} title="Additional details">
                {additionalDetails.map(([key, value]) => (
                  <Row key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())} value={String(value)} />
                ))}
              </ProfileGroup>
            )}
          </div>

          {paymentError && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{paymentError}</p>}

          {selectedSeries && !selectedSeriesPaid && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Fees pending</p><h3 className="mt-1 text-lg font-bold text-navy">{selectedSeries.title}</h3><p className="mt-1 text-sm text-muted">Pay ₹{Number(selectedSeries.sellingPrice ?? selectedSeries.price ?? 0).toLocaleString("en-IN")} to unlock every paper in this series.</p></div>
                <button type="button" onClick={() => handleSeriesPayment(selectedSeries)} disabled={Boolean(paymentTarget)} className="btn-primary shrink-0 justify-center disabled:opacity-60">{paymentTarget ? "Processing..." : "Pay Fees"}</button>
              </div>
              {paymentError && <p className="mt-3 text-sm font-semibold text-red-600">{paymentError}</p>}
            </section>
          )}

          {selectedSeries && selectedSeriesPaid && (
            <section className="rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Fees paid</p><h3 className="mt-1 text-lg font-bold text-navy">{selectedSeries.title}</h3><p className="mt-1 text-sm text-muted">You have access to all papers in this test series.</p></div>
                <button type="button" onClick={() => openSeries(selectedSeries)} className="btn-primary shrink-0 justify-center bg-green-600 hover:bg-green-700">Solve Test Series</button>
              </div>
            </section>
          )}

          <PaymentHistoryGroup paymentHistory={paymentHistory} formatDate={formatDate} />
        </div>
      )}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto text-green-600" size={52} />
            <h2 className="mt-3 text-2xl font-bold text-navy">Payment Successful</h2>
            <p className="mt-2 text-sm text-muted">{paymentSuccess.testSeriesId === "student-fees" ? "Your student fees have been paid and verified." : `${paymentSuccess.testSeriesTitle} is now available in Solve Test Series.`}</p>
            <p className="mt-3 text-xs text-slate-500">Payment ID: {paymentSuccess.paymentId || "—"}</p>
            <button type="button" onClick={() => setPaymentSuccess(null)} className="btn-primary mt-6 w-full justify-center">Continue</button>
          </div>
        </div>
      )}
      {showCertificatePreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#e86516]">Certificate</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => downloadPerformanceCertificate(selectedAttempt ?? results[0])} className="inline-flex items-center gap-2 rounded-xl bg-[#e86516] px-3 py-2 text-xs font-bold text-white shadow-[0_10px_20px_rgba(232,101,22,0.25)] transition hover:bg-[#d95b12]">
                  <Download size={14} /> Download
                </button>
                <button type="button" onClick={() => { setShowCertificatePreview(false); setCertificatePreviewUrl(""); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900">
                  Close
                </button>
              </div>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-[#f3f4f6] p-3 sm:p-5">
              {certificatePreviewUrl ? (
                <iframe title="Performance certificate preview" src={certificatePreviewUrl} className="h-[70vh] w-full rounded-2xl border border-slate-200 bg-white" />
              ) : (
                <div className="grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">Certificate preview unavailable.</div>
              )}
            </div>
          </div>
        </div>
      )}
      {tab === "result" && (
        <div className="space-y-5">
          <section className="card overflow-hidden border-0 bg-[#173b5f] p-6 text-white shadow-[0_14px_30px_rgba(23,59,95,0.16)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f8d77e]">Assessment history</p><h3 className="font-display text-2xl font-bold sm:text-3xl">My test results</h3><p className="mt-2 max-w-xl text-sm text-white/70">Every exam attempt linked to your student account appears here, newest first.</p></div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-left sm:text-right"><p className="text-2xl font-bold text-[#f8d77e]">{results.length}</p><p className="text-xs text-white/65">total attempts</p></div>
            </div>
          </section>

          {loadingResults ? (
            <div className="card flex items-center gap-3 p-8 text-sm text-muted"><span className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" /> Loading complete test history...</div>
          ) : resultsError ? (
            <div className="card border-red-200 bg-red-50 p-8 text-center"><p className="font-semibold text-red-700">Assessment history could not be loaded</p><p className="mt-1 text-sm text-red-600">{resultsError}</p></div>
          ) : results.length === 0 ? (
            <div className="card p-8 text-center"><Trophy className="mx-auto mb-3 text-gold" size={30} /><p className="font-semibold text-navy">No exam attempts found</p><p className="mt-1 text-sm text-muted">Your completed tests will appear here.</p></div>
          ) : (
            <div className="space-y-4">
              {results.map((r, resultIndex) => {
                // Try to canonicalize fields from common server shapes
                const attemptId = r.attemptId ?? r.id ?? r.resultId ?? r.attempt_id ?? r.attemptId;
                const examName = r.examName ?? r.exam_name ?? r.exam?.examName ?? r.exam?.name ?? r.examTitle ?? r.testSeries?.title ?? r.testSeries?.name ?? r.title ?? "Exam";
                const resultData = r.result ?? r;
                const obtained = resultData.obtainedMarks ?? resultData.obtained_marks ?? resultData.marks ?? resultData.score ?? resultData.obtained ?? null;
                const total = resultData.totalMarks ?? resultData.total_marks ?? resultData.total ?? resultData.maxMarks ?? null;
                const resultAmount = resultData.amount ?? resultData.amountPaid ?? resultData.paidAmount ?? resultData.paymentAmount ?? paymentAmount;
                const percentage = resultData.percentage ?? resultData.percent ?? (obtained != null && total ? Math.round((Number(obtained) / Number(total)) * 100) : null);
                const resultStatus = getPassFailStatus(percentage, resultData.status ?? resultData.resultStatus ?? resultData.result ?? "Submitted");
                const performanceStatus = getPerformanceStatus(percentage);
                const startedAt = getResultTimestamp(r, "started");
                const submittedAt = getResultTimestamp(r, "submitted");
                const attemptedCount = r.attemptedCount ?? r.attemptedQuestions ?? r.answeredCount ?? null;
                const unattemptedCount = r.unattemptedCount ?? r.unattemptedQuestions ?? r.unansweredCount ?? null;
              const historyQuestions = findQuestionList(r) || [];
              const reviewedCount = r.reviewedCount ?? r.markedCount ?? r.markedForReviewCount ?? (historyQuestions.length ? historyQuestions.filter(isQuestionMarkedForReview).length : null);

                return (
                  <div key={String(attemptId || resultIndex)} className="card group flex flex-col gap-5 border-l-4 border-l-gold p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(23,59,95,0.12)] sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><div className="font-display text-lg font-bold text-navy">{examName}</div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${resultStatus === "Pass" ? "bg-emerald-50 text-emerald-700" : resultStatus === "Fail" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{resultStatus}</span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">{performanceStatus}</span></div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span>Started: {formatDateTime(startedAt)}</span>
                        <span>Submitted: {formatDateTime(submittedAt)}</span>
                        <span>Amount paid: {resultAmount == null ? "—" : `₹${Number(resultAmount).toLocaleString("en-IN")}`}</span>
                      </div>
                      {(attemptedCount !== null || unattemptedCount !== null || reviewedCount !== null) && (
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold">
                          {attemptedCount !== null && <span className="rounded-full bg-green-50 px-2 py-1 text-green-700">Attempted: {attemptedCount}</span>}
                          {unattemptedCount !== null && <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Not attempted: {unattemptedCount}</span>}
                          {reviewedCount !== null && <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">Review: {reviewedCount}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-5 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0">
                      <div className="text-left sm:text-right"><div className="text-2xl font-bold text-navy">{percentage != null ? `${percentage}%` : "—"}</div><div className="text-xs text-muted">Score {obtained ?? "—"}{total ? ` / ${total}` : ""}</div></div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button type="button" className="inline-flex items-center gap-1.5 rounded-xl border border-[#d7e4f4] bg-white px-3 py-2 text-[11px] font-bold text-[#173b5f] shadow-[0_8px_18px_rgba(23,59,95,0.07)] transition hover:-translate-y-0.5 hover:border-[#173b5f] hover:text-[#0f2947]" onClick={() => viewAttempt(r)}>View details</button>
                        <button type="button" className="inline-flex items-center gap-1.5 rounded-xl border border-gold/50 bg-gold/10 px-3 py-2 text-[11px] font-bold text-gold-dark transition hover:bg-gold hover:text-white" onClick={() => viewAttempt(r, "summary")}><Trophy size={14} /> Result summary</button>
                        <button type="button" className="inline-flex items-center gap-1.5 rounded-xl bg-[#e86516] px-3 py-2 text-[11px] font-bold text-white shadow-[0_10px_22px_rgba(232,101,22,0.28)] transition hover:-translate-y-0.5 hover:bg-[#d95b12]" onClick={() => openPerformanceCertificate(r)}><Download size={14} /> Certificate</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Attempt Modal */}
          {showAttemptModal && selectedAttempt && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/45 p-3 backdrop-blur-sm sm:p-6">
              <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.28)] sm:max-h-[calc(100dvh-3rem)]">
                <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between border-b border-slate-200 bg-[linear-gradient(135deg,#173b5f_0%,#0f2540_100%)] px-4 py-4 text-white sm:px-6">
                  <div>
                    <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f8d77e]">Attempt detail</div>
                    <h4 className="mt-2 text-lg font-black text-white sm:text-2xl">{selectedAttempt.examName ?? selectedAttempt.exam_name ?? selectedAttempt.exam?.name ?? 'Exam Attempt'}</h4>
                    <p className="mt-1 text-xs text-slate-200 sm:text-sm">Attempt ID: {selectedAttempt.attemptId ?? selectedAttempt.id ?? selectedAttempt.resultId ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 rounded-xl bg-[#e86516] px-3 py-1.5 text-xs font-bold text-white shadow-[0_10px_20px_rgba(232,101,22,0.28)] transition hover:-translate-y-0.5 hover:bg-[#d95b12] sm:text-sm" onClick={() => openPerformanceCertificate(selectedAttempt)} title="Open performance certificate preview">
                      <Download size={14} /> <span className="hidden sm:inline">Certificate</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 sm:text-sm" onClick={() => downloadAttemptResult(selectedAttempt)} title="Download result details">
                      <Download size={14} /> <span className="hidden sm:inline">Download</span>
                    </button>
                    <button className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 sm:text-sm" onClick={() => setShowAttemptModal(false)}>Close</button>
                  </div>
                </div>

                <div className="min-h-0 overflow-y-auto bg-[#f5f7fb] px-4 py-4 sm:px-6 sm:py-5">
                  <div className="mb-4 flex w-fit max-w-full rounded-xl border border-slate-200 bg-white p-1 shadow-sm" role="tablist" aria-label="Attempt result views">
                    {[{ id: "summary", label: "Result summary" }, { id: "questions", label: "Question details" }].map((view) => (
                      <button key={view.id} type="button" role="tab" aria-selected={attemptModalView === view.id} onClick={() => setAttemptModalView(view.id)} className={`rounded-md px-3 py-2 text-xs font-bold transition sm:text-sm ${attemptModalView === view.id ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`}>
                        {view.label}
                      </button>
                    ))}
                  </div>
                  {attemptModalView === "summary" ? (
                    <AttemptSummary summary={getAttemptSummary(selectedAttempt)} amountPaid={selectedAttempt.result?.amount ?? selectedAttempt.amount ?? paymentAmount} />
                  ) : (
                    <>
                  {(() => {
                    const result = selectedAttempt.result ?? selectedAttempt;
                    const metadata = { ...selectedAttempt, ...selectedAttempt.data, ...selectedAttempt.attempt, ...result, ...result.data };
                    const questionRows = findQuestionList(result) || [];
                    const score = metadata.obtainedMarks ?? metadata.obtained_marks ?? metadata.score ?? metadata.marks ?? metadata.totalMarksObtained;
                    const totalMarks = metadata.maxScore ?? metadata.totalMarks ?? metadata.total_marks ?? metadata.maxMarks ?? metadata.total;
                    const percentage = result.percentage ?? result.percent ?? (score != null && totalMarks ? ((Number(score) / Number(totalMarks)) * 100).toFixed(2) : null);
                    const resultAmount = metadata.amount ?? metadata.amountPaid ?? metadata.paidAmount ?? metadata.paymentAmount ?? paymentAmount;
                    const status = getPassFailStatus(percentage, metadata.status ?? metadata.resultStatus ?? metadata.result ?? "Submitted");
                    const attemptedCount = metadata.attemptedCount ?? metadata.attemptedQuestions ?? metadata.answeredCount ?? (questionRows.length ? questionRows.filter((question) => question.selectedAnswer ?? question.selected_answer ?? question.studentAnswer ?? question.student_answer ?? question.answerText ?? question.answer).length : null);
                    const unattemptedCount = metadata.unattemptedCount ?? metadata.unattemptedQuestions ?? metadata.unansweredCount ?? (questionRows.length && attemptedCount !== null ? questionRows.length - Number(attemptedCount) : null);
                    const reviewedCount = metadata.reviewedCount ?? metadata.markedCount ?? metadata.markedForReviewCount ?? (questionRows.length ? questionRows.filter(isQuestionMarkedForReview).length : null);
                    const submittedAt = getResultTimestamp(selectedAttempt, "submitted");
                    const startedAt = getResultTimestamp(selectedAttempt, "started");

                    return (
                      <dl className="grid gap-3 rounded-md border bg-slate-50 p-4 text-sm sm:grid-cols-2">
                        <Row label="Status" value={status || "Submitted"} />
                        <Row label="Score" value={`${score ?? "—"}${totalMarks != null ? ` / ${totalMarks}` : ""}`} />
                        <Row label="Percentage" value={percentage != null ? `${percentage}%` : "—"} />
                        <Row label="Amount paid" value={resultAmount == null ? "—" : `₹${Number(resultAmount).toLocaleString("en-IN")}`} />
                        <Row label="Started" value={formatDateTime(startedAt)} />
                        <Row label="Submitted" value={formatDateTime(submittedAt)} />
                        <Row label="Total Questions" value={metadata.totalQuestions ?? metadata.total_questions ?? (questionRows.length || "—")} />
                        <Row label="Attempted" value={attemptedCount ?? "—"} />
                        <Row label="Not Attempted" value={unattemptedCount ?? "—"} />
                        <Row label="Marked for Review" value={reviewedCount ?? "—"} />
                      </dl>
                    );
                  })()}

                  {/* Try to find questions/answers in multiple possible keys */}
                  {(() => {
                    const result = selectedAttempt.result ?? selectedAttempt;
                    const resultSources = [result, result.data, result.result, result.data?.result].filter((source) => source && typeof source === "object");
                    const qList = resultSources.flatMap((source) => [
                      source.questions,
                      source.questionResponses,
                      source.resultQuestions,
                      source.resultQuestionResponses,
                      source.questionResults,
                      source.studentAnswers,
                      source.answers,
                      source.answerDetails,
                      source.questionAnswerDetails,
                      source.question_answer_details,
                      source.details,
                      source.questionList,
                      source.questionsList,
                      source.items,
                    ].filter((items) => Array.isArray(items) && items.length > 0))[0] || null;
                    if (!qList || !qList.length) {
                      return <div className="text-sm text-muted">No per-question details are available for this attempt.</div>;
                    }

                    return qList.map((q, idx) => {
                      // Normalize a single question/answer structure
                      const qId = q.questionId ?? q.id ?? q.question_id ?? q.question?.id ?? q.questionId;
                      const questionData = q.question && typeof q.question === "object" ? q.question : null;
                      const text = q.questionText ?? q.question_text ?? q.text ?? (typeof q.question === "string" ? q.question : null) ?? questionData?.questionText ?? questionData?.text ?? questionData?.question ?? `Question ${idx + 1}`;
                      const options = getQuestionOptions(q);
                      const selectedIndex = q.selectedIndex ?? q.selected_index ?? q.answerIndex ?? q.answer_index ?? q.studentAnswerIndex ?? q.student_answer_index ?? null;
                      const selectedValue = q.selectedAnswer ?? q.selected_answer ?? q.studentAnswer ?? q.student_answer ?? q.answerText ?? q.response ?? q.answer ?? null;
                      const resolvedSelectedIndex = selectedIndex !== null && selectedIndex !== undefined
                        ? answerOptionIndex(selectedIndex, options)
                        : answerOptionIndex(selectedValue, options);
                      const selected = resolvedSelectedIndex >= 0
                        ? options[resolvedSelectedIndex]
                        : selectedValue && typeof selectedValue === "object"
                          ? selectedValue.text ?? selectedValue.label ?? selectedValue.value ?? selectedValue.answer ?? null
                          : selectedValue;
                      const explicitCorrect = [q.isCorrect, q.is_correct, q.correctness, questionData?.isCorrect, questionData?.is_correct, typeof q.correct === "boolean" ? q.correct : undefined]
                        .find((value) => typeof value === "boolean");
                      const rawCorrect = q.correctAnswer ?? q.correct_answer ?? q.correctOption ?? q.correct_option ?? q.answerKey ?? q.answer_key ?? questionData?.correctAnswer ?? questionData?.correct_answer ?? (typeof q.correct === "boolean" ? null : q.correct) ?? null;
                      const rawCorrectIndex = q.correctIndex ?? q.correct_index ?? q.correctAnswerIndex ?? q.correct_answer_index ?? q.correctOptionIndex ?? q.correct_option_index ?? questionData?.correctIndex ?? null;
                      const correctIndex = rawCorrectIndex !== null && rawCorrectIndex !== undefined
                        ? answerOptionIndex(rawCorrectIndex, options)
                        : answerOptionIndex(rawCorrect, options);
                      const correct = correctIndex >= 0 ? options[correctIndex] : (typeof rawCorrect === "object" ? rawCorrect?.text ?? rawCorrect?.label ?? rawCorrect?.value : rawCorrect);
                      const marksTotal = Number(questionData?.marksPerQuestion ?? questionData?.marks_per_question ?? questionData?.marks ?? questionData?.weight ?? q.maxMarks ?? q.max_marks ?? q.totalMarks ?? q.total_marks ?? q.marksTotal ?? q.marks_total ?? q.marks ?? 1) || 1;
                      const explanation = q.answerExplanation ?? q.answer_explanation ?? q.explanation ?? q.solution ?? q.question?.answerExplanation ?? questionData?.answerExplanation ?? null;
                      const isAnswered = selected !== null && selected !== undefined && String(selected).trim() !== "";
                      const canCompareAnswers = correctIndex >= 0 || correct != null;
                      const isCorrect = isAnswered && (canCompareAnswers
                        ? (resolvedSelectedIndex >= 0 && correctIndex >= 0 && resolvedSelectedIndex === correctIndex) || (correct != null && String(selected).trim().toLowerCase() === String(correct).trim().toLowerCase())
                        : explicitCorrect === true);
                      const displayedMarks = isCorrect ? marksTotal : 0;
                      const questionStatus = !isAnswered ? "UNANSWERED" : isCorrect ? "CORRECT" : "INCORRECT";
                      const markedForReview = isQuestionMarkedForReview(q);
                      const statusStyles = questionStatus === "CORRECT"
                        ? "border-emerald-200 bg-emerald-50/70"
                        : questionStatus === "INCORRECT"
                          ? "border-red-200 bg-red-50/70"
                          : "border-slate-200 bg-white";

                      return (
                        <div key={String(qId || idx)} className={`mt-3 rounded-xl border p-3 sm:p-4 ${statusStyles}`}>
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                            <div>
                              <div className="font-semibold text-navy">{`Q${idx + 1}. `}{text}</div>
                              <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold">
                                <span className={`rounded-full px-2 py-1 ${questionStatus === "CORRECT" ? "bg-emerald-600 text-white" : questionStatus === "INCORRECT" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"}`}>{questionStatus}</span>
                                {markedForReview && <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">MARKED FOR REVIEW</span>}
                              </div>
                            </div>
                            <div className="text-sm text-muted sm:text-right">Marks: {displayedMarks} / {marksTotal}</div>
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className={`rounded-lg border p-3 ${isAnswered ? (isCorrect ? "border-emerald-200 bg-emerald-100/70" : "border-red-200 bg-red-100/70") : "border-slate-200 bg-slate-50"}`}>
                              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Student answer</p>
                              <p className={`mt-1 break-words text-sm font-semibold ${isAnswered ? (isCorrect ? "text-emerald-800" : "text-red-800") : "text-slate-600"}`}>{isAnswered ? String(selected) : "Not answered"}</p>
                            </div>
                            <div className="rounded-lg border border-emerald-200 bg-emerald-100/70 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Correct answer</p>
                              <p className="mt-1 break-words text-sm font-semibold text-emerald-800">{correct !== null && correct !== undefined && String(correct).trim() ? String(correct) : "Not available"}</p>
                            </div>
                          </div>

                          <div className="mt-2 grid gap-2">
                            {Array.isArray(options) && options.length > 0 ? options.map((opt, i) => {
                              const isSelected = (selectedIndex !== null && Number(selectedIndex) === i) || (selected !== null && String(selected) === String(opt));
                              const isCorrect = correct !== null && String(correct) === String(opt);
                              return (
                                <div key={i} className={`rounded-md border p-2 ${isCorrect ? 'border-emerald-300 bg-emerald-50' : isSelected ? 'border-red-300 bg-red-50' : 'border-black/5 bg-white/60'}`}>
                                  <div className={`flex items-center justify-between`}> 
                                    <div className="text-sm">{String.fromCharCode(65 + i)}. {opt}</div>
                                    <div className="text-xs">
                                      {isSelected && <span className={`rounded px-2 py-1 text-white ${isCorrect ? "bg-emerald-600" : "bg-red-600"}`}>{isCorrect ? "Correct" : "Your answer"}</span>}
                                      {isCorrect && !isSelected && <span className="ml-2 rounded bg-emerald-600 px-2 py-1 text-white">Correct</span>}
                                    </div>
                                  </div>
                                </div>
                              );
                            }) : (
                              <div className="text-sm text-muted">Options not available.</div>
                            )}
                          </div>

                          {explanation && (
                            <div className="mt-3 text-sm bg-gray-50 p-2 rounded">Explanation: {explanation}</div>
                          )}
                        </div>
                      );
                    });
                  })()}
                    </>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </DashboardShell>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-bold text-[#143256]">{value}</dd>
    </div>
  );
}

function ProfileStat({ icon: Icon, label, value, positive = false }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${positive ? "bg-emerald-50 text-emerald-600" : "bg-[#fff6df] text-gold-dark"}`}><Icon size={19} /></div>
      <div className="min-w-0"><p className="truncate text-xs font-medium text-muted">{label}</p><p className="truncate font-bold text-navy">{value}</p></div>
    </div>
  );
}

function ProfileGroup({ icon: Icon, title, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf5f7] text-[#205b78]"><Icon size={18} /></div><h3 className="font-display font-bold text-navy">{title}</h3></div>
      <dl className="space-y-3 text-sm">{children}</dl>
    </section>
  );
}

function PaymentHistoryGroup({ paymentHistory, formatDate }) {
  return (
    <ProfileGroup icon={CreditCard} title="Payment history">
      {paymentHistory.length === 0 ? (
        <p className="text-muted">No payment history available.</p>
      ) : paymentHistory.map((payment, index) => {
        const paid = isSuccessfulPayment(payment);
        const recordStatus = paid
          ? "PAID"
          : String(payment.status ?? payment.paymentStatus ?? payment.payment_status ?? payment.state ?? "PENDING").toUpperCase();
        const recordAmount = getDisplayedPaymentAmount(payment);
        const paymentId = payment.paymentId ?? payment.payment_id ?? payment.razorpayPaymentId ?? payment.id ?? "—";
        const orderId = payment.orderId ?? payment.order_id;
        const title = payment.testSeriesTitle ?? payment.seriesTitle ?? payment.testSeries?.title ?? payment.description ?? "Student payment";
        const paidDate = payment.paidAt ?? payment.paymentDate ?? payment.createdAt ?? payment.created_at;
        return (
          <div key={String(paymentId !== "—" ? paymentId : `${payment.testSeriesId ?? "payment"}-${index}`)} className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-semibold text-navy">{title}</p><p className="text-xs text-muted">Payment ID: {paymentId}{orderId ? ` · Order ID: ${orderId}` : ""}</p></div>
            <div className="text-left sm:text-right"><p className={`font-bold ${paid ? "text-green-700" : "text-muted"}`}>{recordAmount == null ? "—" : `₹${Number(recordAmount).toLocaleString("en-IN")}`} · {recordStatus}</p><p className="text-xs text-muted">{formatDate(paidDate)}</p></div>
          </div>
        );
      })}
    </ProfileGroup>
  );
}

function AttemptSummary({ summary, amountPaid }) {
  const hasBreakdown = summary.correctCount != null || summary.incorrectCount != null || summary.unansweredCount != null;
  const correct = Number(summary.correctCount ?? 0);
  const incorrect = Number(summary.incorrectCount ?? 0);
  const unanswered = Number(summary.unansweredCount ?? 0);
  const distributionTotal = correct + incorrect + unanswered;
  const segments = [
    { label: "Correct", value: correct, color: "bg-emerald-500", textColor: "text-emerald-700" },
    { label: "Incorrect", value: incorrect, color: "bg-rose-500", textColor: "text-rose-700" },
    { label: "Unanswered", value: unanswered, color: "bg-slate-300", textColor: "text-slate-600" },
  ];
  const percentage = summary.percentage == null ? null : Math.min(100, Math.max(0, Number(summary.percentage)));
  const performanceStatus = getPerformanceStatus(percentage);

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="overflow-hidden rounded-[24px] border border-[#dfeaf7] bg-[linear-gradient(135deg,#173b5f_0%,#0d2540_100%)] text-white shadow-[0_18px_40px_rgba(23,59,95,0.18)]">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f8d77e]">Assessment result</p>
            <p className="mt-2 text-sm text-white/75">{summary.status} • {performanceStatus}</p>
            <p className="mt-1 text-3xl font-black tracking-[-0.04em]">{summary.score ?? "—"}<span className="text-base font-medium text-white/70"> / {summary.totalMarks ?? "—"}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full sm:h-24 sm:w-24" style={{ background: `conic-gradient(#f3bd63 ${percentage ?? 0}%, rgba(255,255,255,0.18) 0)` }}>
              <div className="grid h-[3.75rem] w-[3.75rem] place-items-center rounded-full bg-[#173b5f] text-lg font-extrabold shadow-inner sm:h-[4.5rem] sm:w-[4.5rem] sm:text-xl">{percentage == null ? "—" : `${percentage}%`}</div>
            </div>
            <div className="text-sm"><p className="text-white/65">Attempted</p><p className="font-bold">{summary.attemptedQuestions ?? "—"} / {summary.totalQuestions || "—"}</p></div>
          </div>
        </div>
        <div className="h-1.5 bg-white/10"><div className="h-full bg-[#f3bd63] transition-[width]" style={{ width: `${percentage ?? 0}%` }} /></div>
      </section>

      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="flex items-center justify-between gap-3"><div><h5 className="font-bold text-navy">Question breakdown</h5><p className="mt-1 text-xs text-muted">Performance across this paper</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{distributionTotal} questions</span></div>
        {hasBreakdown ? (
          <div className="mt-5 grid min-h-40 grid-cols-3 items-end gap-4 border-b border-slate-200 px-2 pb-2" aria-label={`Correct ${correct}, incorrect ${incorrect}, unanswered ${unanswered}`}>
            {segments.map((segment) => <div key={segment.label} className="flex h-full min-w-0 flex-col items-center justify-end gap-2"><span className={`text-sm font-extrabold ${segment.textColor}`}>{segment.value}</span><div className={`w-full max-w-16 rounded-t-xl ${segment.color}`} style={{ height: distributionTotal ? `${Math.max(10, (segment.value / Math.max(...segments.map((item) => item.value), 1)) * 100)}px` : "0px" }} /><span className="text-center text-[11px] text-muted">{segment.label}</span></div>)}
          </div>
        ) : <p className="mt-4 text-sm text-muted">Question-level results are not available for this attempt.</p>}
      </section>

      <dl className="grid gap-x-5 gap-y-3 rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef5ff_100%)] p-4 text-sm shadow-[0_10px_22px_rgba(148,163,184,0.08)] sm:grid-cols-2">
        <Row label="Started" value={formatDateTime(summary.startedAt)} />
        <Row label="Submitted" value={formatDateTime(summary.submittedAt)} />
        <Row label="Total questions" value={summary.totalQuestions || "—"} />
        <Row label="Amount paid" value={amountPaid == null ? "—" : `₹${Number(amountPaid).toLocaleString("en-IN")}`} />
      </dl>
    </div>
  );
}

