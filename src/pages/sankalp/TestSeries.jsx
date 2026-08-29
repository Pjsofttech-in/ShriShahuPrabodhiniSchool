import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ImageOff, LoaderCircle, Share2, Sparkles } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchTestSeries } from "../../services/backendService.js";
import { API_BASE_URL } from "../../utils/api.js";

const FILTERS = ["All", "VN Trophy", "Free Test", "Test Series"];

function imageUrl(image) {
  if (!image) return "";

  const value = String(image).trim();
  if (!value) return "";

  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `${API_BASE_URL.replace(/\/+$/, "")}${value}`;

  return `${API_BASE_URL.replace(/\/+$/, "")}/${value.replace(/^\/+/, "")}`;
}

function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function SeriesImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_38%),linear-gradient(135deg,#0d1f3d_0%,#112d59_45%,#0a1634_100%)] text-white">
        <div className="flex flex-col items-center gap-2 text-center">
          <ImageOff size={28} className="text-white/75" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl(src)}
      alt={alt}
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover object-center ${className}`}
    />
  );
}

function priceLabel(series) {
  const rawPrice = series?.sellingPrice ?? series?.price ?? null;
  if (rawPrice !== null && Number(rawPrice) > 0) return `₹ ${Number(rawPrice).toLocaleString("en-IN")}`;
  if (series?.sellingPrice === 0 || series?.price === 0) return "FREE";
  return "FREE";
}

function featureList(series) {
  const features = [
    series?.featureOne,
    series?.featureTwo,
    series?.featureThree,
    series?.description,
  ]
    .map((value) => stripHtml(value))
    .filter(Boolean)
    .slice(0, 3);

  return features.length ? features : ["Live ranking", "Performance analytics", "Exam practice"];
}

export default function TestSeries() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchTestSeries()
      .then((items) => setSeries(items))
      .catch(() => setError("Test series are temporarily unavailable."))
      .finally(() => setLoading(false));
  }, []);

  const filteredSeries = useMemo(() => {
    const query = activeFilter.toLowerCase();

    return series.filter((item) => {
      const haystack = [item.title, item.subject, item.description].join(" ").toLowerCase();
      if (query === "all") return true;
      if (query === "vn trophy") return haystack.includes("vn trophy") || haystack.includes("trophy");
      if (query === "free test") return Number(item.sellingPrice ?? item.price ?? 0) === 0 || haystack.includes("free");
      if (query === "test series") return true;
      return haystack.includes(query);
    });
  }, [series, activeFilter]);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <PageHeader title="Sankalp Test Series" crumb="Test Series" />

      <div className="border-b border-[#e3edf8] bg-white py-4 shadow-sm">
        <div className="container-app flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-md px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#edf4ff] text-[#123d7d] ring-1 ring-[#cfe2ff] shadow-sm"
                    : "text-slate-600 hover:bg-[#edf4ff] hover:text-[#123d7d]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <section className="py-8 md:py-10">
        <div className="container-app">
          {loading && (
            <div className="flex justify-center gap-2 py-20 text-slate-600">
              <LoaderCircle className="animate-spin text-[#0b3c8b]" />
              Loading test series...
            </div>
          )}

          {!loading && error && <div className="py-20 text-center text-red-600">{error}</div>}

          {!loading && !error && filteredSeries.length === 0 && (
            <div className="py-20 text-center text-slate-600">No test series available right now.</div>
          )}

          {!loading && !error && filteredSeries.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {filteredSeries.map((item) => {
                const safeTitle = item.title || "Test Series";
                const badge = item.subject || "Test Series";
                const price = priceLabel(item);
                const features = featureList(item);

                return (
                  <article
                    key={item.id}
                    className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#dfeaf8] bg-white shadow-[0_14px_32px_rgba(15,35,82,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,35,82,0.12)]"
                  >
                    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.10),_transparent_30%),linear-gradient(135deg,#091d3d_0%,#0f2f62_38%,#0b244c_100%)] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                          <Sparkles size={10} className="text-[#ffb266]" />
                          LIVE
                        </span>
                        <button type="button" className="rounded-full bg-white/10 p-1.5 text-white/80 transition hover:bg-white/20" aria-label={`Share ${safeTitle}`}>
                          <Share2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/5 shadow-inner">
                          <SeriesImage src={item.image} alt={safeTitle} className="object-cover" />
                        </div>

                        <div className="min-w-0 flex-1 text-white">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#bfe0ff]">{badge}</p>
                          <h2 className="mt-2 line-clamp-3 text-[1.08rem] font-black leading-[1.25] text-white">{safeTitle}</h2>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-[11px] text-white/90">
                        {features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#ff9f43]" />
                            <span className="truncate">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto border-t border-[#edf3fb] bg-white px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0d2340]">
                          <span>Features</span>
                          <ChevronDown size={15} className="text-slate-500" />
                        </div>
                        <span className="rounded-full bg-gradient-to-r from-[#ff8c1a] to-[#ff6a00] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm">
                          {price}
                        </span>
                      </div>

                      <Link
                        to={`/sankalp/test-series/${item.id}`}
                        className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#1d5dc8] to-[#0d47b1] px-3 py-3 text-xs font-bold uppercase tracking-[0.05em] text-white shadow-[0_10px_18px_rgba(13,71,177,0.25)] transition hover:brightness-110"
                      >
                        View Test Papers
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
