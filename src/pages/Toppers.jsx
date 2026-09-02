import React, { useEffect, useState } from "react";
import { Crown, GraduationCap, LoaderCircle, Medal, Trophy } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { API_BASE_URL } from "../utils/api.js";
import { fetchToppers } from "../services/backendService.js";

function resolveImageUrl(image) {
  if (!image) return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

export default function Toppers() {
  const [toppers, setToppers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState("All");

  useEffect(() => {
    let active = true;
    fetchToppers()
      .then((items) => active && setToppers(items.sort((first, second) => Number(second.year) - Number(first.year))))
      .catch(() => active && setError("Toppers are temporarily unavailable. Please check back soon."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const years = ["All", ...new Set(toppers.map((topper) => topper.year).filter(Boolean))];
  const filtered = year === "All" ? toppers : toppers.filter((topper) => topper.year === year);

  return (
    <div>
      <PageHeader title="Sankalp Exam Toppers" crumb="Toppers" />
      <section className="relative overflow-hidden bg-cream py-8 md:py-12">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-gold/10" />
        <div className="container-app relative">
          {!loading && !error && toppers.length > 0 && <div className="mb-7 flex flex-wrap items-center justify-between gap-4" role="group" aria-label="Filter toppers by year">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-dark">Hall of fame</p><p className="mt-1 text-sm text-muted">{toppers.length} achiever{toppers.length === 1 ? "" : "s"} recognised</p></div>
            <div className="flex flex-wrap gap-2">
              {years.map((y) => <button key={y} onClick={() => setYear(y)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${year === y ? "border-navy bg-navy text-white" : "border-navy/20 bg-white text-navy hover:border-navy"}`}>{y}</button>)}
            </div>
          </div>}

          {loading && <div className="flex items-center justify-center gap-3 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading toppers...</div>}
          {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
          {!loading && !error && toppers.length === 0 && <p className="py-16 text-center text-muted">No toppers have been published yet.</p>}
          {!loading && !error && toppers.length > 0 && filtered.length === 0 && <p className="py-16 text-center text-muted">No toppers found for {year}.</p>}

          {!loading && !error && filtered.length > 0 && <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((topper, index) => {
              const image = resolveImageUrl(topper.image);
              return <article key={topper.id} className="topper-reveal group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_12px_rgba(11,37,69,0.08)] transition duration-300 hover:shadow-[0_8px_20px_rgba(11,37,69,0.12)]" style={{ animationDelay: `${index * 40}ms` }}>
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                  {image ? <img src={image} alt={topper.name} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center bg-slate-200"><GraduationCap size={40} className="text-slate-400" strokeWidth={1.1} /></div>}
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-bold text-navy text-sm leading-tight mb-1">{topper.name}</h3>
                  <p className="text-xs text-slate-500">Class {topper.className || "-"} · {topper.year || "2025"}</p>
                </div>
              </article>;
            })}
          </div>
          }
        </div>
      </section>
    </div>
  );
}
