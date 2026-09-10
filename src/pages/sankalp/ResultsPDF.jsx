import React, { useEffect, useState } from "react";
import { CalendarDays, Download, FileText, FileCheck2, LayoutGrid, LoaderCircle, NotebookPen, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchResultsPdfs } from "../../services/backendService.js";
import { API_BASE_URL } from "../../utils/api.js";

const quickLinks = [
  { label: "Pages", to: "/sankalp/exam-information", icon: LayoutGrid },
  { label: "Test Series", to: "/sankalp/test-series", icon: NotebookPen },
  { label: "Answer Key", to: "/sankalp/answer-key", icon: FileText },
  { label: "Syllabus", to: "/sankalp/syllabus", icon: FileText },
  { label: "Result Check", to: "/sankalp/result-check", icon: FileCheck2 },
  { label: "Result PDF", to: "/sankalp/results-pdf", icon: ScrollText },
];

function fileUrl(file) {
  if (!file) return "#";
  const value = String(file).trim();
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${value.replace(/^\/+/, "")}`;
}

function formatDate(value) {
  if (!value) return "Official result";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function ResultsPDF() {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchResultsPdfs().then((items) => active && setPdfs(items)).catch(() => active && setError("Results PDFs are temporarily unavailable.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return <div className="bg-[#f3f6f6]">
    <PageHeader title="Results PDF" crumb="Results PDF" />
    <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f3f6f6_100%)] pb-12 pt-6 md:pb-16 md:pt-8">
      <div className="container-app max-w-5xl">
        <div className="mb-7 flex max-w-full gap-2 overflow-x-auto pb-1">{quickLinks.map(({ label, to, icon: Icon }) => <Link key={label} to={to} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${to === "/sankalp/results-pdf" ? "border-[#e86516] bg-[#e86516] text-white shadow-[0_10px_20px_rgba(232,101,22,0.18)]" : "border-[#e1e7e4] bg-white text-navy hover:-translate-y-0.5 hover:border-[#e86516] hover:text-[#e86516]"}`}><Icon size={14} />{label}</Link>)}</div>
        <div className="mb-7 flex items-end justify-between gap-4 border-b border-[#e7dfd1] pb-6"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b65318]">Sankalp archive</p><h1 className="mt-2 font-display text-3xl font-bold text-navy sm:text-4xl">Results PDFs</h1></div><p className="hidden text-sm text-muted sm:block">Published results, ready to download.</p></div>
        {loading && <div className="flex min-h-56 items-center justify-center gap-3 rounded-[28px] bg-white text-muted shadow-[0_18px_45px_rgba(23,59,95,0.08)]"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading result files...</div>}
        {!loading && error && <p className="rounded-[28px] bg-white py-16 text-center text-maroon shadow-[0_18px_45px_rgba(23,59,95,0.08)]">{error}</p>}
        {!loading && !error && pdfs.length === 0 && <p className="rounded-[28px] bg-white py-16 text-center text-muted shadow-[0_18px_45px_rgba(23,59,95,0.08)]">No result PDFs have been published yet.</p>}
        {!loading && !error && pdfs.length > 0 && <div className="grid gap-5 md:grid-cols-2">{pdfs.map((pdf, index) => <article key={pdf.id} className="content-reveal group relative overflow-hidden rounded-[24px] border border-[#eadfce] bg-[#fffdf8] p-5 shadow-[0_12px_30px_rgba(23,59,95,0.08)] transition duration-500 hover:-translate-y-2 hover:border-[#e86516]/45 hover:shadow-[0_22px_44px_rgba(237,90,0,0.15)]" style={{ animationDelay: `${index * 70}ms` }}><div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full border-[12px] border-[#f3bd63]/25 transition duration-500 group-hover:scale-125" /><div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff0df] text-[#e86516] transition duration-300 group-hover:rotate-3 group-hover:scale-110"><FileText size={28} /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8752b]">Official result</p><h2 className="mt-1 font-display text-xl font-bold leading-tight text-navy">{pdf.title}</h2>{pdf.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{pdf.description}</p>}</div></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee5d8] pt-4"><p className="flex items-center gap-1.5 text-xs text-muted"><CalendarDays size={14} className="text-[#e86516]" /> {formatDate(pdf.publishedAt)}{pdf.size && ` · ${pdf.size}`}</p><a href={fileUrl(pdf.file)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#e86516] px-4 py-2 text-xs font-bold text-white shadow-[0_8px_18px_rgba(232,101,22,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-[#c84c0b] hover:shadow-[0_12px_24px_rgba(232,101,22,0.32)]"><Download size={15} /> Download</a></div></article>)}</div>}
      </div>
    </section>
  </div>;
}
