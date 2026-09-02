import React, { useState } from "react";
import { Search, FileText, LayoutGrid, NotebookPen, BookOpenText, FileCheck2, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import { studentsData } from "../../data/studentsData.js";

const quickLinks = [
  { label: "Pages", to: "/sankalp/exam-information", icon: LayoutGrid },
  { label: "Test Series", to: "/sankalp/test-series", icon: NotebookPen },
  { label: "Answer Key", to: "/sankalp/answer-key", icon: FileText },
  { label: "Ebook", to: "/sankalp/ebook", icon: BookOpenText },
  { label: "Result Check", to: "/sankalp/result-check", icon: FileCheck2 },
  { label: "Result PDF", to: "/sankalp/results-pdf", icon: ScrollText },
];

export default function ResultCheck() {
  const [rollNo, setRollNo] = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    setSearched(true);
    const student = studentsData.find((s) => s.rollNo.toLowerCase() === rollNo.trim().toLowerCase());
    if (student) {
      const marks = 70 + (student.rollNo.charCodeAt(student.rollNo.length - 1) % 30);
      setResult({ ...student, marks, status: marks >= 40 ? "Pass" : "Fail" });
    } else {
      setResult(null);
    }
  }

  return (
    <div>
      <PageHeader title="Result Check" crumb="Result Check" />

      <section className="bg-cream/60 pb-10 pt-0 md:pb-12 md:pt-0">
        <div className="container-app max-w-3xl">
          <div className="mb-6 flex flex-wrap gap-2">
            {quickLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
                  to === "/sankalp/result-check"
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
            <form onSubmit={handleSearch} className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <label className="mb-2 block text-sm font-semibold text-navy">Enter Your Roll Number</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="input-field flex-1"
                  placeholder="e.g. SSP2026-0001"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                />
                <button className="btn-primary shrink-0"><Search size={16} /> Check</button>
              </div>
              <p className="mt-2 text-xs text-muted">Try SSP2026-0001 or SSP2026-0002 (demo data)</p>
            </form>

            {searched && result && (
              <div className="rounded-2xl border border-l-4 border-gold bg-slate-50 p-6">
                <h3 className="mb-4 text-lg font-bold text-navy">{result.name}</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted">Roll No.</dt><dd className="font-mono font-bold">{result.rollNo}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Class</dt><dd className="font-bold">{result.class}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Marks Obtained</dt><dd className="font-bold">{result.marks}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Status</dt><dd className={`font-bold ${result.status === "Pass" ? "text-green-600" : "text-red-600"}`}>{result.status}</dd></div>
                </dl>
              </div>
            )}
            {searched && !result && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-muted">No record found for this roll number.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
