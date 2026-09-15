import React, { useEffect, useState } from "react";
import { Award, CalendarClock, CheckCircle2, CircleX, Clock3, Download, Eye, FileDown, Gauge, LoaderCircle, Medal, Trophy, UserRound, X } from "lucide-react";
import { jsPDF } from "jspdf";

function formatDuration(seconds) {
  if (seconds == null || seconds === "") return "-";
  const total = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}m ${String(remaining).padStart(2, "0")}s`;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = Array.isArray(value)
    ? new Date(Date.UTC(value[0], (value[1] ?? 1) - 1, value[2] ?? 1, value[3] ?? 0, value[4] ?? 0, value[5] ?? 0))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function createStudentPdf(row, title) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(23, 59, 95);
  pdf.rect(0, 0, width, 42, "F");
  pdf.setFillColor(243, 185, 61);
  pdf.circle(width - 22, 14, 12, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);
  pdf.text("LEADERBOARD RESULT", 14, 17);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text(String(title), 14, 26);
  pdf.setTextColor(23, 59, 95);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(String(row.studentName), 14, 62);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Student ID: ${row.studentId}`, 14, 70);
  pdf.setFillColor(255, 247, 237);
  pdf.setDrawColor(255, 216, 181);
  pdf.roundedRect(14, 82, width - 28, 70, 4, 4, "FD");
  const details = [
    ["Rank", `#${row.rank}`],
    ["Score", `${row.obtainedMarks} / ${row.totalMarks}`],
    ["Percentage", `${row.percentage}%`],
    ["Duration", formatDuration(row.timeTakenSeconds)],
    ["Started", formatDateTime(row.startedAt)],
    ["Submitted", formatDateTime(row.submittedAt)],
  ];
  details.forEach(([label, value], index) => {
    const column = index % 2;
    const line = Math.floor(index / 2);
    const x = 22 + column * ((width - 44) / 2);
    const y = 96 + line * 18;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(label.toUpperCase(), x, y);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(23, 59, 95);
    pdf.text(String(value), x, y + 6);
  });
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Shri Shahu Prabodhini School", 14, 282);
  return pdf;
}

function downloadStudentPdf(row, title) {
  const pdf = createStudentPdf(row, title);
  pdf.save(`leaderboard-${String(row.studentId).replace(/[^a-z0-9]/gi, "-")}.pdf`);
}

function previewStudentPdf(row, title) {
  const pdf = createStudentPdf(row, title);
  const previewWindow = window.open(URL.createObjectURL(pdf.output("blob")), "_blank", "noopener,noreferrer");
  if (!previewWindow) return;
  previewWindow.opener = null;
}

