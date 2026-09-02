import React, { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, FileText, Sparkles } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchSyllabus } from "../../services/backendService.js";

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
      <PageHeader title="Syllabus" crumb="Syllabus" compact accentTitle accentTitleClass="text-[#e85d04]" />

      <section className="relative overflow-hidden bg-[#fffaf5] pb-12 pt-0 md:pb-16 md:pt-0">
        <div className="pointer-events-none absolute -right-24 top-8 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="container-app relative">
          <div className="mb-7 flex flex-col justify-between gap-5 rounded-[26px] border border-[#ffe0c2] bg-white p-5 shadow-[0_14px_40px_rgba(124,45,18,0.07)] md:flex-row md:items-center md:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e3] text-[#ed6a00]">
                <BookOpen size={23} />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ed6a00]">
                  <Sparkles size={12} /> Exam resources
                </div>
                <h2 className="text-xl font-black text-navy md:text-2xl">Explore your syllabus</h2>
                <p className="mt-1 text-sm text-slate-500">Stay focused with structured subject-wise preparation material.</p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#fff7ed] px-5 py-3 md:min-w-[130px] md:text-center">
              <p className="text-2xl font-black text-[#c2410c]">{syllabus.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a3412]">Available files</p>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#ffe7d1] bg-white p-4 shadow-[0_18px_45px_rgba(124,45,18,0.08)] md:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted">
                <div className="h-10 w-10 animate-pulse rounded-2xl bg-[#fff0e3]" />
                Loading syllabus...
              </div>
            ) : syllabus.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#f2c49c] bg-[#fffaf5] px-5 py-16 text-center text-muted">No syllabus is available right now.</div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {syllabus.map((item, index) => (
                  <article key={item.id} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#ffb36b] hover:shadow-[0_16px_28px_rgba(255,109,0,0.13)]">
                    <div className="mb-7 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0e3] text-[#ed6a00] transition-colors group-hover:bg-[#ff6d00] group-hover:text-white">
                        <FileText size={22} />
                      </div>
                      <span className="text-xs font-bold tracking-[0.15em] text-slate-300">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <h2 className="mb-6 text-lg font-bold text-navy">{item.title}</h2>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto inline-flex items-center gap-2 self-start rounded-xl bg-[#fff7ed] px-3.5 py-2.5 text-sm font-bold text-[#c2410c] transition-all hover:bg-[#ff6d00] hover:text-white"
                      >
                        Open syllabus <ArrowUpRight size={15} />
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
