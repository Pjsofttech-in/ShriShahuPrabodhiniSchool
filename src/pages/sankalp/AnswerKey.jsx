import React, { useEffect, useState } from "react";
import { FileDown, FileText, LayoutGrid, NotebookPen, BookOpenText, FileCheck2, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchAnswerKeys } from "../../services/backendService.js";

const quickLinks = [
  { label: "Pages", to: "/sankalp/exam-information", icon: LayoutGrid },
  { label: "Test Series", to: "/sankalp/test-series", icon: NotebookPen },
  { label: "Answer Key", to: "/sankalp/answer-key", icon: FileText },
  { label: "Ebook", to: "/sankalp/ebook", icon: BookOpenText },
  { label: "Result Check", to: "/sankalp/result-check", icon: FileCheck2 },
  { label: "Result PDF", to: "/sankalp/results-pdf", icon: ScrollText },
];

export default function AnswerKey() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchAnswerKeys()
      .then((data) => {
        if (mounted) setKeys(data);
      })
      .catch((error) => {
        console.error("Failed to load answer keys:", error);
        if (mounted) setKeys([]);
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
      <PageHeader title="Answer Key" crumb="Answer Key" />

      <section className="bg-cream/60 pb-10 pt-0 md:pb-12 md:pt-0">
        <div className="container-app max-w-4xl">
          <div className="mb-6 flex flex-wrap gap-2">
            {quickLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
                  to === "/sankalp/answer-key"
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
            <p className="mb-6 text-sm leading-6 text-slate-600">
              Official answer keys are published within 48 hours of the exam. Objection window remains open for 3 days after publication.
            </p>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-muted">Loading answer keys...</div>
            ) : keys.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-muted">No answer keys available right now.</div>
            ) : (
              <div className="space-y-4">
                {keys.map((key) => (
                  <div key={key.id || key.title} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div>
                      <p className="font-bold text-navy">{key.title}</p>
                      {key.publishedAt && <p className="mt-1 text-xs text-muted">Published: {key.publishedAt}</p>}
                    </div>
                    <a href={key.file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-bold text-gold-dark transition hover:border-gold hover:bg-gold hover:text-white">
                      <FileDown size={16} /> Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
