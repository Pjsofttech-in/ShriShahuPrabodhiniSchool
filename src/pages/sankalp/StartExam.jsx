import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Clock3, FileQuestion, ShieldCheck } from "lucide-react";
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

  if (loading) return <div className="min-h-screen bg-[#f7f9fc]"><div className="container-app py-20 text-center text-muted">Loading test...</div></div>;
  if (!exam) return <div className="min-h-screen bg-[#f7f9fc]"><div className="container-app py-20 text-center text-muted">Exam not found.</div></div>;

  function onStart() {
    // open confirmation
    setConfirmOpen(true);
  }

  function confirmStart() {
    setConfirmOpen(false);
    navigate(`/exam/${id}`, { state: { exam } });
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <div className="border-b border-slate-200 bg-navy-dark py-3 text-white">
        <div className="container-app flex items-center justify-between gap-4">
          <span className="truncate text-sm font-semibold">{exam?.name}</span>
          <span className="shrink-0 text-xs text-white/70">Test Instructions</span>
        </div>
      </div>
      <div className="container-app flex items-start justify-center py-5 sm:py-7">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,35,82,0.1)] sm:p-8">
          <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold"><FileQuestion size={22} /></div>
            <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-dark">Before you begin</p><h1 className="mt-1 text-xl font-bold text-navy sm:text-2xl">Test Instructions for {exam?.name}</h1></div>
          </div>
          <p className="mt-5 text-sm text-muted">{exam?.description ?? "Please read the instructions carefully before starting your test."}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Questions", exam?.totalQuestions ?? "-"], ["Duration", `${exam?.duration ?? "-"} min`], ["Total Marks", exam?.totalMarks ?? "-"], ["Attempts", exam?.maxAttempts ?? 1]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><dt className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 font-bold text-navy">{value}</dd></div>)}
          </dl>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button onClick={() => navigate('/sankalp/test-series')} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-muted transition hover:border-navy hover:text-navy">Back to Test Series</button>
            <button onClick={onStart} className="btn-primary justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm hover:bg-blue-700">Start Test</button>
          </div>
        </div>

        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-start-title">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="bg-blue-600 px-5 py-4 text-white"><h3 id="confirm-start-title" className="text-lg font-bold">Confirm Start Test</h3></div>
              <div className="p-5">
                <div className="space-y-3 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><Clock3 size={17} className="text-blue-600" /> Test is active until <strong className="text-navy">{exam?.endTime || "the scheduled end time"}</strong></p>
                  <p className="flex items-center gap-2"><ShieldCheck size={17} className="text-blue-600" /> You have <strong className="text-navy">{exam?.maxAttempts ?? 1} attempt{Number(exam?.maxAttempts ?? 1) === 1 ? "" : "s"}</strong> to solve the test.</p>
                </div>
                <p className="mt-5 text-center text-sm font-medium text-navy">Do you want to start now?</p>
                <div className="mt-5 flex justify-end gap-3">
                  <button onClick={() => setConfirmOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-slate-50">Cancel</button>
                  <button onClick={confirmStart} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">OK</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
