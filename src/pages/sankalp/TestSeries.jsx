import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ImageOff, LoaderCircle, Share2, Sparkles } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchTestSeries, fetchTestSeriesCategories } from "../../services/backendService.js";
import { API_BASE_URL } from "../../utils/api.js";

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
      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.45),_transparent_38%),linear-gradient(135deg,#dbeafe_0%,#93c5fd_48%,#1d4ed8_100%)] text-white">
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
    ...(Array.isArray(series?.features) ? series.features : []),
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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedFeatures, setExpandedFeatures] = useState(() => new Set());

  useEffect(() => {
    Promise.all([fetchTestSeries(), fetchTestSeriesCategories()])
      .then(([items, loadedCategories]) => {
        setSeries(items);
        setCategories(loadedCategories);
      })
      .catch((requestError) => {
        const status = requestError?.response?.status;
        const message = requestError?.response?.data?.message || requestError?.response?.data?.error;
        setError(message || (status ? `Test series API failed (${status}).` : "Test series are temporarily unavailable."));
      })
      .finally(() => setLoading(false));
  }, []);

  const filters = useMemo(() => {
    const liveCategories = categories.length
      ? categories.map((category) => category.name)
      : series.map((item) => item.category).filter(Boolean);
    return ["All", ...new Set(liveCategories)];
  }, [categories, series]);

  const filteredSeries = useMemo(() => {
    const query = activeFilter.toLowerCase();

    return series.filter((item) => {
      const haystack = [item.title, item.subject, item.description].join(" ").toLowerCase();
      if (query === "all") return true;
      const category = categories.find((item) => item.name.toLowerCase() === query);
      if (!category) return String(item.category || "").toLowerCase() === query;
      return String(item.categoryId) === String(category.id) || String(item.category || "").toLowerCase() === query;
    });
  }, [series, categories, activeFilter]);

  function toggleFeatures(id) {
    setExpandedFeatures((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Sankalp Test Series" crumb="Test Series" compact />

      <div className="mt-6 border-b border-[#f2c39d] bg-white py-3 shadow-[0_8px_22px_rgba(237,90,0,0.08)] md:mt-8">
        <div className="container-app flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#fff0df] text-[#e86516] ring-1 ring-[#f3bd63] shadow-[0_6px_14px_rgba(232,101,22,0.16)]"
                    : "text-slate-600 hover:-translate-y-0.5 hover:bg-[#fff0df] hover:text-[#e86516]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <section className="bg-white pb-10 pt-5 md:pb-14 md:pt-7">
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
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredSeries.map((item) => {
                const safeTitle = item.title || "Test Series";
                const badge = item.subject || "Test Series";
                const price = priceLabel(item);
                const features = featureList(item);
                const showFeatures = expandedFeatures.has(item.id);

                return (
                  <article
                    key={item.id}
                    className="content-reveal group flex h-full flex-col overflow-hidden rounded-[18px] border border-[#ffd8b5] bg-[linear-gradient(180deg,#fff7ed_0%,#fffdf8_100%)] shadow-[0_10px_24px_rgba(15,35,82,0.10)] transition duration-500 hover:-translate-y-2 hover:border-[#ff9a4d] hover:shadow-[0_22px_42px_rgba(237,90,0,0.18)]"
                    style={{ animationDelay: `${filteredSeries.indexOf(item) * 65}ms` }}
                  >
                    <div className="relative overflow-hidden border-b border-[#ffead8] bg-[#fff0df]">
                      <div className="relative aspect-[1.72] overflow-hidden bg-[#fff7ed] p-2">
                        <SeriesImage src={item.image} alt={safeTitle} className="object-cover transition duration-700 group-hover:scale-105" />
                        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-navy-dark/75 to-transparent p-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-[#f6a23a] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                            <Sparkles size={10} />
                            LIVE
                          </span>
                          <button type="button" className="rounded-full border border-white/30 bg-[#173b5f]/65 p-1.5 text-white transition hover:bg-[#e86516]" aria-label={`Share ${safeTitle}`}>
                            <Share2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b65318]">{badge}</p>
                            <h2 className="mt-1 line-clamp-2 text-[1rem] font-black leading-[1.25] text-[#e86516]">{safeTitle}</h2>
                          </div>
                          <span className="shrink-0 rounded-full bg-[#f6a23a] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white shadow-sm">{badge}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-[#fed7aa] bg-white px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <button type="button" onClick={() => toggleFeatures(item.id)} className="flex items-center gap-2 text-sm font-semibold text-[#334e68] transition hover:text-[#e86516]" aria-expanded={showFeatures}>
                          <span>Features</span>
                          <ChevronDown size={15} className={`text-slate-500 transition-transform ${showFeatures ? "rotate-180" : ""}`} />
                        </button>
                        <span className="rounded-full bg-gradient-to-r from-[#ff8c1a] to-[#ff6a00] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-sm">
                          {price}
                        </span>
                      </div>

                      {showFeatures && <div className="mt-3 space-y-2 border-t border-[#ffead8] pt-3 text-[11px] text-[#70402b]">{features.map((feature) => <div key={feature} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" /><span className="truncate">{feature}</span></div>)}</div>}

                      <Link
                        to={`/sankalp/test-series/${item.id}`}
                          className="mt-3 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#ff8c1a] to-[#ed4b00] px-3 py-2.5 text-xs font-bold uppercase tracking-[0.05em] text-white shadow-[0_8px_16px_rgba(237,90,0,0.25)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_22px_rgba(237,90,0,0.32)]"
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
