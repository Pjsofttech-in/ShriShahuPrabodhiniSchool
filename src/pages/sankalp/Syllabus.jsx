import React, { useEffect, useState } from "react";
import { ExternalLink, FileText, LayoutGrid, NotebookPen, BookOpenText, FileCheck2, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchSyllabus } from "../../services/backendService.js";

const quickLinks = [
  { label: "Pages", to: "/sankalp/exam-information", icon: LayoutGrid },
  { label: "Test Series", to: "/sankalp/test-series", icon: NotebookPen },
  { label: "Answer Key", to: "/sankalp/answer-key", icon: FileText },
  { label: "Ebook", to: "/sankalp/ebook", icon: BookOpenText },
  { label: "Result Check", to: "/sankalp/result-check", icon: FileCheck2 },
  { label: "Result PDF", to: "/sankalp/results-pdf", icon: ScrollText },
];

export default function Syllabus() {
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchSyllabus()
      .then((data) => {
        if (mounted) setSyllabus(data);
      })
      .catch((error) => {
        console.error("Failed to fetch syllabus:", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Syllabus" crumb="Syllabus" />

      <section className="bg-cream/60 pb-10 pt-0 md:pb-12 md:pt-0">
        <div className="container-app">
          <div className="mb-6 flex flex-wrap gap-2">
            {quickLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
                  to === "/sankalp/exam-information"
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
            {loading ? (
              <div className="py-16 text-center text-muted">Loading syllabus...</div>
            ) : syllabus.length === 0 ? (
              <div className="py-16 text-center text-muted">No syllabus is available right now.</div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {syllabus.map((item) => (
                  <article key={item.id} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <FileText size={28} className="mb-4 text-gold-dark" />
                    <h2 className="mb-5 text-lg font-bold text-navy">{item.title}</h2>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto inline-flex items-center gap-2 self-start text-sm font-bold text-gold-dark transition-colors hover:text-navy"
                      >
                        Open syllabus <ExternalLink size={15} />
                      </a>
                    ) : (
                      <span className="mt-auto text-sm text-muted">Link not available</span>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
