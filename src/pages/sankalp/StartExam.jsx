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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f9fd_0%,_#f0f4f8_35%,_#edf0f4_100%)] text-slate-800">
      <div className="border-b border-slate-200 bg-[#0d1f3d] py-2.5 text-white shadow-[0_8px_24px_rgba(13,31,61,0.15)]">
        <div className="container-app flex items-center justify-between gap-3">
          <span className="truncate text-xs font-semibold tracking-[0.12em] text-slate-100 uppercase">{exam?.name}</span>
          <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f7d078]">Test Instructions</span>
        </div>
      </div>

      <div className="container-app flex items-start justify-center py-6 sm:py-8">
        <div className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-[0_18px_54px_rgba(15,35,82,0.12)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-col items-center justify-center gap-3 border-b border-slate-100 pb-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f6d778] via-[#f0be3e] to-[#d7890a] text-[#102548] shadow-[0_10px_20px_rgba(240,190,62,0.22)]">
              <FileQuestion size={22} strokeWidth={2.3} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b37b08]">Before you begin</p>
              <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#0d1f3d] sm:text-[2rem]">Test Instructions</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">for {exam?.name}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <p className="text-sm leading-6 text-slate-600 sm:text-[15px]">{exam?.description ?? "Please read the instructions carefully before starting your test."}</p>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[["Questions", exam?.totalQuestions ?? "-"], ["Duration", `${exam?.duration ?? "-"} min`], ["Total Marks", exam?.totalMarks ?? "-"], ["Attempts", exam?.maxAttempts ?? 1]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-[#f8fafc] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"><dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</dt><dd className="mt-1 text-lg font-black text-[#13294a]">{value}</dd></div>)}
          </dl>

          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button onClick={() => navigate('/sankalp/test-series')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition duration-200 hover:border-[#0d1f3d] hover:text-[#0d1f3d]">Back to Test Series</button>
            <button onClick={onStart} className="rounded-xl bg-gradient-to-r from-[#f3c95a] via-[#f2b72d] to-[#d78d0d] px-4 py-2.5 text-sm font-bold text-[#12264e] shadow-[0_10px_18px_rgba(214,146,8,0.22)] transition duration-200 hover:translate-y-[-1px] hover:shadow-[0_14px_22px_rgba(214,146,8,0.3)]">Start Test</button>
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
