import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchExams } from "../../services/backendService.js";

export default function StartExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [exam, setExam] = useState(location.state?.exam ?? null);
  const [loading, setLoading] = useState(!exam);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const all = await fetchExams();
        const found = all.find((e) => String(e.id) === String(id));
        if (found) setExam(found);
      } catch (err) {
        console.warn('Failed to fetch exam info', err);
      } finally {
        setLoading(false);
      }
    }
    if (!exam) load();
  }, [id]);

  if (loading) return <div className="min-h-screen"><PageHeader title="Start Exam" /><div className="container-app py-20 text-center">Loading...</div></div>;
  if (!exam) return <div className="min-h-screen"><PageHeader title="Start Exam" /><div className="container-app py-20 text-center">Exam not found.</div></div>;

  function onStart() {
    // open confirmation
    setConfirmOpen(true);
  }

  function confirmStart() {
    setConfirmOpen(false);
    navigate(`/exam/${id}`, { state: { exam } });
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title={exam?.name ?? 'Start Exam'} crumb="Exam" />
      <div className="container-app py-8">
        <div className="max-w-3xl mx-auto rounded-2xl border p-6 shadow-sm bg-white">
          <h2 className="text-2xl font-semibold">{exam?.name}</h2>
          <p className="text-sm text-slate-600 mt-2">{exam?.description ?? 'Please read instructions carefully before starting the exam.'}</p>

          <dl className="grid grid-cols-2 gap-3 mt-4 text-sm text-slate-700">
            <div><dt className="font-medium">Questions</dt><dd>{exam?.totalQuestions ?? '—'}</dd></div>
            <div><dt className="font-medium">Duration</dt><dd>{exam?.duration ?? '—'} minutes</dd></div>
            <div><dt className="font-medium">Total Marks</dt><dd>{exam?.totalMarks ?? '—'}</dd></div>
            <div><dt className="font-medium">Attempts</dt><dd>{exam?.maxAttempts ?? 1}</dd></div>
          </dl>

          <div className="mt-6 flex gap-3">
            <button onClick={onStart} className="btn-primary bg-blue-600 text-white px-4 py-2 rounded-md">Start Exam</button>
            <button onClick={() => navigate('/sankalp/test-series')} className="rounded-md border px-4 py-2">Back</button>
          </div>
        </div>

        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold">Start Exam</h3>
              <p className="mt-2 text-sm text-slate-600">Once you start the exam the timer will begin. Are you ready to start?</p>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setConfirmOpen(false)} className="rounded-md border px-3 py-2">Cancel</button>
                <button onClick={confirmStart} className="rounded-md bg-blue-600 px-3 py-2 text-white">Start Now</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
