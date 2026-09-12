import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BadgeCheck, Building2, CheckCircle2, CreditCard, FileText, GraduationCap, LayoutDashboard, Mail, ShieldCheck, Trophy, User } from "lucide-react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getMyProfile,
  fetchStudentById,
  fetchCoordinators,
  fetchCenters,
  fetchStudentResults,
  fetchExamAttemptResult,
  fetchStudentResultById,
} from "../../services/backendService.js";

const tabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "profile", label: "My Profile", icon: User },
  { key: "result", label: "My Result", icon: FileText },
];

export default function StudentDashboard({ defaultTab = "profile" }) {
  const location = useLocation();
  const [tab, setTab] = useState(defaultTab);
  const [student, setStudent] = useState(null);
  const [center, setCenter] = useState(null);
  const [coordinator, setCoordinator] = useState(null);
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  useEffect(() => {
    setTab(location.state?.tab ?? defaultTab);
  }, [defaultTab, location.state]);

  useEffect(() => {
    async function loadData() {
      let studentData = user;

      try {
        const profile = await getMyProfile();
        if (profile && typeof profile === "object") studentData = { ...user, ...profile };
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
              studentData = { ...studentData, ...found };
              break;
            }
          } catch (err) {
            console.warn("Student lookup by id failed.", err);
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
        const loadedResults = (Array.isArray(persistedResults) ? persistedResults : []).filter((item, index, list) => {
          const itemId = item.attemptId ?? item.id ?? item.resultId ?? item.attempt_id;
          if (!itemId) return true;
          return list.findIndex((candidate) => String(candidate.attemptId ?? candidate.id ?? candidate.resultId ?? candidate.attempt_id) === String(itemId)) === index;
        });
        setResults(loadedResults.sort((first, second) => {
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

  const rollNo = student.rollNo || student.roll_number || student.rollNumber || "—";
  const paymentStatusFromApi =
    student.paymentStatus ||
    student.payment_status ||
    student.payment?.status ||
    student.payment?.paymentStatus ||
    (student.paymentId || student.payment_id || student.razorpayPaymentId ? "Paid" : "Pending");
  const paymentAmount = student.amount ?? student.registrationFee ?? student.paymentAmount ?? null;
  const isPaymentSuccessful = Boolean(student.isPaymentDone) || ["paid", "success", "successful", "completed", "captured", "payment successful"].includes(String(paymentStatusFromApi).trim().toLowerCase());
  const paymentStatus = isPaymentSuccessful ? "SUCCESSFUL" : String(paymentStatusFromApi).toUpperCase();
  const hiddenProfileKeys = new Set(["password", "confirmPassword", "token", "accessToken", "refreshToken", "payment", "latestPayment", "paymentDetails"]);
  const additionalDetails = Object.entries(student).filter(([key, value]) => {
    if (hiddenProfileKeys.has(key) || value == null || value === "" || typeof value === "object") return false;
    return !["id", "studentId", "name", "studentName", "lastName", "fatherName", "gender", "dateOfBirth", "rollNo", "roll_number", "rollNumber", "email", "mobile", "mobileNo", "phone", "address", "village", "state", "pincode", "pinCode", "zipCode", "studentClass", "class", "className", "medium", "school", "schoolName", "instituteName", "district", "districtName", "districtId", "taluka", "talukaName", "talukaId", "centerId", "examCenterId", "centerName", "coordinatorId", "coordinatorName", "active", "paymentStatus", "payment_status", "isPaymentDone", "paymentId", "payment_id", "razorpayPaymentId", "paymentMode", "amount", "registrationFee", "paymentAmount", "createdAt", "updatedAt"].includes(key);
  });
  const marks = 70 + (String(rollNo).charCodeAt(String(rollNo).length - 1 || 0) % 30);
  const displayName = [student.studentName || student.name, student.lastName].filter(Boolean).join(" ") || "Student";
  const profileInitials = displayName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const completedResults = results.filter((result) => {
    const status = result?.status ?? result?.resultStatus ?? result?.result?.status;
    return status ? /pass|complete|submit|success/i.test(String(status)) : true;
  }).length;
  const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

  async function viewAttempt(attempt) {
    const attemptId = attempt.attemptId ?? attempt.id ?? attempt.resultId ?? attempt.attempt_id;
    const resultId = attempt.resultId ?? attempt.result?.id ?? attempt.id;
    if (!attemptId) {
      setSelectedAttempt(attempt);
      setShowAttemptModal(true);
      return;
    }

    try {
      const details = resultId
        ? await fetchStudentResultById(resultId)
        : await fetchExamAttemptResult(attemptId);
      setSelectedAttempt({ ...attempt, ...details, attemptId });
    } catch (error) {
      console.warn("Could not load exam attempt result.", error);
      setSelectedAttempt({ ...attempt, attemptId });
    }
    setShowAttemptModal(true);
  }

  return (
    <DashboardShell title="Student" roleLabel="Student" tabs={tabs} activeTab={tab} onTabChange={setTab}>
      {tab === "overview" && (
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="card p-6 text-center"><p className="font-mono font-bold text-navy text-lg">{rollNo}</p><p className="text-xs text-muted mt-1">Roll Number</p></div>
          <div className="card p-6 text-center"><p className="font-display font-bold text-navy text-lg">{student.class || student.studentClass || "—"}</p><p className="text-xs text-muted mt-1">Class</p></div>
          <div className="card p-6 text-center"><p className="font-display font-bold text-navy text-lg">{paymentStatus}</p><p className="text-xs text-muted mt-1">Payment Status</p></div>
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
              <Row label="Payment done" value={student.isPaymentDone ? "Yes" : "No"} />
              <Row label="Payment status" value={paymentStatus} />
              <Row label="Payment mode" value={student.paymentMode || "—"} />
              <Row label="Amount" value={student.amount == null ? "—" : `₹${student.amount}`} />
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

          <div className={`flex items-center gap-3 rounded-2xl border p-4 ${isPaymentSuccessful ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
            <CheckCircle2 className={isPaymentSuccessful ? "shrink-0 text-green-600" : "shrink-0 text-amber-600"} size={26} />
            <div><p className={`font-semibold ${isPaymentSuccessful ? "text-green-700" : "text-amber-700"}`}>{isPaymentSuccessful ? "Payment verified" : "Payment pending"}</p><p className="text-sm text-muted">Last updated {formatDate(student.updatedAt)}</p></div>
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
                const percentage = resultData.percentage ?? resultData.percent ?? (obtained != null && total ? Math.round((Number(obtained) / Number(total)) * 100) : null);
                const resultStatus = resultData.status ?? resultData.resultStatus ?? resultData.result ?? "Submitted";
                const startedAt = r.startedAt ?? r.started_at ?? r.createdAt ?? r.created_at ?? r.attemptedAt ?? null;
                const attemptedCount = r.attemptedCount ?? r.attemptedQuestions ?? r.answeredCount ?? null;
                const unattemptedCount = r.unattemptedCount ?? r.unattemptedQuestions ?? r.unansweredCount ?? null;
                const reviewedCount = r.reviewedCount ?? r.markedCount ?? r.markedForReviewCount ?? null;

                return (
                  <div key={String(attemptId || resultIndex)} className="card group flex flex-col gap-5 border-l-4 border-l-gold p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(23,59,95,0.12)] sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><div className="font-display text-lg font-bold text-navy">{examName}</div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">{resultStatus}</span></div>
                      <div className="mt-1 text-xs text-muted">Attempt {attemptId ?? "—"} · {startedAt ? new Date(startedAt).toLocaleString() : "Date unavailable"}</div>
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
                      <div className="flex gap-2 justify-end">
                        <button className="btn btn-sm transition group-hover:bg-gold" onClick={() => viewAttempt(r)}>View details</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Attempt Modal */}
          {showAttemptModal && selectedAttempt && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-dark/60 p-3 backdrop-blur-sm sm:p-6">
              <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
                <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
                  <div>
                    <h4 className="text-base font-bold text-navy sm:text-lg">{selectedAttempt.examName ?? selectedAttempt.exam_name ?? selectedAttempt.exam?.name ?? 'Exam Attempt'}</h4>
                    <p className="mt-1 text-xs text-muted sm:text-sm">Attempt ID: {selectedAttempt.attemptId ?? selectedAttempt.id ?? selectedAttempt.resultId ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-navy hover:text-navy sm:text-sm" onClick={() => setShowAttemptModal(false)}>Close</button>
                  </div>
                </div>

                <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                  {(() => {
                    const result = selectedAttempt.result ?? selectedAttempt;
                    const score = result.obtainedMarks ?? result.obtained_marks ?? result.score ?? result.marks ?? result.totalMarksObtained;
                    const totalMarks = result.maxScore ?? result.totalMarks ?? result.total_marks ?? result.maxMarks ?? result.total;
                    const percentage = result.percentage ?? result.percent ?? (score != null && totalMarks ? ((Number(score) / Number(totalMarks)) * 100).toFixed(2) : null);
                    const status = result.status ?? result.resultStatus ?? result.result ?? null;
                    const attemptedCount = result.attemptedCount ?? result.attemptedQuestions ?? result.answeredCount ?? null;
                    const unattemptedCount = result.unattemptedCount ?? result.unattemptedQuestions ?? result.unansweredCount ?? null;
                    const reviewedCount = result.reviewedCount ?? result.markedCount ?? result.markedForReviewCount ?? null;
                    const submittedAt = result.submittedAt ?? result.submitted_at ?? null;
                    const startedAt = result.startedAt ?? result.started_at ?? null;

                    return (
                      <dl className="grid gap-3 rounded-md border bg-slate-50 p-4 text-sm sm:grid-cols-2">
                        <Row label="Status" value={status || "Submitted"} />
                        <Row label="Score" value={`${score ?? "—"}${totalMarks != null ? ` / ${totalMarks}` : ""}`} />
                        <Row label="Percentage" value={percentage != null ? `${percentage}%` : "—"} />
                        <Row label="Started" value={startedAt ? new Date(startedAt).toLocaleString() : "—"} />
                        <Row label="Submitted" value={submittedAt ? new Date(submittedAt).toLocaleString() : "—"} />
                        <Row label="Total Questions" value={result.totalQuestions ?? result.total ?? "—"} />
                        <Row label="Attempted" value={attemptedCount ?? "—"} />
                        <Row label="Not Attempted" value={unattemptedCount ?? "—"} />
                        <Row label="Marked for Review" value={reviewedCount ?? "—"} />
                      </dl>
                    );
                  })()}

                  {/* Try to find questions/answers in multiple possible keys */}
                  {(() => {
                    const result = selectedAttempt.result ?? selectedAttempt;
                    const qList = [result.questions, result.questionResponses, result.resultQuestions, result.resultQuestionResponses, result.questionResults, result.studentAnswers, result.answers, result.answerDetails, result.details, result.questionList, result.questionsList].find((items) => Array.isArray(items) && items.length > 0) || null;
                    if (!qList || !qList.length) {
                      return <div className="text-sm text-muted">No per-question details are available for this attempt.</div>;
                    }

                    return qList.map((q, idx) => {
                      // Normalize a single question/answer structure
                      const qId = q.questionId ?? q.id ?? q.question_id ?? q.question?.id ?? q.questionId;
                      const questionData = q.question && typeof q.question === "object" ? q.question : null;
                      const text = q.questionText ?? q.question_text ?? q.text ?? (typeof q.question === "string" ? q.question : null) ?? questionData?.questionText ?? questionData?.text ?? questionData?.question ?? `Question ${idx + 1}`;
                      const options = q.options ?? q.optionList ?? questionData?.options ?? (questionData ? [questionData.optionA, questionData.optionB, questionData.optionC, questionData.optionD].filter(Boolean) : null);
                      const selected = q.selectedAnswer ?? q.selected_answer ?? q.answerText ?? (typeof q.answerIndex !== 'undefined' && Array.isArray(options) ? options[q.answerIndex] : (q.answer ?? null));
                      const selectedIndex = (typeof q.answerIndex !== 'undefined') ? q.answerIndex : (q.selectedIndex ?? q.selected_index ?? q.selectedOption ?? null);
                      const rawCorrect = q.correctAnswer ?? q.correct_answer ?? q.correctOption ?? q.correct_option ?? q.correct ?? questionData?.correctAnswer ?? questionData?.correct_answer ?? null;
                      const correctIndex = q.correctIndex ?? q.correct_index ?? q.correctAnswerIndex ?? q.correct_answer_index ?? questionData?.correctIndex ?? null;
                      const correct = correctIndex !== null && correctIndex !== undefined && Array.isArray(options) ? options[Number(correctIndex)] : rawCorrect;
                      const marksObtained = q.marksObtained ?? q.marks_obtained ?? q.marksObt ?? q.marks_obt ?? q.marks ?? null;
                      const marksTotal = q.marks ?? q.totalMarks ?? q.total_marks ?? null;
                      const explanation = q.answerExplanation ?? q.answer_explanation ?? q.explanation ?? q.question?.answerExplanation ?? null;
                      const questionStatus = q.status ?? (selected !== null && selected !== undefined ? "ATTEMPTED" : "UNATTEMPTED");
                      const markedForReview = Boolean(q.markedForReview ?? q.marked_for_review ?? q.isMarked ?? q.reviewed);

                      return (
                        <div key={String(qId || idx)} className="p-3 border rounded-md">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-semibold">{`Q${idx + 1}. `}{text}</div>
                              <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold">
                                <span className={`rounded-full px-2 py-1 ${questionStatus === "ATTEMPTED" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>{questionStatus}</span>
                                {markedForReview && <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">MARKED FOR REVIEW</span>}
                              </div>
                            </div>
                            <div className="text-sm text-muted">Marks: {marksObtained ?? '—'}{marksTotal ? ` / ${marksTotal}` : ''}</div>
                          </div>

                          <div className="mt-2 grid gap-2">
                            {Array.isArray(options) && options.length > 0 ? options.map((opt, i) => {
                              const isSelected = (selectedIndex !== null && Number(selectedIndex) === i) || (selected !== null && String(selected) === String(opt));
                              const isCorrect = correct !== null && String(correct) === String(opt);
                              return (
                                <div key={i} className={`p-2 rounded-md border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-black/5'} ${isCorrect ? 'ring-1 ring-green-200' : ''}`}>
                                  <div className={`flex items-center justify-between`}> 
                                    <div className="text-sm">{String.fromCharCode(65 + i)}. {opt}</div>
                                    <div className="text-xs">
                                      {isSelected && <span className="px-2 py-1 rounded text-white bg-blue-600">Selected</span>}
                                      {isCorrect && <span className="px-2 py-1 rounded ml-2 text-white bg-green-600">Correct</span>}
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
    <div className="flex justify-between border-b border-black/5 pb-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold text-navy text-right">{value}</dd>
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
