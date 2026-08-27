import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LoaderCircle, Share2 } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchTestSeries } from "../../services/backendService.js";
import { API_BASE_URL } from "../../utils/api.js";

function imageUrl(image) {
  if (!image) return "";
  return /^(https?:|data:|blob:)/i.test(image) ? image : `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

function SeriesImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="flex h-full items-center justify-center bg-navy text-sm text-white/70">Image not available</div>;
  return <img src={imageUrl(src)} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover" />;
}

function priceLabel(series) {
  if (series.sellingPrice != null) return `Rs ${series.sellingPrice}`;
  if (series.price != null) return `Rs ${series.price}`;
  return "FREE";
}

export default function TestSeries() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTestSeries().then(setSeries).catch(() => setError("Test series are temporarily unavailable.")).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <PageHeader title="Sankalp Test Series" crumb="Test Series" />
      <div className="border-b border-black/5 bg-white py-4">
        <div className="container-app flex flex-wrap items-center justify-center gap-2">
          {["All", "VN Trophy", "Free Test", "Test Series"].map((filter, index) => (
            <button key={filter} type="button" className={`rounded-md px-4 py-2 text-xs font-semibold ${index === 0 ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100" : "text-muted hover:bg-blue-50 hover:text-blue-600"}`}>
              {filter}
            </button>
          ))}
        </div>
      </div>
      <section className="section-pad pt-8 md:pt-10">
        <div className="container-app">
          {loading && <div className="flex justify-center gap-2 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" /> Loading test series...</div>}
          {!loading && error && <div className="py-20 text-center text-maroon">{error}</div>}
          {!loading && !error && series.length === 0 && <div className="py-20 text-center text-muted">No test series available right now.</div>}
          {!loading && !error && series.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {series.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-blue-50 to-emerald-50 shadow-[0_8px_24px_rgba(30,64,175,0.1)] transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="aspect-[1.8] overflow-hidden border-b border-slate-200"><SeriesImage src={item.image} alt={item.title} /></div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="min-w-0 text-base font-bold leading-6 text-blue-600">{item.title}</h2>
                      <button type="button" className="shrink-0 p-1 text-muted" aria-label={`Share ${item.title}`}><Share2 size={16} /></button>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-muted">
                      <button type="button" className="flex items-center gap-2 text-blue-600">Features <ChevronDown size={15} /></button>
                      <span className="rounded-full bg-orange-400 px-3 py-1 font-bold text-white">{item.subject || "Test Series"}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted line-through">{item.mrp ? `Rs ${item.mrp}` : ""}</span>
                      <span className="font-bold text-green-700">{priceLabel(item)}</span>
                    </div>
                    <Link to={`/sankalp/test-series/${item.id}`} className="mt-3 flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-bold text-white shadow transition hover:bg-blue-700">VIEW TEST PAPERS</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
