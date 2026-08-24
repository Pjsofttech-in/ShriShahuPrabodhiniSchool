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
    {!loading && !error && faculties.length > 0 && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{faculties.map((faculty, index) => { const image = imageUrl(faculty.image); return <article key={faculty.id} className="content-reveal group overflow-hidden bg-white shadow-[0_8px_30px_rgba(11,37,69,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: `${index * 80}ms` }}><div className="relative h-56 bg-navy-light">{image ? <img src={image} alt={faculty.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full flex-col items-center justify-center gap-2 bg-navy text-white/80"><ImageOff className="text-gold" size={34} /><span className="text-sm">Image not available</span></div>}</div><div className="p-5"><h2 className="text-xl font-bold text-navy">{faculty.name}</h2>{faculty.subject && <p className="mt-1 font-semibold text-gold-dark">{faculty.subject}</p>}<div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-muted">{faculty.experience && <p className="flex items-center gap-2"><GraduationCap size={16} className="text-gold-dark" /> {faculty.experience} years experience</p>}{faculty.education && <p className="flex items-center gap-2"><BookOpen size={16} className="text-gold-dark" /> {faculty.education}</p>}{faculty.description && <p className="pt-1 leading-6">{faculty.description}</p>}</div></div></article>; })}</div>}
  </div></section></div>;
}
