import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown, Eye, FileText, LoaderCircle, Search, Share2, X } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchEbookCategories, fetchEbookMaterials, fetchEbookSubcategories } from "../../services/backendService.js";
import { API_BASE_URL } from "../../utils/api.js";

function mediaUrl(value) {
  if (!value) return "";
  const source = String(value).trim();
  if (/^(https?:|data:|blob:)/i.test(source)) return source;
  const origin = API_BASE_URL.replace(/\/api(?:\/.*)?$/i, "").replace(/\/+$/g, "");
  return `${origin}/${source.replace(/^\/+/, "")}`;
}

function firstValue(item, keys, fallback = "") {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && item[key] !== "") return item[key];
  }
  return fallback;
}

function normaliseMaterial(item) {
  const subcategory = item?.vmSubcategory ?? item?.subcategory ?? {};
  const category = item?.category ?? subcategory?.vmCategory ?? {};
  const status = String(firstValue(item, ["status"], "free")).toLowerCase();
  return {
    id: item?.id,
    title: firstValue(item, ["chapterName", "materialName", "title"], "Untitled material"),
    materialType: firstValue(item, ["materialtype", "materialType", "materialTypeName"], "Ebook"),
    categoryName: firstValue(item, ["categoryName"], firstValue(category, ["categoryName", "name"], "")),
    categoryId: item?.categoryId ?? category?.id ?? category?.categoryId ?? "",
    subcategoryName: firstValue(item, ["subcategoryName"], firstValue(subcategory, ["subcategoryName", "name"], "")),
    subcategoryId: item?.subcategoryId ?? subcategory?.id ?? "",
    description: firstValue(item, ["discription", "description"], ""),
    thumbnail: firstValue(item, ["thumbnailFile", "thumbnail", "image", "imageUrl"], ""),
    demoPdf: firstValue(item, ["demoPdf", "demoFile", "demoUrl"], ""),
    pdfFile: firstValue(item, ["pdfFile", "fileUrl", "pdf"], ""),
    status,
    mrp: Number(item?.mrp ?? 0),
    price: Number(item?.price ?? 0),
    validity: item?.validity ?? "",
    downloadButton: item?.downloadButton === true,
  };
}

function Cover({ material }) {
  const [failed, setFailed] = useState(false);
  if (!material.thumbnail || failed) {
    return (
      <div className="flex h-full min-h-48 items-center justify-center bg-[linear-gradient(135deg,#082f49,#0f766e)] p-5 text-center text-white">
        <div><BookOpen className="mx-auto mb-3 opacity-80" size={38} /><span className="text-xs font-bold uppercase tracking-[0.2em]">{material.materialType}</span></div>
      </div>
    );
  }
  return <img src={mediaUrl(material.thumbnail)} alt={material.title} onError={() => setFailed(true)} className="h-full min-h-48 w-full object-cover" />;
}

