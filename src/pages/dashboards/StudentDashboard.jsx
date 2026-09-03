import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, IndianRupee, LayoutDashboard, User, FileText } from "lucide-react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getMyProfile,
  fetchStudentById,
  fetchStudentByEmail,
  fetchStudentByMobile,
  fetchCoordinators,
  fetchCenters,
  fetchStudentResults,
  fetchExamAttemptResult,
} from "../../services/backendService.js";

const tabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "profile", label: "My Profile", icon: User },
  { key: "result", label: "My Result", icon: FileText },
];

export default function StudentDashboard({ defaultTab = "profile" }) {
  const location = useLocation();
  const submittedAttempt = location.state?.submittedAttempt ?? null;
  const [tab, setTab] = useState(defaultTab);
  const [student, setStudent] = useState(null);
  const [center, setCenter] = useState(null);
  const [coordinator, setCoordinator] = useState(null);
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
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
        const lookupIds = [user?.studentId, user?.student?.id, user?.id, user?.userId].filter(Boolean);
        for (const id of lookupIds) {
          if (studentData !== user && (studentData.id || studentData.studentId)) break;
          try {
            const found = await fetchStudentById(id);
            if (found) {
              studentData = found;
              break;
            }
          } catch (err) {
            console.warn("Student lookup by id failed.", err);
          }
        }

        if (studentData === user && user?.email) {
          const found = await fetchStudentByEmail(user.email);
          if (found) studentData = found;
        }

        if (studentData === user && user?.mobile) {
          const found = await fetchStudentByMobile(user.mobile);
          if (found) studentData = found;
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
      try {
        const studentIds = [...new Set([
          student.id,
          student.studentId,
          student.userId,
          student.user?.id,
          user?.studentId,
          user?.userId,
          user?.id,
        ].filter(Boolean).map(String))];
        const resultLists = await Promise.all(studentIds.map((studentId) => fetchStudentResults(studentId, student)));
        const loadedResults = resultLists.flatMap((list) => Array.isArray(list) ? list : []).filter((item, index, list) => {
          const itemId = item.attemptId ?? item.id ?? item.resultId ?? item.attempt_id;
          if (!itemId) return true;
          return list.findIndex((candidate) => String(candidate.attemptId ?? candidate.id ?? candidate.resultId ?? candidate.attempt_id) === String(itemId)) === index;
        });
        if (submittedAttempt?.attemptId) {
          const submittedKey = String(submittedAttempt.attemptId);
          const mergedResults = loadedResults.some((item) => String(item.attemptId ?? item.id) === submittedKey)
            ? loadedResults.map((item) => String(item.attemptId ?? item.id) === submittedKey ? { ...item, ...submittedAttempt } : item)
            : [submittedAttempt, ...loadedResults];
          setResults(mergedResults);
        } else setResults(loadedResults);
      } catch (err) {
        console.warn('Could not load student results', err);
        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    }

    loadResults();
  }, [student, user, submittedAttempt]);

  if (!student) return <div className="min-h-[60vh] flex items-center justify-center">Loading profile...</div>;

  const rollNo = student.rollNo || student.roll_number || student.rollNumber || "—";
  const paymentStatusFromApi =
    student.paymentStatus ||
    student.payment_status ||
    student.payment?.status ||
    student.payment?.paymentStatus ||
    (student.paymentId || student.payment_id || student.razorpayPaymentId ? "Paid" : "Pending");
  const paymentId = student.paymentId || student.payment_id || student.razorpayPaymentId || "—";
  const paymentAmount = student.amount ?? student.registrationFee ?? student.paymentAmount ?? 250;
  const hasPaymentId = paymentId !== "—";
  const isPaymentSuccessful = hasPaymentId || ["paid", "success", "successful", "completed", "payment successful"].includes(String(paymentStatusFromApi).toLowerCase());
  const paymentStatus = isPaymentSuccessful ? "PAID" : paymentStatusFromApi;
  const marks = 70 + (String(rollNo).charCodeAt(String(rollNo).length - 1 || 0) % 30);

  async function viewAttempt(attempt) {
    const attemptId = attempt.attemptId ?? attempt.id ?? attempt.resultId ?? attempt.attempt_id;
    if (!attemptId) {
      setSelectedAttempt(attempt);
      setShowAttemptModal(true);
      return;
    }

    try {
      const details = await fetchExamAttemptResult(attemptId);
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
        <div className="card p-6">
          <h3 className="font-display font-bold text-navy mb-4">My Profile</h3>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <Row label="Name" value={student.name || student.studentName || "—"} />
            <Row label="Email" value={student.email || "—"} />
            <Row label="Mobile" value={student.mobile || "—"} />
            <Row label="Gender" value={student.gender || "—"} />
            <Row label="Date of Birth" value={student.dateOfBirth || "—"} />
            <Row label="Class" value={student.class || student.studentClass || "—"} />
            <Row label="Medium" value={student.medium || "—"} />
            <Row label="School" value={student.schoolName || "—"} />
            <Row label="Address" value={student.address || "—"} />
            <Row label="Village" value={student.village || "—"} />
            <Row label="District" value={student.district || "—"} />
            <Row label="Taluka" value={student.taluka || "—"} />
            <Row label="State" value={student.state || "—"} />
            <Row label="Pincode" value={student.pincode || "—"} />
            <Row label="Exam Center" value={center?.centerName || center?.name || "—"} />
            <Row label="Co-ordinator" value={coordinator?.name || coordinator?.fullName || "—"} />
            <Row label="Roll Number" value={rollNo} />
            <Row label="Payment Status" value={paymentStatus} />
            <Row label="Payment ID" value={paymentId} />
            <Row label="Registration Fee" value={`₹${paymentAmount}`} />
          </dl>
          <div className={`mt-6 rounded-xl border p-4 flex items-center gap-3 ${isPaymentSuccessful ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
            <CheckCircle2 className={isPaymentSuccessful ? "text-green-600 shrink-0" : "text-amber-600 shrink-0"} size={28} />
            <div>
              <p className={`font-semibold ${isPaymentSuccessful ? "text-green-700" : "text-amber-700"}`}>
                {isPaymentSuccessful ? "Payment Successful" : "Payment Pending"}
              </p>
              <p className={`text-sm flex items-center gap-1 ${isPaymentSuccessful ? "text-green-700/80" : "text-amber-700/80"}`}>
                Registration fee paid: <IndianRupee size={14} />{paymentAmount}
              </p>
            </div>
          </div>
        </div>
      )}
      {tab === "result" && (
        <div className="card p-6 border-l-4 border-gold">
          <h3 className="font-display font-bold text-navy text-lg mb-3">Sankalp Exam Result</h3>

          <div className="mb-4">
            <p className="text-sm text-muted">Below are your past exam attempts. Click "View" to see the solved paper with selected options and per-question details (if available).</p>
          </div>

          {loadingResults ? (
            <div>Loading exam attempts...</div>
          ) : results.length === 0 ? (
            <div className="text-sm text-muted">No exam attempts found.</div>
          ) : (
            <div className="space-y-3">
              {results.map((r) => {
                // Try to canonicalize fields from common server shapes
                const attemptId = r.attemptId ?? r.id ?? r.resultId ?? r.attempt_id ?? r.attemptId;
                const examName = r.examName ?? r.exam_name ?? r.exam?.examName ?? r.exam?.name ?? r.examTitle ?? r.testSeries?.title ?? r.testSeries?.name ?? r.title ?? "Exam";
                const resultData = r.result ?? r;
                const obtained = resultData.obtainedMarks ?? resultData.obtained_marks ?? resultData.marks ?? resultData.score ?? resultData.obtained ?? null;
                const total = resultData.totalMarks ?? resultData.total_marks ?? resultData.total ?? resultData.maxMarks ?? null;
                const startedAt = r.startedAt ?? r.started_at ?? r.createdAt ?? r.created_at ?? r.attemptedAt ?? null;
                const attemptedCount = r.attemptedCount ?? r.attemptedQuestions ?? r.answeredCount ?? null;
                const unattemptedCount = r.unattemptedCount ?? r.unattemptedQuestions ?? r.unansweredCount ?? null;
                const reviewedCount = r.reviewedCount ?? r.markedCount ?? r.markedForReviewCount ?? null;

                return (
                  <div key={String(attemptId || Math.random())} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-navy">{examName}</div>
                      <div className="text-xs text-muted">Attempt: {attemptId ?? "—"} • {startedAt ? new Date(startedAt).toLocaleString() : "—"}</div>
                      {(attemptedCount !== null || unattemptedCount !== null || reviewedCount !== null) && (
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold">
                          {attemptedCount !== null && <span className="rounded-full bg-green-50 px-2 py-1 text-green-700">Attempted: {attemptedCount}</span>}
                          {unattemptedCount !== null && <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Not attempted: {unattemptedCount}</span>}
                          {reviewedCount !== null && <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">Review: {reviewedCount}</span>}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{obtained ?? "—"}{total ? ` / ${total}` : ""}</div>
                      <div className="mt-2 flex gap-2 justify-end">
                        <button className="btn btn-sm" onClick={() => viewAttempt(r)}>View</button>
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
                    const qList = result.questions ?? result.questionResponses ?? result.studentAnswers ?? result.answers ?? result.answerDetails ?? result.details ?? result.questionList ?? result.questionsList ?? null;
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
