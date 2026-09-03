import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Check, CircleHelp, CircleMinus, Clock3, Flag, ListChecks, Send, Timer, Trophy, X } from "lucide-react";
import {
  fetchExams,
  startExamAttempt,
  fetchAttemptQuestions,
  saveAttemptAnswer,
  submitExamAttempt,
  rememberExamAttempt,
  rememberExamResult,
} from "../../services/backendService.js";
import { useAuth } from "../../context/AuthContext.jsx";

// Simple responsive professional UI for taking an exam with timer, answers, submit and result.
export default function ExamPlayer() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const passedExam = location.state?.exam ?? null;
  const [exam, setExam] = useState(passedExam);
  const [loading, setLoading] = useState(!passedExam);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const timerRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  // UI state for single-question navigation
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marked, setMarked] = useState({});
  const [detailedResults, setDetailedResults] = useState(null);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [resultTab, setResultTab] = useState("summary");

  const initialDurationRef = useRef(0);

  function normalizeQuestion(item, index) {
    const question = item?.question && typeof item.question === "object" ? item.question : item;
    const questionId = question?.questionId ?? question?.id ?? item?.questionId ?? `${id}-q-${index + 1}`;
    const text = question?.questionText ?? question?.text ?? question?.question ?? item?.questionText ?? `Question ${index + 1}`;
    let options = question?.options ?? question?.choices ?? question?.optionList ?? item?.options;

    if (!options) {
      options = [question?.optionA, question?.optionB, question?.optionC, question?.optionD].filter((option) => option != null && option !== "");
    }
    if (!options && question?.optionsJson) options = question.optionsJson;
    if (typeof options === "string") {
      try { options = JSON.parse(options); } catch (error) { options = options.split("|").map((option) => option.trim()).filter(Boolean); }
    }
    if (!Array.isArray(options) || options.length === 0) {
      throw new Error(`Question ${index + 1} has no options in the database.`);
    }

    const rawCorrectAnswer = question?.correctAnswer ?? question?.correct_answer ?? question?.correctOption ?? question?.answer ?? item?.correctAnswer ?? item?.correct_answer ?? null;
    const rawCorrectIndex = question?.correctIndex ?? question?.answerIndex ?? question?.correctAnswerIndex ?? item?.correctIndex ?? item?.answerIndex ?? null;
    const resolvedCorrectIndex = rawCorrectIndex !== null && rawCorrectIndex !== undefined
      ? Number(rawCorrectIndex)
      : (rawCorrectAnswer !== null && rawCorrectAnswer !== undefined
        ? options.findIndex((option) => String(option).trim() === String(rawCorrectAnswer).trim())
        : null);

    return {
      id: questionId,
      text,
      options,
      marks: Number(item?.marks ?? question?.marks ?? question?.weight ?? 1) || 1,
      correctIndex: resolvedCorrectIndex >= 0 ? resolvedCorrectIndex : null,
      correctAnswer: rawCorrectAnswer,
    };
  }

  useEffect(() => {
    async function load() {
      try {
        const all = await fetchExams();
        const found = all.find((e) => String(e.id) === String(id));
        if (found) setExam(found);

        const attempt = await startExamAttempt(id, passedExam?.testSeriesId ?? found?.testSeriesId);
        setAttemptId(attempt.attemptId);
        const backendQs = await fetchAttemptQuestions(attempt.attemptId);
        const normalized = backendQs.map(normalizeQuestion);

        if (!normalized.length) throw new Error("This exam has no questions in the database.");

        setQuestions(normalized);

        const durationMin = Number(found?.duration) || 10;
        const sec = durationMin * 60;
        initialDurationRef.current = sec;
        setTimeLeft(sec);
      } catch (err) {
        console.error("Failed to load exam questions:", err);
        const backendMessage = typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message || err?.response?.data?.error;
        setLoadError(backendMessage || (err?.response?.status ? `Exam API failed (${err.response.status}).` : err?.message) || "Unable to load questions for this exam.");
      } finally {
        setLoading(false);
      }
    }

    // Always load questions and exam metadata (if needed).
    // If exam was passed via location.state we still need to fetch questions from backend.
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Start timer
  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted]);

  function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function selectAnswer(qid, optionIndex) {
    setAnswers((a) => ({ ...a, [qid]: optionIndex }));
    const question = questions.find((item) => String(item.id) === String(qid));
    if (attemptId && question) {
      saveAttemptAnswer(attemptId, {
        questionId: qid,
        selectedAnswer: question.options[optionIndex],
      }).catch((error) => {
        console.warn("Failed to save answer:", error);
        setSubmitError("An answer could not be saved. Please try again.");
      });
    }
  }

  function computeResult() {
    let score = 0;
    let maxScore = 0;
    questions.forEach((q) => {
      maxScore += Number(q.marks || 1);
      const given = answers[q.id];
      if (typeof given !== 'undefined' && Number(given) === Number(q.correctIndex)) {
        score += Number(q.marks || 1);
      }
    });
    return { score, maxScore, total: questions.length };
  }

  const { user, refreshProfile } = useAuth();

  const resultItems = useMemo(() => {
    if (!result) return [];
    const source = result.details ?? result.questions ?? result.questionResponses ?? result.answers ?? [];
    return questions.map((question, index) => {
      const detail = source.find((item) => String(item.questionId ?? item.question_id ?? item.id) === String(question.id)) ?? source[index] ?? {};
      const selectedIndex = detail.selectedIndex ?? detail.selected_index ?? detail.answerIndex ?? detail.answer_index ?? answers[question.id] ?? null;
      const selectedAnswer = detail.selectedAnswer ?? detail.selected_answer ?? (selectedIndex !== null ? question.options[selectedIndex] : null);
      const rawCorrectAnswer = detail.correctAnswer ?? detail.correct_answer ?? detail.correctOption ?? detail.correct_option ?? detail.answer ?? question.correctAnswer ?? null;
      const rawCorrectIndex = detail.correctIndex ?? detail.correct_index ?? detail.correctAnswerIndex ?? detail.correct_answer_index ?? question.correctIndex ?? null;
      const correctIndex = rawCorrectIndex !== null && rawCorrectIndex !== undefined
        ? Number(rawCorrectIndex)
        : (rawCorrectAnswer !== null && rawCorrectAnswer !== undefined ? question.options.findIndex((option) => String(option).trim() === String(rawCorrectAnswer).trim()) : null);
      const correctAnswer = correctIndex !== null && correctIndex >= 0 ? question.options[correctIndex] : rawCorrectAnswer;
      const isCorrect = detail.correct === true || (correctIndex !== null && correctIndex >= 0 && selectedIndex !== null && Number(correctIndex) === Number(selectedIndex));
      const status = selectedAnswer === null || selectedAnswer === undefined ? "UNANSWERED" : isCorrect ? "CORRECT" : "INCORRECT";
      return { ...question, detail, selectedIndex, selectedAnswer, correctIndex, correctAnswer, status, markedForReview: Boolean(detail.markedForReview ?? detail.marked_for_review) };
    });
  }, [result, questions, answers]);

  const resultCounts = useMemo(() => ({
    correct: resultItems.filter((item) => item.status === "CORRECT").length,
    incorrect: resultItems.filter((item) => item.status === "INCORRECT").length,
    unanswered: resultItems.filter((item) => item.status === "UNANSWERED").length,
  }), [resultItems]);

  async function handleSubmit() {
    if (!attemptId) {
      setSubmitError("Exam attempt was not created. Please restart the exam.");
      return;
    }
    setSubmitted(true);
    clearInterval(timerRef.current);

    try {
      const submittedResult = await submitExamAttempt(attemptId);
      const localSummary = computeResult();
      const backendScore = submittedResult?.score ?? submittedResult?.obtainedMarks ?? submittedResult?.obtained_marks ?? submittedResult?.marks ?? submittedResult?.totalMarksObtained;
      const backendMaxScore = submittedResult?.maxScore ?? submittedResult?.max_score ?? submittedResult?.totalMarks ?? submittedResult?.total_marks ?? submittedResult?.maxMarks;
      const backendTotal = submittedResult?.totalQuestions ?? submittedResult?.total_questions ?? submittedResult?.total;
      const attemptedCount = questions.filter((question) => answers[question.id] !== undefined && answers[question.id] !== null).length;
      const reviewedCount = questions.filter((question) => marked[question.id]).length;
      const questionDetails = questions.map((question, index) => ({
        questionId: question.id,
        questionText: question.text,
        options: question.options,
        selectedAnswer: answers[question.id] !== undefined ? question.options[answers[question.id]] : null,
        selectedIndex: answers[question.id] ?? null,
        correctIndex: question.correctIndex,
        marks: question.marks,
        status: answers[question.id] !== undefined ? "ATTEMPTED" : "UNATTEMPTED",
        markedForReview: Boolean(marked[question.id]),
        sequence: index + 1,
      }));
      const serverDetails = Array.isArray(submittedResult?.details) ? submittedResult.details : [];
      const mergedDetails = questionDetails.map((localDetail, index) => {
        const serverDetail = serverDetails.find((detail) => String(detail.questionId ?? detail.question_id ?? detail.id) === String(localDetail.questionId)) ?? serverDetails[index];
        return serverDetail ? { ...localDetail, ...serverDetail, status: localDetail.status, markedForReview: localDetail.markedForReview } : localDetail;
      });
      const resultWithExam = {
        ...submittedResult,
        attemptId,
        examId: id,
        examName: exam?.name,
        submittedAt: submittedResult?.submittedAt ?? new Date().toISOString(),
        score: backendScore ?? localSummary.score,
        maxScore: backendMaxScore ?? localSummary.maxScore,
        total: backendTotal ?? localSummary.total,
        totalQuestions: questions.length,
        attemptedCount,
        unattemptedCount: questions.length - attemptedCount,
        reviewedCount,
        details: mergedDetails,
      };
      setResult(resultWithExam);
      rememberExamAttempt(attemptId);
      rememberExamResult(resultWithExam);
      try { await refreshProfile(); } catch (e) { /* ignore */ }
    } catch (err) {
      console.warn('Result submission failed:', err);
      setSubmitError(err?.response?.data?.message || err?.message || "Unable to submit this exam.");
      setSubmitted(false);
    }
  }

  async function handleAutoSubmit() {
    if (submitted) return;
    await handleSubmit();
  }

  if (loading) return <div className="min-h-screen bg-[#f7f9fc]"><div className="bg-navy-dark py-4 text-center text-sm font-semibold text-white">Preparing your test...</div><div className="container-app py-20 text-center text-muted">Loading questions...</div></div>;

  if (loadError) return <div className="min-h-screen bg-[#f7f9fc]"><div className="bg-navy-dark py-4 text-center text-sm font-semibold text-white">{exam?.name ?? "Exam"}</div><div className="container-app py-20 text-center text-red-600">{loadError}</div></div>;

  if (!questions || questions.length === 0) return <div className="min-h-screen bg-[#f7f9fc]"><div className="bg-navy-dark py-4 text-center text-sm font-semibold text-white">{exam?.name ?? "Exam"}</div><div className="container-app py-20 text-center text-muted">No questions available.</div></div>;


  function gotoQuestion(i) {
    if (i < 0) i = 0;
    if (i >= questions.length) i = questions.length - 1;
    setCurrentIndex(i);
  }

  function toggleMark(qid) {
    setMarked((m) => ({ ...m, [qid]: !m[qid] }));
  }

  function nextQuestion() { gotoQuestion(currentIndex + 1); }
  function prevQuestion() { gotoQuestion(currentIndex - 1); }

  // enhanced submit handler to capture per-question feedback if server returns it
  async function doSubmit() {
    setSubmitConfirmOpen(false);
    await handleSubmit();
    // if server provided per-question feedback it would have been handled in handleSubmit; try to pick it up
    // (handleSubmit sets result; server response details normalized in that function if present)
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <div className="sticky top-0 z-40 bg-navy-dark text-white shadow-lg">
        <div className="container-app flex min-h-14 items-center justify-between gap-3 py-2">
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{exam?.name ?? 'Exam'}</p><p className="text-[10px] text-white/60">Duration: {exam?.duration || "-"} minutes</p></div>
          {!submitted && <div className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${timeLeft < 60 ? "bg-red-600" : "bg-green-600"}`}><Timer size={15} /> Time Left: {formatTime(timeLeft)}</div>}
        </div>
      </div>
      <div className="container-app py-4 sm:py-6">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">

          {/* Main question area */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,35,82,0.07)] sm:p-5">
            {submitError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {!submitted && (
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm text-slate-600"><Clock3 size={16} className="text-gold" /> Question <span className="font-bold text-navy">{currentIndex + 1}</span> of {questions.length}</div>
                <div className="text-xs font-semibold text-muted">Marks: {questions[currentIndex].marks || 1}</div>
              </div>
            )}

            {/* Single question view */}
            {!submitted && (
              <div>
                <div className="mb-4 rounded-lg border p-4">
                  <div className="mb-3 flex items-start justify-between gap-3"><div className="text-base font-semibold leading-7 text-navy">{questions[currentIndex].text}</div><Flag size={17} className={marked[questions[currentIndex].id] ? "shrink-0 text-gold" : "shrink-0 text-slate-300"} /></div>

                  <div className="grid gap-2 md:grid-cols-2">
                    {questions[currentIndex].options.map((opt, oi) => {
                      const checked = answers[questions[currentIndex].id] === oi;
                      return (
                        <label key={oi} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${checked ? 'border-blue-300 bg-blue-50' : ''}`}>
                          <input type="radio" name={questions[currentIndex].id} checked={checked} onChange={() => selectAnswer(questions[currentIndex].id, oi)} />
                          <span className="text-sm">{opt}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={prevQuestion} disabled={currentIndex===0} className="rounded-md border px-3 py-2">Prev</button>
                      <button onClick={nextQuestion} disabled={currentIndex===questions.length-1} className="flex items-center gap-2 rounded-md border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">Save &amp; Next <ArrowRight size={15} /></button>
                      <button onClick={() => toggleMark(questions[currentIndex].id)} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><Flag size={15} />{marked[questions[currentIndex].id] ? 'Unmark' : 'Mark for review'}</button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setSubmitConfirmOpen(true)} className="btn-primary flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-white"><Send size={15} /> Submit Test</button>
                      <button onClick={() => { if (confirm('Are you sure you want to abandon this test? Your answers will not be saved.')) navigate(-1); }} className="rounded-md border px-4 py-2">Cancel</button>
                    </div>
                  </div>
                </div>

                {/* Question navigation palette (mobile inline) */}
                <div className="mt-3">
                  <div className="text-sm text-slate-600 mb-2">Question Palette</div>
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                    {questions.map((q, i) => {
                      const answered = answers[q.id] !== undefined && answers[q.id] !== null;
                      const isMarked = marked[q.id];
                      const cls = `flex h-9 w-9 items-center justify-center rounded text-sm ${i===currentIndex ? 'bg-blue-600 text-white' : answered ? 'bg-green-100 text-green-800' : isMarked ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100'}`;
                      return (
                        <button key={q.id} onClick={() => gotoQuestion(i)} className={cls} title={`Q ${i+1}${isMarked? ' (marked)':''}${answered? ' (answered)':''}`}>
                          {i+1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Result view with optional per-question feedback */}
            {submitted && result && (
              <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5">
                <div className="text-center"><h3 className="text-xl font-bold text-blue-700">Result Summary</h3><p className="mt-1 text-sm text-muted">{exam?.name}</p></div>
                <div className="mt-4 flex overflow-x-auto rounded-xl border border-slate-200 bg-slate-50">
                  {[{ id: "summary", label: "Summary", Icon: BarChart3 }, { id: "all", label: "All", Icon: ListChecks }, { id: "correct", label: "Correct", Icon: Check }, { id: "incorrect", label: "Incorrect", Icon: X }, { id: "unanswered", label: "Unanswered", Icon: CircleHelp }].map(({ id: tabId, label, Icon }) => <button key={tabId} type="button" onClick={() => setResultTab(tabId)} className={`flex min-w-[92px] flex-1 flex-col items-center gap-1 px-3 py-3 text-[10px] font-bold uppercase tracking-wide transition ${resultTab === tabId ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-white"}`}><Icon size={16} />{label}</button>)}
                </div>

                {resultTab === "summary" ? (
                  <div className="mt-5">
                    <h4 className="text-sm font-bold text-blue-700">Question Stats</h4>
                    <div className="mt-3 grid gap-5 lg:grid-cols-2">
                      <div className="space-y-3">
                        {[[Trophy, "Total Score", `${result.score ?? 0} / ${result.maxScore ?? result.total ?? resultItems.length}`, "bg-gold"], [CircleHelp, "Rank", result.rank ?? "-", "bg-violet-600"], [Check, "Correct", resultCounts.correct, "bg-green-500"], [X, "Incorrect", resultCounts.incorrect, "bg-red-500"], [CircleMinus, "Unsolved", resultCounts.unanswered, "bg-slate-400"], [ListChecks, "Solved", resultItems.length - resultCounts.unanswered, "bg-orange-500"]].map(([Icon, label, value, color]) => <div key={label} className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${color}`}><Icon size={20} /></div><span className="text-sm text-muted">{label}:</span><strong className="text-navy">{value}</strong></div>)}
                      </div>
                      <div className="flex min-h-[210px] items-end justify-center gap-5 rounded-xl bg-slate-50 p-5">
                        {[["Correct", resultCounts.correct, "bg-green-500"], ["Incorrect", resultCounts.incorrect, "bg-red-500"], ["Unanswered", resultCounts.unanswered, "bg-blue-500"]].map(([label, value, color]) => <div key={label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-navy">{value}</span><div className={`w-full max-w-16 rounded-t-md ${color}`} style={{ height: `${Math.max(10, (value / Math.max(resultItems.length, 1)) * 150)}px` }} /><span className="text-center text-[10px] text-muted">{label}</span></div>)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    <h4 className="text-sm font-bold text-blue-700">{resultTab === "all" ? "All Questions" : `${resultTab[0].toUpperCase()}${resultTab.slice(1)} Questions`} ({resultTab === "all" ? resultItems.length : resultItems.filter((item) => item.status.toLowerCase() === resultTab).length})</h4>
                    {resultItems.filter((item) => resultTab === "all" || item.status.toLowerCase() === resultTab).map((item, index) => <div key={item.id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-start justify-between gap-3"><div className="text-sm font-semibold text-navy">Q{index + 1}. {item.text}</div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${item.status === "CORRECT" ? "bg-green-50 text-green-700" : item.status === "INCORRECT" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>{item.status}</span></div><div className="mt-2 grid gap-1 text-xs text-muted sm:grid-cols-2"><span>Your Answer: <strong className="text-navy">{item.selectedAnswer ?? "Not Answered"}</strong></span><span>Correct Answer: <strong className="text-green-700">{item.correctAnswer ?? "Not Provided"}</strong></span></div>{item.markedForReview && <span className="mt-2 inline-block rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">Marked for review</span>}</div>)}
                  </div>
                )}
                <div className="mt-5 flex flex-col gap-2 sm:flex-row"><button onClick={() => navigate('/sankalp/test-series')} className="rounded-lg border px-3 py-2 text-sm">Back to Series</button><button onClick={() => navigate('/student/profile', { state: { tab: 'result', submittedAttempt: result } })} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">View in My Result</button></div>
              </div>
            )}

          </div>

          {/* Aside with exam details and palette (desktop) */}
          <aside className="order-first lg:order-last">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,35,82,0.07)] lg:sticky lg:top-20">
              <h4 className="text-sm font-bold text-slate-700">Exam Details</h4>
              <dl className="mt-3 space-y-2 text-sm text-slate-600">
                <div><dt className="font-medium">Name</dt><dd>{exam?.name}</dd></div>
                <div><dt className="font-medium">Duration</dt><dd>{exam?.duration || 'N/A'} min</dd></div>
                <div><dt className="font-medium">Questions</dt><dd>{questions.length}</dd></div>
                <div><dt className="font-medium">Total Marks</dt><dd>{questions.reduce((s,q)=>s+Number(q.marks||1),0)}</dd></div>
              </dl>
              {!submitted && (
                <div className="mt-4 text-sm text-slate-600">Keep an eye on the timer. The test will auto-submit when time runs out.</div>
              )}

              {/* Desktop palette */}
              {!submitted && (
                <div className="mt-4">
                  <div className="text-sm text-slate-600 mb-2">Palette</div>
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-4">
                    {questions.map((q, i) => {
                      const answered = answers[q.id] !== undefined && answers[q.id] !== null;
                      const isMarked = marked[q.id];
                      const cls = `flex h-9 w-9 items-center justify-center rounded text-sm ${i===currentIndex ? 'bg-blue-600 text-white' : answered ? 'bg-green-100 text-green-800' : isMarked ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100'}`;
                      return (
                        <button key={q.id} onClick={() => gotoQuestion(i)} className={cls} title={`Q ${i+1}${isMarked? ' (marked)':''}${answered? ' (answered)':''}`}>
                          {i+1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {submitConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">Submit Test</h3>
            <p className="mt-2 text-sm text-slate-600">Are you sure you want to submit? You won't be able to change answers after submission.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSubmitConfirmOpen(false)} className="rounded-md border px-3 py-2">Cancel</button>
              <button onClick={doSubmit} className="rounded-md bg-red-600 px-3 py-2 text-white">Submit Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
