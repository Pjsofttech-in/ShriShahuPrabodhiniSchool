import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchExams, fetchExamQuestions, submitExamResult } from "../../services/backendService.js";
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

  useEffect(() => {
    async function load() {
      try {
        const all = await fetchExams();
        const found = all.find((e) => String(e.id) === String(id));
        if (found) setExam(found);

        // First attempt to fetch questions from backend
        const backendQs = await fetchExamQuestions(id);
        let normalized = [];
        if (backendQs && backendQs.length) {
          // Normalize different possible response shapes
          normalized = backendQs.map((it, idx) => {
            // If API returns examQuestion wrapper with 'question'
            const rawQ = it.question ?? it;
            const qId = rawQ?.id ?? rawQ?.questionId ?? `${id}-q-${idx + 1}`;
            const text = rawQ?.text ?? rawQ?.questionText ?? rawQ?.name ?? rawQ?.title ?? `Question ${idx + 1}`;
            let options = rawQ?.options ?? rawQ?.choices ?? rawQ?.optionList;
            if (!options && rawQ?.optionsJson) {
              try { options = JSON.parse(rawQ.optionsJson); } catch(e){ options = null; }
            }
            if (!Array.isArray(options) || options.length === 0) {
              // fallback to placeholder options
              options = ["Option A","Option B","Option C","Option D"];
            }
            const marks = Number(it.marks ?? rawQ?.marks ?? rawQ?.weight ?? 1) || 1;
            return {
              id: qId,
              text,
              options,
              marks,
              // don't rely on correctIndex from server — server should score — include if present
              correctIndex: rawQ?.correctIndex ?? rawQ?.answerIndex ?? null,
            };
          });
        }

        if (!normalized.length) {
          // Mock: create sample MCQ questions if backend didn't return any
          const sampleCount = Number(found?.totalQuestions) || 10;
          normalized = Array.from({ length: sampleCount }).map((_, idx) => ({
            id: `${id}-q-${idx + 1}`,
            text: `Q${idx + 1}. Example question for ${found?.name ?? 'the exam'} — choose the correct option.`,
            options: [
              `Option A for question ${idx + 1}`,
              `Option B for question ${idx + 1}`,
              `Option C for question ${idx + 1}`,
              `Option D for question ${idx + 1}`,
            ],
            correctIndex: 0,
            marks: 1,
          }));
        }

        setQuestions(normalized);

        const durationMin = Number(found?.duration) || 10;
        const sec = durationMin * 60;
        initialDurationRef.current = sec;
        setTimeLeft(sec);
      } catch (err) {
        // fallback mock
        const mockQs = Array.from({ length: 10 }).map((_, idx) => ({
          id: `${id}-q-${idx + 1}`,
          text: `Q${idx + 1}. Example question — choose the correct option.`,
          options: ["Option A","Option B","Option C","Option D"],
          correctIndex: 0,
          marks: 1,
        }));
        setQuestions(mockQs);
        initialDurationRef.current = 10 * 60;
        setTimeLeft(10 * 60);
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
    const localRes = computeResult();
    setSubmitted(true);
    clearInterval(timerRef.current);

    const timeTaken = (initialDurationRef.current || 0) - (timeLeft || 0);
    const payload = {
      examId: id,
      studentId: user?.studentId ?? user?.id ?? null,
      answers: Object.entries(answers).map(([qid, opt]) => ({ questionId: qid, answerIndex: opt, selectedAnswer: (questions.find(q => String(q.id) === String(qid))?.options?.[opt] ?? null) })),
      timeTaken,
      submittedAt: new Date().toISOString(),
      meta: { localScore: localRes.score, localMaxScore: localRes.maxScore },
    };

    try {
      const serverRes = await submitExamResult(payload);
      // If server returns structured result use it, otherwise fall back to local
      if (serverRes && (serverRes.score !== undefined || serverRes.data)) {
        // normalize different shapes
        const data = serverRes.data ?? serverRes;
        const normalized = {
          score: data.score ?? data.correctMarks ?? data.totalMarks ?? localRes.score,
          maxScore: data.maxScore ?? data.totalMarks ?? localRes.maxScore,
          total: data.total ?? localRes.total,
        };
        // attach per-question details if server provided them
        if (data.details || data.perQuestion || data.questionResults) {
          normalized.details = data.details ?? data.perQuestion ?? data.questionResults;
        }
        setResult(normalized);
        // refresh user profile to include exam result in student profile
        try { await refreshProfile(); } catch (e) { /* ignore */ }
      } else {
        setResult(localRes);
      }
    } catch (err) {
      // submission failed — keep local result and allow retry later
      console.warn('Result submission failed:', err);
      setResult(localRes);
    }
  }

  async function handleAutoSubmit() {
    if (submitted) return;
    setSubmitted(true);
    const localRes = computeResult();

    const timeTaken = (initialDurationRef.current || 0) - (timeLeft || 0);
    const payload = {
      examId: id,
      studentId: user?.studentId ?? user?.id ?? null,
      answers: Object.entries(answers).map(([qid, opt]) => ({ questionId: qid, answerIndex: opt, selectedAnswer: (questions.find(q => String(q.id) === String(qid))?.options?.[opt] ?? null) })),
      timeTaken,
      submittedAt: new Date().toISOString(),
      meta: { localScore: localRes.score, localMaxScore: localRes.maxScore },
    };

    try {
      const serverRes = await submitExamResult(payload);
      if (serverRes && (serverRes.score !== undefined || serverRes.data)) {
        const data = serverRes.data ?? serverRes;
        const normalized = {
          score: data.score ?? data.correctMarks ?? data.totalMarks ?? localRes.score,
          maxScore: data.maxScore ?? data.totalMarks ?? localRes.maxScore,
          total: data.total ?? localRes.total,
        };
        if (data.details || data.perQuestion || data.questionResults) {
          normalized.details = data.details ?? data.perQuestion ?? data.questionResults;
        }
        setResult(normalized);
        try { await refreshProfile(); } catch(e) { }
      } else {
        setResult(localRes);
      }
    } catch (err) {
      console.warn('Auto-submit failed:', err);
      setResult(localRes);
    }
  }

  if (loading) return <div className="min-h-screen"><PageHeader title="Exam" /><div className="container-app py-20 text-center text-muted">Preparing exam...</div></div>;

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
