import React, { useEffect, useState } from "react";
import { GraduationCap, LoaderCircle } from "lucide-react";
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
      <PageHeader title="Sankalp Exam Toppers" crumb="Toppers" />

      <section className="relative overflow-hidden bg-cream py-10 md:py-14">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-gold/10" />

        <div className="container-app relative">
          {!loading && !error && toppers.length > 0 && (
            <div
              className="mb-40 flex flex-wrap items-center justify-between gap-20"
              role="group"
              aria-label="Filter toppers by year"
            >
              <div className="w-full text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
                  Hall of Fame
                </p>

                <h2 className="mt-2 text-4xl font-black text-navy md:text-5xl">
                  Our <span className="text-gold-dark">Toppers</span>
                </h2>
              </div>

              <div className="mx-auto flex flex-wrap justify-center gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setYear(y)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                      year === y
                        ? "border-navy bg-navy text-white shadow-md"
                        : "border-navy/20 bg-white text-navy hover:border-navy hover:shadow-sm"
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
            <div className="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              {filtered.slice(0, 2).map((topper, index) => {
                const image = resolveImageUrl(topper.image);

                return (
                  <article
                    key={topper.id}
                    className="topper-reveal mx-auto w-full max-w-[22rem] overflow-hidden rounded-[1.25rem] border border-black/5 bg-white shadow-[0_8px_24px_rgba(11,37,69,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(11,37,69,0.12)]"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="p-0">
                      <div className="overflow-hidden bg-[#e9e9e9]">
                        {image ? (
                          <img
                            src={image}
                            alt={topper.name}
                            className="h-[23rem] w-full object-cover object-center"
                          />
                        ) : (
                          <div className="flex h-[23rem] w-full items-center justify-center bg-slate-200">
                            <GraduationCap size={44} className="text-slate-400" strokeWidth={1.1} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-4 text-center">
                      <h3 className="text-[1.05rem] font-bold leading-tight text-navy">
                        {topper.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Class {topper.className || "-"} · {topper.year || "2025"}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="mt-10 flex justify-center">
              <button className="border-2 border-navy bg-transparent px-7 py-3 text-lg font-bold text-navy transition-all duration-300 hover:bg-navy hover:text-white hover:shadow-lg">
                View All Toppers
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}