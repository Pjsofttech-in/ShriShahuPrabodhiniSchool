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

          {!loading && !error && filtered.length > 0 && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((topper, index) => {
              const image = resolveImageUrl(topper.image);
              return <article key={topper.id} className="topper-reveal group overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(11,37,69,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(11,37,69,0.12)]" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="relative h-[18rem] overflow-hidden bg-navy-light sm:h-[20rem]">
                  {image ? <img src={image} alt={topper.name} className="img-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-navy"><GraduationCap size={64} className="text-gold" strokeWidth={1.1} /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 pt-12"><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-light">{topper.year || "Sankalp Exam"}</p><h3 className="mt-1 text-xl font-bold text-white">{topper.name}</h3></div>
                  {topper.rank && <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-navy"><Medal size={14} /> Rank {topper.rank}</span>}
                </div>
                <div className="p-5">
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border-l-4 border-gold bg-cream px-3 py-2"><p className="text-[11px] uppercase tracking-[0.12em] text-muted">Total marks</p><p className="mt-1 text-lg font-bold text-navy">{topper.score || "-"}</p></div>
                    <div className="rounded-2xl border-l-4 border-maroon bg-cream px-3 py-2"><p className="text-[11px] uppercase tracking-[0.12em] text-muted">Class</p><p className="mt-1 text-lg font-bold text-navy">{topper.className || topper.post || "-"}</p></div>
                  </div>
                  {topper.post && topper.className && <p className="flex items-center gap-2 text-sm text-muted"><Crown size={16} className="text-gold-dark" /> {topper.post}</p>}
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
