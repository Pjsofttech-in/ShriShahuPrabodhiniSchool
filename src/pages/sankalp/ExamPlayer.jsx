import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import {
  fetchExams,
  startExamAttempt,
  fetchAttemptQuestions,
  saveAttemptAnswer,
  submitExamAttempt,
  rememberExamAttempt,
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

    return {
      id: questionId,
      text,
      options,
      marks: Number(item?.marks ?? question?.marks ?? question?.weight ?? 1) || 1,
      correctIndex: question?.correctIndex ?? question?.answerIndex ?? null,
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

  async function handleSubmit() {
    if (!attemptId) {
      setSubmitError("Exam attempt was not created. Please restart the exam.");
      return;
    }
    setSubmitted(true);
    clearInterval(timerRef.current);

    try {
      const submittedResult = await submitExamAttempt(attemptId);
      const resultWithExam = {
        ...submittedResult,
        attemptId,
        examId: id,
        examName: exam?.name,
        submittedAt: submittedResult?.submittedAt ?? new Date().toISOString(),
      };
      setResult(resultWithExam);
      rememberExamAttempt(attemptId);
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

  if (loading) return <div className="min-h-screen"><PageHeader title="Exam" /><div className="container-app py-20 text-center text-muted">Preparing exam...</div></div>;

  if (loadError) return <div className="min-h-screen"><PageHeader title={exam?.name ?? 'Exam'} /><div className="container-app py-20 text-center text-red-600">{loadError}</div></div>;

  if (!questions || questions.length === 0) return <div className="min-h-screen"><PageHeader title={exam?.name ?? 'Exam'} /><div className="container-app py-20 text-center text-muted">No questions available.</div></div>;


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
    <div className="min-h-screen bg-white">
      <PageHeader title={exam?.name ?? 'Exam'} crumb="Exam" />
      <div className="container-app py-6">
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">

          {/* Main question area */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {submitError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {!submitted && (
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">Time Left: <span className="font-mono font-semibold text-lg">{formatTime(timeLeft)}</span></div>
                <div className="text-sm text-slate-600">Questions: {questions.length}</div>
              </div>
            )}

            {/* Single question view */}
            {!submitted && (
              <div>
                <div className="mb-4 rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm text-slate-600">Question <span className="font-semibold">{currentIndex + 1}</span> of {questions.length}</div>
                      <div className="mt-2 text-base font-medium">{questions[currentIndex].text}</div>
                    </div>
                    <div className="text-sm text-slate-500">Marks: {questions[currentIndex].marks || 1}</div>
                  </div>

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
                      <button onClick={nextQuestion} disabled={currentIndex===questions.length-1} className="rounded-md border px-3 py-2">Next</button>
                      <button onClick={() => toggleMark(questions[currentIndex].id)} className="rounded-md border px-3 py-2">{marked[questions[currentIndex].id] ? 'Unmark' : 'Mark for review'}</button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setSubmitConfirmOpen(true)} className="btn-primary rounded-md bg-red-600 px-4 py-2 text-white">Submit Test</button>
                      <button onClick={() => { if (confirm('Are you sure you want to abandon this test? Your answers will not be saved.')) navigate(-1); }} className="rounded-md border px-4 py-2">Cancel</button>
                    </div>
                  </div>
                </div>

                {/* Question navigation palette (mobile inline) */}
                <div className="mt-3">
                  <div className="text-sm text-slate-600 mb-2">Question Palette</div>
                  <div className="grid grid-cols-8 gap-2">
                    {questions.map((q, i) => {
                      const answered = answers[q.id] !== undefined && answers[q.id] !== null;
                      const isMarked = marked[q.id];
                      const cls = `w-10 h-10 flex items-center justify-center rounded ${i===currentIndex ? 'bg-blue-600 text-white' : answered ? 'bg-green-100 text-green-800' : isMarked ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100'}`;
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
              <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-lg font-bold text-blue-700">Result</h3>
                <p className="mt-2">Score: <span className="font-mono font-semibold">{result.score}</span> / <span className="font-mono">{result.maxScore}</span></p>
                <p className="mt-1">Total Questions: {result.total}</p>

                {/** if detailed server feedback present show per-question breakdown */}
                {result.details && Array.isArray(result.details) && (
                  <div className="mt-4">
                    <h4 className="font-medium">Detailed Feedback</h4>
                    <div className="mt-2 space-y-3">
                      {result.details.map((d, idx) => {
                        const q = questions.find(q => String(q.id) === String(d.questionId)) || questions[idx];
                        const userAns = d.givenAnswerIndex ?? answers[q.id];
                        const correctAns = d.correctAnswerIndex ?? d.correctIndex ?? null;
                        const earned = d.marksObtained ?? d.marksGot ?? (d.correct ? (q.marks||1) : 0);
                        return (
                          <div key={q.id} className="rounded-md border p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-sm font-semibold">Q {idx+1}. {q.text}</div>
                                <div className="mt-2 text-sm">
                                  <div>User Answer: <span className="font-mono">{typeof userAns === 'number' ? q.options[userAns] ?? `Option ${userAns}` : 'Not Answered'}</span></div>
                                  <div>Correct Answer: <span className="font-mono">{typeof correctAns === 'number' ? q.options[correctAns] ?? `Option ${correctAns}` : 'Not Provided'}</span></div>
                                  <div>Marks: <span className="font-mono">{earned}</span></div>
                                </div>
                              </div>
                              <div className={`text-sm font-semibold ${d.correct ? 'text-green-600' : 'text-red-600'}`}>{d.correct ? 'Correct' : 'Incorrect'}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button onClick={() => navigate('/sankalp/test-series')} className="rounded-md border px-3 py-2">Back to Series</button>
                  <button
                    onClick={() => navigate('/student/profile', { state: { tab: 'result', submittedAttempt: result } })}
                    className="rounded-md bg-blue-600 px-3 py-2 text-white"
                  >
                    View in My Result
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Aside with exam details and palette (desktop) */}
          <aside className="order-first md:order-last">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                  <div className="grid grid-cols-4 gap-2">
                    {questions.map((q, i) => {
                      const answered = answers[q.id] !== undefined && answers[q.id] !== null;
                      const isMarked = marked[q.id];
                      const cls = `w-10 h-10 flex items-center justify-center rounded ${i===currentIndex ? 'bg-blue-600 text-white' : answered ? 'bg-green-100 text-green-800' : isMarked ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100'}`;
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
