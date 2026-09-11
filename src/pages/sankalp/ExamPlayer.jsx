import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Check, CircleHelp, CircleMinus, Clock3, Flag, ListChecks, Timer, Trophy, X } from "lucide-react";
import {
  fetchExams,
  startExamAttempt,
  fetchAttemptQuestions,
  fetchQuestionsByExamId,
  saveAttemptAnswer,
  submitExamAttempt,
  fetchStudentResultById,
  fetchExamAttemptResult,
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
  const submittingRef = useRef(false);
  const pendingAnswerSavesRef = useRef(new Set());

  function normalizeQuestion(item, index) {
    const question = item?.question && typeof item.question === "object" ? item.question : item;
    const questionId = question?.questionId ?? question?.id ?? item?.questionId ?? `${id}-q-${index + 1}`;
    const text = question?.question ?? question?.questionText ?? question?.text ?? item?.questionText ?? `Question ${index + 1}`;
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
      sequence: Number(question?.sequence ?? item?.sequence ?? index + 1),
      sectionName: question?.sectionName ?? item?.sectionName ?? "",
      examName: question?.examName ?? item?.examName ?? "",
      questionType: question?.questionType ?? item?.questionType ?? "MCQ",
      answerExplanation: question?.answerExplanation ?? item?.answerExplanation ?? "",
      answerSupportingFile: question?.answerSupportingFile ?? item?.answerSupportingFile ?? "",
      active: question?.active ?? item?.active ?? true,
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
        let backendQs = [];
        try {
          backendQs = await fetchAttemptQuestions(attempt.attemptId);
        } catch (questionError) {
          console.warn("Attempt questions endpoint unavailable; loading live questions by exam.", questionError);
        }
        if (!backendQs.length) backendQs = await fetchQuestionsByExamId(id);
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
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted]);

  useEffect(() => {
    if (timeLeft === 0 && attemptId && !submitted && !loading) {
      handleAutoSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, attemptId, loading, submitted]);

  function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function selectAnswer(qid, optionIndex) {
    setAnswers((a) => ({ ...a, [qid]: optionIndex }));
    const question = questions.find((item) => String(item.id) === String(qid));

    if (attemptId && question) {
      const savePromise = saveAttemptAnswer(attemptId, {
        questionId: qid,
        selectedAnswer: question.options[optionIndex],
      }).catch((error) => {
        console.warn("Failed to save answer:", error);
        setSubmitError("An answer could not be saved. Please try again.");
      });
      pendingAnswerSavesRef.current.add(savePromise);
      savePromise.finally(() => pendingAnswerSavesRef.current.delete(savePromise));
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
    const source = [result.details, result.questions, result.questionResponses, result.resultQuestions, result.resultQuestionResponses, result.answers].find((items) => Array.isArray(items) && items.length > 0) || [];
    return questions.map((question, index) => {
      const detail = source.find((item) => String(item.questionId ?? item.question_id ?? item.id) === String(question.id)) ?? source[index] ?? {};
      const serverAnswer = detail.studentAnswer ?? detail.selectedAnswer ?? detail.selected_answer ?? null;
      const serverAnswerIndex = typeof serverAnswer === "string"
        ? question.options.findIndex((option) => String(option).trim() === serverAnswer.trim())
        : -1;
      const selectedIndex = detail.selectedIndex ?? detail.selected_index ?? detail.answerIndex ?? detail.answer_index ?? (serverAnswerIndex >= 0 ? serverAnswerIndex : answers[question.id] ?? null);
      const selectedAnswer = serverAnswer ?? (selectedIndex !== null && selectedIndex >= 0 ? question.options[selectedIndex] : null);
      const rawCorrectAnswer = detail.correctAnswer ?? detail.correct_answer ?? detail.correctOption ?? detail.correct_option ?? detail.answer ?? question.correctAnswer ?? null;
      const rawCorrectIndex = detail.correctIndex ?? detail.correct_index ?? detail.correctAnswerIndex ?? detail.correct_answer_index ?? question.correctIndex ?? null;
      const correctIndex = rawCorrectIndex !== null && rawCorrectIndex !== undefined
        ? Number(rawCorrectIndex)
        : (rawCorrectAnswer !== null && rawCorrectAnswer !== undefined ? question.options.findIndex((option) => String(option).trim() === String(rawCorrectAnswer).trim()) : null);
      const correctAnswer = correctIndex !== null && correctIndex >= 0 ? question.options[correctIndex] : rawCorrectAnswer;
      const isCorrect = detail.correct === true || (detail.correct === false ? false : correctIndex !== null && correctIndex >= 0 && selectedIndex !== null && Number(correctIndex) === Number(selectedIndex));
      const status = selectedAnswer === null || selectedAnswer === undefined ? "UNANSWERED" : isCorrect ? "CORRECT" : "INCORRECT";
      return { ...question, detail, selectedIndex, selectedAnswer, correctIndex, correctAnswer, status, marksObtained: detail.marksObtained ?? detail.marks_obtained ?? null, answerExplanation: detail.answerExplanation ?? question.answerExplanation ?? "", markedForReview: Boolean(detail.markedForReview ?? detail.marked_for_review) };
    });
  }, [result, questions, answers]);

  const resultCounts = useMemo(() => ({
    correct: resultItems.filter((item) => item.status === "CORRECT").length,
    incorrect: resultItems.filter((item) => item.status === "INCORRECT").length,
    unanswered: resultItems.filter((item) => item.status === "UNANSWERED").length,
  }), [resultItems]);

  async function handleSubmit() {
    if (!attemptId || submittingRef.current) {
      if (!attemptId) setSubmitError("Exam attempt was not created. Please restart the exam.");
      return;
    }
    submittingRef.current = true;
    setSubmitConfirmOpen(false);
    setSubmitted(true);
    clearInterval(timerRef.current);

    try {
      await Promise.allSettled([...pendingAnswerSavesRef.current]);
      let submittedResult = await submitExamAttempt(attemptId);
      try {
        submittedResult = await fetchExamAttemptResult(attemptId);
      } catch (refreshError) {
        console.warn("Exam was submitted, but the persisted attempt result could not be refreshed.", refreshError);
      }
      const persistedResultId = submittedResult?.resultId ?? submittedResult?.id ?? submittedResult?.result?.id;
      if (persistedResultId) {
        try {
          submittedResult = await fetchStudentResultById(persistedResultId);
        } catch (refreshError) {
          console.warn("Submitted result was saved, but the persisted result refresh failed.", refreshError);
        }
      }
      try { await refreshProfile(); } catch (e) { /* ignore */ }
      navigate("/student/profile", { state: { tab: "result" } });
    } catch (err) {
      console.warn('Result submission failed:', err);
      setSubmitError(err?.response?.data?.message || err?.message || "Unable to submit this exam.");
      setSubmitted(false);
      submittingRef.current = false;
    }
  }

  async function handleAutoSubmit() {
    if (submitted || submittingRef.current) return;
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
    <div className="min-h-screen bg-[#f8f8fa] text-[#34343d]">
      <div className="sticky top-0 z-40 bg-[#1e1d2e] text-white shadow-[0_3px_12px_rgba(20,20,35,0.25)]">
        <div className="flex min-h-[70px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <p className="min-w-0 truncate text-base font-semibold text-white/90 sm:text-lg">{exam?.name ?? 'Exam'} <span className="font-normal text-white/70">| Duration: {exam?.duration || "-"} min</span></p>
          {!submitted && <div className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-base font-extrabold ${timeLeft < 60 ? "bg-red-600" : "bg-[#45a74b]"}`}><Timer size={20} /> Time Left: {formatTime(timeLeft)}</div>}
        </div>
      </div>
      <div className="container-app py-4 sm:py-6">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_350px]">

          {/* Main question area */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_5px_18px_rgba(25,25,45,0.08)] sm:p-7">
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
                <div className="mb-4 rounded-xl border border-slate-100 p-5 sm:p-7">
                  <div className="mb-5 flex items-start justify-between gap-3"><div className="text-base font-semibold leading-7 text-[#41414a] sm:text-lg">Q{currentIndex + 1}. {questions[currentIndex].text}</div><Flag size={19} className={marked[questions[currentIndex].id] ? "shrink-0 fill-[#f28c00] text-[#f28c00]" : "shrink-0 text-slate-400"} /></div>

                  <div className="grid gap-2 md:grid-cols-2">
                    {questions[currentIndex].options.map((opt, oi) => {
                      const checked = answers[questions[currentIndex].id] === oi;
                      return (
                        <label key={oi} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3.5 transition sm:px-4 ${checked ? 'border-[#2795db] bg-[#eef8ff]' : 'border-transparent hover:bg-slate-50'}`}>
                          <input className="h-5 w-5 accent-[#2795db]" type="radio" name={questions[currentIndex].id} checked={checked} onChange={() => selectAnswer(questions[currentIndex].id, oi)} />
                          <span className="text-base text-[#555560]">{opt}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={prevQuestion} disabled={currentIndex === 0} className="rounded-md border border-slate-200 px-4 py-2.5 text-sm text-slate-500 disabled:opacity-40">← Previous</button>
                      <button onClick={nextQuestion} disabled={currentIndex === questions.length - 1 || answers[questions[currentIndex].id] === undefined} className="flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#2795db] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300">Save &amp; Next <ArrowRight size={15} /></button>
                      <button onClick={() => { setMarked((m) => ({ ...m, [questions[currentIndex].id]: false })); nextQuestion(); }} disabled={currentIndex === questions.length - 1} className="rounded-md border border-[#f2b632] px-5 py-2.5 text-sm font-bold text-[#ed9d00] disabled:opacity-40">Skip</button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <button onClick={() => { if (confirm('Are you sure you want to abandon this test? Your answers will not be saved.')) navigate(-1); }} className="rounded-md border px-4 py-2">Cancel</button>
                    </div>
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
                    {resultItems.filter((item) => resultTab === "all" || item.status.toLowerCase() === resultTab).map((item, index) => <div key={item.id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-start justify-between gap-3"><div className="text-sm font-semibold text-navy">Q{index + 1}. {item.text}</div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${item.status === "CORRECT" ? "bg-green-50 text-green-700" : item.status === "INCORRECT" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>{item.status}</span></div><div className="mt-2 grid gap-1 text-xs text-muted sm:grid-cols-2"><span>Your Answer: <strong className="text-navy">{item.selectedAnswer ?? "Not Answered"}</strong></span><span>Correct Answer: <strong className="text-green-700">{item.correctAnswer ?? "Not Provided"}</strong></span><span>Marks: <strong className="text-navy">{item.marksObtained ?? "—"}{item.marks != null ? ` / ${item.marks}` : ""}</strong></span></div>{item.answerExplanation && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{item.answerExplanation}</p>}{item.markedForReview && <span className="mt-2 inline-block rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">Marked for review</span>}</div>)}
                  </div>
                )}
                <div className="mt-5 flex flex-col gap-2 sm:flex-row"><button onClick={() => navigate('/sankalp/test-series')} className="rounded-lg border px-3 py-2 text-sm">Back to Series</button><button onClick={() => navigate('/student/profile', { state: { tab: 'result', submittedAttempt: result } })} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">View in My Result</button></div>
              </div>
            )}

          </div>

          {/* Aside with exam details and palette (desktop) */}
          <aside className="order-first lg:order-last">
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-[0_5px_18px_rgba(25,25,45,0.08)] lg:sticky lg:top-20">
              <h4 className="text-2xl font-bold text-[#292933]">Progress</h4>
              {!submitted && <div className="mt-5 space-y-3 text-sm text-slate-600"><div className="flex items-center gap-3"><span className="h-4 w-4 rounded-full bg-[#4caf50]" /> Answered</div><div className="flex items-center gap-3"><span className="h-4 w-4 rounded-full bg-[#f28c00]" /> Unanswered</div><div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-bold"><span className="rounded-full bg-[#4caf50] px-2 py-2 text-white">Answered: {Object.keys(answers).length}</span><span className="rounded-full bg-[#2997dd] px-2 py-2 text-white">Total: {questions.length}</span><span className="rounded-full bg-[#f5a000] px-2 py-2 text-white">Skipped: {questions.filter((q) => answers[q.id] === undefined).length}</span></div></div>}
              {!submitted && <div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-6">
                {questions.map((q, i) => {
                  const answered = answers[q.id] !== undefined && answers[q.id] !== null;
                  const isMarked = marked[q.id];
                  const cls = `flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white transition ${i === currentIndex ? 'bg-[#f28c00] ring-2 ring-[#2997dd] ring-offset-2' : answered ? 'bg-[#4caf50]' : isMarked ? 'bg-[#f28c00]' : 'bg-[#a8a8aa]'}`;
                  return <button key={q.id} onClick={() => gotoQuestion(i)} className={cls} title={`Question ${i + 1}`}>{i + 1}</button>;
                })}
              </div>}
              {!submitted && <button onClick={() => setSubmitConfirmOpen(true)} className="mt-7 w-full rounded-md bg-[#2f8735] px-4 py-3 text-lg font-bold text-white shadow-sm transition hover:bg-[#256d2b]">Submit Test</button>}
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
