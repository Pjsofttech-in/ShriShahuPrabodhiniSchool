import React, { useEffect, useState } from "react";
import { BookOpen, GraduationCap, ImageOff, LoaderCircle } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { API_BASE_URL } from "../utils/api.js";
import { fetchFaculties } from "../services/backendService.js";

function imageUrl(image) {
  if (!image) return "";
  return /^(https?:|data:|blob:)/i.test(image) ? image : `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

export default function Faculties() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchFaculties().then((items) => active && setFaculties(items)).catch(() => active && setError("Faculty information is temporarily unavailable.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return <div><PageHeader title="Our Faculty" crumb="Faculty" /><section className="bg-cream py-8 md:py-12"><div className="container-app">
    {loading && <div className="flex justify-center gap-3 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading faculty...</div>}
    {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
    {!loading && !error && faculties.length === 0 && <p className="py-16 text-center text-muted">No faculty profiles have been published yet.</p>}
    {!loading && !error && faculties.length > 0 && <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{faculties.map((faculty, index) => { const image = imageUrl(faculty.image); return <article key={faculty.id} className="content-reveal group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_12px_rgba(11,37,69,0.08)] transition duration-300 hover:shadow-[0_8px_20px_rgba(11,37,69,0.12)]" style={{ animationDelay: `${index * 40}ms` }}><div className="relative aspect-[3/4] overflow-hidden bg-slate-100">{image ? <img src={image} alt={faculty.name} className="w-full h-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center bg-slate-200"><ImageOff className="text-slate-400" size={30} /><span className="text-xs text-slate-500 mt-1">No photo</span></div>}</div><div className="p-3 text-center"><h2 className="font-bold text-navy text-sm mb-1">{faculty.name}</h2>{faculty.subject && <p className="text-xs text-slate-500">{faculty.subject}</p>}</div></article>; })}</div>}
  </div></section></div>;
}
