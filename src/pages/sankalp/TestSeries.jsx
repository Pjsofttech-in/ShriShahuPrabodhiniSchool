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

  const base = API_BASE_URL.replace(/\/+$/, "");
  // Trim any leading slashes from the provided value
  let path = value.replace(/^\/+/, "");

  // If base ends with '/api' and path also begins with 'api/', remove duplicate 'api' segment
  if (/\/api$/i.test(base) && /^api\//i.test(path)) {
    path = path.replace(/^api\//i, "");
    return `${base}/${path}`;
  }

  // If the original value started with a slash keep that structure (base + '/...')
  if (value.startsWith("/")) return `${base}${value}`;

  return `${base}/${path}`;
}

function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function SeriesImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,237,213,0.24),_transparent_38%),linear-gradient(135deg,#c2410c_0%,#ea580c_45%,#9a3412_100%)] text-white">
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
      .catch((requestError) => {
        const status = requestError?.response?.status;
        const message = requestError?.response?.data?.message || requestError?.response?.data?.error;
        setError(message || (status ? `Test series API failed (${status}).` : "Test series are temporarily unavailable."));
      })
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
    <div className="min-h-screen bg-white">
      <PageHeader title="Sankalp Test Series" crumb="Test Series" compact />

      <div className="border-b border-[#fed7aa] bg-white py-3 shadow-sm">
        <div className="container-app flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#ff6d00] text-white ring-1 ring-[#ff6d00] shadow-[0_6px_14px_rgba(255,109,0,0.25)]"
                    : "text-slate-600 hover:bg-[#fff0e3] hover:text-[#e85d00]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <section className="bg-white pb-10 pt-4 md:pb-12 md:pt-5">
        <div className="container-app">
          {loading && (
            <div className="flex justify-center gap-2 py-20 text-slate-600">
              <LoaderCircle className="animate-spin text-[#ff6d00]" />
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
                    className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#ffd8b5] bg-white shadow-[0_14px_32px_rgba(15,35,82,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#ff9a4d] hover:shadow-[0_18px_40px_rgba(255,109,0,0.16)]"
                  >
                    <div className="relative overflow-hidden border-b border-[#ffead8] bg-[radial-gradient(circle_at_top,_rgba(255,237,213,0.9),_transparent_34%),linear-gradient(135deg,#fff7ed_0%,#ffffff_58%,#fffaf5_100%)] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ffb36b] bg-[#fff0e3] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#9a3412]">
                          <Sparkles size={10} className="text-[#ed6a00]" />
                          LIVE
                        </span>
                        <button type="button" className="rounded-full bg-[#fff0e3] p-1.5 text-[#c2410c] transition hover:bg-[#ffdfc2]" aria-label={`Share ${safeTitle}`}>
                          <Share2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/5 shadow-inner">
                          <SeriesImage src={item.image} alt={safeTitle} className="object-cover" />
                        </div>

                        <div className="min-w-0 flex-1 text-white">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c2410c]">{badge}</p>
                          <h2 className="mt-2 line-clamp-3 text-[1.08rem] font-black leading-[1.25] text-[#4a2416]">{safeTitle}</h2>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-[11px] text-[#70402b]">
                        {features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#ff8a1f]" />
                            <span className="truncate">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto border-t border-[#fed7aa] bg-white px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#7c2d12]">
                          <span>Features</span>
                          <ChevronDown size={15} className="text-slate-500" />
                        </div>
                        <span className="rounded-full bg-gradient-to-r from-[#ff8c1a] to-[#ff6a00] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm">
                          {price}
                        </span>
                      </div>

                      <Link
                        to={`/sankalp/test-series/${item.id}`}
                          className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff8c1a] to-[#ed4b00] px-3 py-3 text-xs font-bold uppercase tracking-[0.05em] text-white shadow-[0_10px_18px_rgba(255,109,0,0.25)] transition hover:brightness-110"
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
