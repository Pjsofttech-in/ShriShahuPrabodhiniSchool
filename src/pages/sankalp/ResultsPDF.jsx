import React from "react";
import { Download, FileText, LayoutGrid, NotebookPen, BookOpenText, FileCheck2, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";

const quickLinks = [
  { label: "Pages", to: "/sankalp/exam-information", icon: LayoutGrid },
  { label: "Test Series", to: "/sankalp/test-series", icon: NotebookPen },
  { label: "Answer Key", to: "/sankalp/answer-key", icon: FileText },
  { label: "Ebook", to: "/sankalp/ebook", icon: BookOpenText },
  { label: "Result Check", to: "/sankalp/result-check", icon: FileCheck2 },
  { label: "Result PDF", to: "/sankalp/results-pdf", icon: ScrollText },
];

const pdfs = [
  { id: 1, name: "Sankalp Exam 2026 - Full Merit List (Class 10th)", size: "1.8 MB" },
  { id: 2, name: "Sankalp Exam 2026 - Full Merit List (Class 8th)", size: "1.5 MB" },
  { id: 3, name: "Sankalp Exam 2025 - Archived Result PDF", size: "2.0 MB" },
];

export default function ResultsPDF() {
  return (
    <div>
      <PageHeader title="Results PDF" crumb="Results PDF" />

      <section className="bg-cream/60 pb-10 pt-0 md:pb-12 md:pt-0">
        <div className="container-app max-w-4xl">
          <div className="mb-6 flex flex-wrap gap-2">
            {quickLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
                  to === "/sankalp/results-pdf"
                    ? "border-gold bg-gold text-white shadow-[0_10px_20px_rgba(255,109,0,0.14)]"
                    : "border-slate-200 bg-white text-navy hover:border-gold hover:text-gold-dark"
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          <div className="rounded-[26px] border border-black/5 bg-white p-4 shadow-[0_14px_40px_rgba(11,37,69,0.06)] md:p-6">
            <div className="space-y-4">
              {pdfs.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 text-navy"><FileText size={18} /></div>
                    <div>
                      <p className="text-sm font-bold text-navy">{p.name}</p>
                      <p className="text-xs text-muted">{p.size}</p>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-bold text-gold-dark transition hover:border-gold hover:bg-gold hover:text-white"><Download size={16} /> Download</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