export default function Ebook() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    Promise.all([fetchEbookMaterials(), fetchEbookCategories(), fetchEbookSubcategories()])
      .then(([loadedMaterials, loadedCategories, loadedSubcategories]) => {
        setMaterials(loadedMaterials.map(normaliseMaterial).filter((item) => item.id != null));
        setCategories(loadedCategories);
        setSubcategories(loadedSubcategories);
      })
      .catch((requestError) => {
        const message = requestError?.response?.data?.message || requestError?.response?.data?.error;
        setError(message || "Ebooks are temporarily unavailable.");
      })
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => ["All", ...new Set(materials.map((item) => item.materialType).filter(Boolean))], [materials]);
  const categoryOptions = useMemo(() => {
    const names = categories.map((item) => item.categoryName ?? item.name).filter(Boolean);
    return ["All", ...new Set(names.length ? names : materials.map((item) => item.categoryName).filter(Boolean))];
  }, [categories, materials]);
  const subcategoryOptions = useMemo(() => {
    const names = subcategories.map((item) => item.subcategoryName ?? item.name).filter(Boolean);
    return ["All", ...new Set(names.length ? names : materials.map((item) => item.subcategoryName).filter(Boolean))];
  }, [subcategories, materials]);

  const filteredMaterials = useMemo(() => {
    const text = query.trim().toLowerCase();
    return materials.filter((item) => {
      const searchable = [item.title, item.materialType, item.categoryName, item.subcategoryName, item.description].join(" ").toLowerCase();
      return (!text || searchable.includes(text)) && (type === "All" || item.materialType === type) && (category === "All" || item.categoryName === category) && (subcategory === "All" || item.subcategoryName === subcategory);
    });
  }, [materials, query, type, category, subcategory]);

  function resetFilters() {
    setQuery("");
    setType("All");
    setCategory("All");
    setSubcategory("All");
  }

  return (
    <div className="min-h-screen bg-[#f5f9fc]">
      <PageHeader title="Ebooks" crumb="Sankalp" />
      <section className="border-b border-slate-200 bg-white py-7 md:py-9">
        <div className="container-app">
          {/* <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow !text-gold-dark">Shri Shahu Prabodhini</span>
            <p className="mt-3 text-sm text-muted">Explore study material and preparation resources from our live library.</p>
          </div> */}
          <div className="mx-auto mt-7 grid max-w-5xl gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-500 focus-within:border-blue-500">
              <Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Subject..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </label>
            {[["Material Type", type, setType, types], ["Category", category, setCategory, categoryOptions], ["Subcategory", subcategory, setSubcategory, subcategoryOptions]].map(([label, value, setter, options]) => (
              <label key={label} className="relative flex items-center rounded-lg border border-slate-300 bg-white">
                <span className="sr-only">{label}</span><select value={value} onChange={(event) => setter(event.target.value)} className="w-full appearance-none bg-transparent px-3 py-2.5 text-sm text-slate-600 outline-none"><option value="All">{label}</option>{options.filter((option) => option !== "All").map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-3 text-slate-400" />
              </label>
            ))}
          </div>
        </div>
      </section>

      <main className="container-app py-8 md:py-10">
        {loading && <div className="flex justify-center gap-2 py-20 text-muted"><LoaderCircle className="animate-spin" /> Loading ebooks...</div>}
        {!loading && error && <div className="py-20 text-center text-red-600">{error}</div>}
        {!loading && !error && filteredMaterials.length === 0 && <div className="py-20 text-center text-muted">No ebooks found. <button type="button" onClick={resetFilters} className="font-semibold text-blue-700 underline">Clear filters</button></div>}
        {!loading && !error && filteredMaterials.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredMaterials.map((material) => {
          const isFree = material.status === "free" || material.price <= 0;
          const demoUrl = mediaUrl(material.demoPdf);
          const viewUrl = mediaUrl(isFree ? material.pdfFile : material.downloadButton ? material.pdfFile : "");
          return <article key={material.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_8px_25px_rgba(15,35,82,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,35,82,0.14)]">
            <div className="relative aspect-[1.42] overflow-hidden bg-slate-100"><Cover material={material} />{isFree && <span className="absolute left-3 top-3 rounded-full bg-green-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white">Free</span>}</div>
            <div className="flex flex-1 flex-col bg-gradient-to-b from-blue-50 to-emerald-50 p-4">
              <div className="flex items-start justify-between gap-2"><h2 className="line-clamp-2 text-base font-semibold leading-5 text-blue-700">{material.title}</h2><button type="button" onClick={() => navigator.share?.({ title: material.title, url: window.location.href })} className="shrink-0 text-slate-500 hover:text-blue-700" title="Share ebook" aria-label={`Share ${material.title}`}><Share2 size={17} /></button></div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"><span>{material.materialType}</span>{material.subcategoryName && <><span>•</span><span>{material.subcategoryName}</span></>}</div>
              <div className="mt-auto pt-4"><div className="mb-3 flex items-center gap-2 text-xs"><span className="text-slate-500 line-through">{material.mrp > 0 ? `₹${material.mrp}` : ""}</span><span className="font-bold text-blue-700">{isFree ? "FREE" : `₹${material.price}`}</span></div><div className="grid grid-cols-3 gap-1.5"><a href={demoUrl || undefined} target="_blank" rel="noreferrer" className={`rounded-md border px-1 py-2 text-center text-[11px] font-semibold ${demoUrl ? "border-blue-300 bg-white text-blue-700 hover:bg-blue-50" : "pointer-events-none border-slate-200 bg-slate-100 text-slate-400"}`}><Eye size={13} className="mr-0.5 inline" />Demo</a><button type="button" onClick={() => setDetails(material)} className="rounded-md border border-blue-300 bg-white px-1 py-2 text-[11px] font-semibold text-blue-700 hover:bg-blue-50"><FileText size={13} className="mr-0.5 inline" />Details</button><a href={viewUrl || undefined} target="_blank" rel="noreferrer" className={`rounded-md px-1 py-2 text-center text-[11px] font-semibold ${viewUrl ? "bg-blue-600 text-white hover:bg-blue-700" : "pointer-events-none bg-slate-200 text-slate-400"}`}>{isFree ? "View" : "Buy"}</a></div></div>
            </div>
          </article>;
        })}</div>}
      </main>

      {details && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true"><div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-500">{details.materialType}</p><h2 className="mt-1 text-xl font-bold text-navy">{details.title}</h2></div><button type="button" onClick={() => setDetails(null)} aria-label="Close details" className="rounded-full p-1 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div><dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Category</dt><dd className="font-semibold">{details.categoryName || "—"}</dd></div><div><dt className="text-slate-500">Subcategory</dt><dd className="font-semibold">{details.subcategoryName || "—"}</dd></div><div><dt className="text-slate-500">Price</dt><dd className="font-semibold">{details.price > 0 ? `₹${details.price}` : "FREE"}</dd></div><div><dt className="text-slate-500">Validity</dt><dd className="font-semibold">{details.validity || "—"}</dd></div></dl><p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">{details.description || "No description available."}</p><div className="mt-6 flex justify-end"><a href={mediaUrl(details.demoPdf || (details.status === "free" ? details.pdfFile : ""))} target="_blank" rel="noreferrer" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Open Material</a></div></div></div>}
    </div>
  );
}
