import React, { useEffect, useState } from "react";
import { ArrowUpRight, Crown, GraduationCap, LoaderCircle, Medal, Sparkles, Trophy } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { API_BASE_URL } from "../utils/api.js";
import { fetchToppers } from "../services/backendService.js";

function resolveImageUrl(image) {
  if (!image) return "";

  if (/^(https?:|data:|blob:)/i.test(image)) {
    return image;
  }

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
      .then((items) => {
        if (active) {
          setToppers(
            items.sort(
              (first, second) =>
                Number(second.year) - Number(first.year)
            )
          );
        }
      })
      .catch(() => {
        if (active) {
          setError(
            "Toppers are temporarily unavailable. Please check back soon."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const years = [
    "All",
    ...new Set(
      toppers.map((topper) => topper.year).filter(Boolean)
    ),
  ];

  const filtered =
    year === "All"
      ? toppers
      : toppers.filter((topper) => topper.year === year);

  return (
    <div>
      <PageHeader title="Sankalp Exam Toppers" compact crumb="Toppers" />

      <section className="relative overflow-hidden bg-[#f7f8fa] py-8 md:py-12">
        <div className="pointer-events-none absolute -left-24 top-8 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-48 h-80 w-80 rounded-full bg-[#dce9f3] blur-3xl" />

        <div className="container-app relative">
          {!loading && !error && toppers.length > 0 && (
            <div
              className="mb-7 flex flex-wrap items-center justify-between gap-4"
              role="group"
              aria-label="Filter toppers by year"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-navy"><Trophy size={18} className="text-gold-dark" /> Top performers</div>
              <div className="flex flex-wrap justify-center gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setYear(y)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                      year === y
                        ? "border-navy bg-navy text-white shadow-[0_8px_18px_rgba(23,59,95,0.18)]"
                        : "border-[#dce2e8] bg-white text-navy hover:border-gold hover:shadow-sm"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-3 py-20 text-muted">
              <LoaderCircle className="animate-spin text-gold" size={24} />
              Loading toppers...
            </div>
          )}

          {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
          {!loading && !error && toppers.length === 0 && (
            <p className="py-16 text-center text-muted">No toppers have been published yet.</p>
          )}
          {!loading && !error && toppers.length > 0 && filtered.length === 0 && (
            <p className="py-16 text-center text-muted">No toppers found for {year}.</p>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((topper, index) => {
                const image = resolveImageUrl(topper.image);
                const rank = topper.rank || index + 1;
                const isFeatured = index === 0 && year === "All";

                return (
                  <article
                    key={topper.id}
                    className={`topper-reveal group relative mx-auto w-full overflow-hidden rounded-[24px] border bg-white shadow-[0_10px_28px_rgba(23,59,95,0.10)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_42px_rgba(23,59,95,0.18)] ${isFeatured ? "border-gold/70 ring-2 ring-gold/20 lg:col-span-2 lg:row-span-2" : "border-[#e4e8ed]"}`}
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="relative p-0">
                      <div className={`aspect-[4/3.5] overflow-hidden bg-[#eef2f5] ${isFeatured ? "lg:aspect-[4/3]" : ""}`}>
                        {image ? (
                          <img
                            src={image}
                            alt={topper.name}
                            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-200">
                            <GraduationCap size={44} className="text-slate-400" strokeWidth={1.1} />
                          </div>
                        )}
                      </div>
                      <div className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-bold text-navy shadow-lg backdrop-blur-sm ${isFeatured ? "text-sm" : ""}`}>
                        {Number(rank) === 1 ? <Crown size={14} className="text-gold-dark" /> : <Medal size={14} className="text-gold-dark" />}
                        Rank #{rank}
                      </div>
                      {isFeatured && <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-navy shadow-lg"><Sparkles size={13} /> Featured achiever</div>}
                    </div>

                    <div className="border-t border-[#edf0f3] px-4 pb-5 pt-4 text-center">
                      <h3 className={`font-display font-bold leading-tight text-navy ${isFeatured ? "text-xl md:text-2xl" : "text-base"}`}>
                        {topper.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Class {topper.className || "-"} · {topper.year || "2025"}
                      </p>
                      {(topper.score || topper.post) && <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-muted">
                        {topper.score && <span className="rounded-full bg-[#f7f1df] px-3 py-1.5 text-gold-dark">Score: {topper.score}</span>}
                        {topper.post && <span className="rounded-full bg-[#edf3f8] px-3 py-1.5 text-navy">{topper.post}</span>}
                      </div>}
                      <div className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-gold-dark opacity-0 transition group-hover:opacity-100">View achievement <ArrowUpRight size={14} /></div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && toppers.length > 0 && (
            <div className="relative mt-10 grid gap-8 overflow-hidden rounded-[30px] border border-[#35484a] bg-[linear-gradient(120deg,#17282d_0%,#22383a_58%,#3b3025_100%)] p-6 text-white shadow-[0_24px_55px_rgba(21,38,42,0.22)] sm:p-8 md:grid-cols-[1.2fr_0.8fr] md:p-10">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[24px] border-[#f3bd63]/10" />
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f3bd63]/45 bg-[#f3bd63]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffd98d]"><Sparkles size={13} /> Hall of fame</div>
                <h2 className="max-w-xl font-display text-3xl font-bold leading-[1.08] tracking-normal text-[#fffaf0] sm:text-4xl md:text-5xl">Celebrating the minds that <span className="text-[#f3bd63]">rise higher.</span></h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-[#d8e2df] md:text-base">Meet the students who turned preparation into performance through the Sankalp Scholarship Examination.</p>
              </div>
              <div className="grid grid-cols-3 items-end gap-3 border-t border-white/15 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <div><p className="font-display text-3xl font-bold text-[#f3bd63] sm:text-4xl">{toppers.length}</p><p className="mt-1 text-[11px] leading-4 text-[#c4d0cc] sm:text-xs">Top achievers</p></div>
                <div><p className="font-display text-3xl font-bold text-[#f3bd63] sm:text-4xl">{years.length - 1}</p><p className="mt-1 text-[11px] leading-4 text-[#c4d0cc] sm:text-xs">Years listed</p></div>
                <div><p className="font-display text-3xl font-bold text-[#f3bd63] sm:text-4xl">{new Set(toppers.map((topper) => topper.className).filter(Boolean)).size}</p><p className="mt-1 text-[11px] leading-4 text-[#c4d0cc] sm:text-xs">Class groups</p></div>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}