export default function LeaderboardModal({ open, title, subtitle, fetchRows, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError("");
    fetchRows()
      .then((items) => { if (active) setRows(Array.isArray(items) ? items : []); })
      .catch((requestError) => {
        if (!active) return;
        setRows([]);
        setError(requestError?.response?.data?.message || requestError?.response?.data?.error || "Leaderboard is not available right now.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, fetchRows]);

  function downloadLeaderboard() {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    const margin = 12;
    let y = 16;
    const addPage = () => { pdf.addPage(); y = 16; pdf.setFillColor(23, 59, 95); pdf.rect(0, 0, width, 8, "F"); };
    pdf.setFillColor(23, 59, 95);
    pdf.rect(0, 0, width, 40, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("LEADERBOARD", margin, 17);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(String(title), margin, 26);
    y = 52;
    pdf.setFillColor(243, 185, 61);
    pdf.roundedRect(margin, y, width - margin * 2, 12, 2, 2, "F");
    pdf.setTextColor(23, 59, 95);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("RANK", margin + 3, y + 8);
    pdf.text("STUDENT", margin + 18, y + 8);
    pdf.text("SCORE", margin + 88, y + 8);
    pdf.text("PERCENT", margin + 112, y + 8);
    pdf.text("DURATION", margin + 139, y + 8);
    y += 18;
    rows.forEach((row, index) => {
      if (y > height - 18) addPage();
      pdf.setFillColor(index % 2 ? 248 : 255, index % 2 ? 250 : 247, index % 2 ? 252 : 237);
      pdf.roundedRect(margin, y - 5, width - margin * 2, 12, 2, 2, "F");
      pdf.setTextColor(23, 59, 95);
      pdf.setFont("helvetica", index < 3 ? "bold" : "normal");
      pdf.setFontSize(8);
      pdf.text(`#${row.rank}`, margin + 3, y + 3);
      pdf.text(pdf.splitTextToSize(String(row.studentName), 62), margin + 18, y + 3);
      pdf.text(`${row.obtainedMarks}/${row.totalMarks}`, margin + 88, y + 3);
      pdf.text(`${row.percentage}%`, margin + 112, y + 3);
      pdf.text(formatDuration(row.timeTakenSeconds), margin + 139, y + 3);
      y += 15;
    });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Shri Shahu Prabodhini School", margin, height - 8);
    pdf.save(`leaderboard-${String(title).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#102b46]/70 p-3 backdrop-blur-sm sm:p-6">
      <section className="w-full max-w-6xl overflow-hidden rounded-2xl bg-[#fffdf8] shadow-2xl">
        <header className="flex items-start justify-between gap-4 bg-[#173b5f] px-4 py-4 text-white sm:px-6">
          <div><div className="flex items-center gap-2 text-[#f8d77e]"><Trophy size={18} /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">Live rankings</span></div><h2 className="mt-1 text-xl font-bold sm:text-2xl">{title}</h2>{subtitle && <p className="mt-1 text-xs text-white/70">{subtitle}</p>}</div>
          <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={downloadLeaderboard} disabled={!rows.length} className="inline-flex items-center gap-1.5 rounded-lg bg-[#f3b93d] px-3 py-2 text-xs font-bold text-[#173b5f] shadow-[0_8px_18px_rgba(243,185,61,0.2)] transition hover:-translate-y-0.5 hover:bg-[#ffd978] disabled:cursor-not-allowed disabled:opacity-50" title="Download leaderboard"><FileDown size={14} /> <span className="hidden sm:inline">Download leaderboard</span></button><button type="button" onClick={onClose} className="rounded-lg border border-white/25 p-2 text-white transition hover:bg-white/10" aria-label="Close leaderboard"><X size={17} /></button></div>
        </header>
        <div className="max-h-[72vh] overflow-auto p-3 sm:p-5">
          {loading && <div className="flex justify-center gap-2 py-16 text-sm text-slate-500"><LoaderCircle size={20} className="animate-spin text-[#e86516]" /> Loading live leaderboard...</div>}
          {!loading && error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{error}</div>}
          {!loading && !error && !rows.length && <div className="py-16 text-center text-sm text-slate-500">No leaderboard entries are available yet.</div>}
          {!loading && !error && rows.length > 0 && <div className="overflow-x-auto rounded-2xl border border-[#eadfce] shadow-[0_10px_26px_rgba(23,59,95,0.06)]"><table className="min-w-[920px] w-full text-left text-xs"><thead className="bg-[linear-gradient(110deg,#fff0df_0%,#fff8ed_100%)] text-[10px] uppercase tracking-wider text-[#9a4a18]"><tr><th className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><Medal size={13} /> Rank</span></th><th className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><UserRound size={13} /> Student</span></th><th className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><Gauge size={13} /> Score</span></th><th className="px-4 py-3">Percentage</th><th className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} /> Correct</span></th><th className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><CircleX size={13} /> Incorrect</span></th><th className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> Duration</span></th><th className="px-4 py-3 text-right"><span className="inline-flex items-center gap-1.5"><Award size={13} /> Result</span></th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.studentId}-${index}`} className={`border-t border-[#f1e4d5] transition hover:bg-[#fff8ed] ${index < 3 ? "bg-[#fffaf0]" : "bg-white"}`}><td className="px-4 py-3"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold shadow-sm ${index === 0 ? "bg-[#f3b93d] text-white" : index === 1 ? "bg-slate-300 text-slate-700" : index === 2 ? "bg-[#d58a5b] text-white" : "bg-slate-100 text-slate-600"}`}>#{row.rank}</span></td><td className="px-4 py-3"><div className="font-bold text-[#173b5f]">{row.studentName}</div><div className="mt-0.5 text-[10px] text-slate-500">ID: {row.studentId}</div></td><td className="px-4 py-3 font-bold text-[#173b5f]">{row.obtainedMarks} / {row.totalMarks}</td><td className="px-4 py-3 font-bold text-[#e86516]">{row.percentage}%</td><td className="px-4 py-3 text-emerald-700">{row.correctQuestions}</td><td className="px-4 py-3 text-red-600">{row.incorrectQuestions}</td><td className="px-4 py-3 text-slate-600">{formatDuration(row.timeTakenSeconds)}</td><td className="px-4 py-3 text-right"><div className="inline-flex items-center gap-1"><button type="button" onClick={() => previewStudentPdf(row, title)} className="inline-flex items-center justify-center rounded-lg border border-[#f3bd63] bg-white p-2 text-[#e86516] transition hover:-translate-y-0.5 hover:bg-[#fff0df]" title="View student result PDF" aria-label={`View ${row.studentName} result PDF`}><Eye size={14} /></button><button type="button" onClick={() => downloadStudentPdf(row, title)} className="inline-flex items-center gap-1 rounded-lg border border-[#f3bd63] bg-white px-2.5 py-1.5 font-semibold text-[#e86516] transition hover:-translate-y-0.5 hover:bg-[#fff0df]" title="Download student result"><Download size={13} /> <span className="hidden xl:inline">PDF</span></button></div></td></tr>)}</tbody></table></div>}
        </div>
      </section>
    </div>
  );
}
