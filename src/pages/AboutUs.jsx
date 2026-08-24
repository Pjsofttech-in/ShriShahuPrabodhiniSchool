import React, { useEffect, useState } from "react";
import { BookOpen, ImageOff, LoaderCircle, MapPin, Users } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { API_BASE_URL } from "../utils/api.js";
import { fetchAboutUs } from "../services/backendService.js";

function imageUrl(image) {
  if (!image) return "";
  return /^(https?:|data:|blob:)/i.test(image) ? image : `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

export default function AboutUs() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; fetchAboutUs().then((items) => active && setAbout(items[0] || null)).catch(() => active && setError("About information is temporarily unavailable.")).finally(() => active && setLoading(false)); return () => { active = false; }; }, []);
  const stats = about ? [[about.years, "Years of excellence", BookOpen], [about.centers, "Exam centres", MapPin], [about.faculties, "Expert faculty", Users], [about.students, "Students reached", Users]] : [];

  return <div><PageHeader title="About Us" crumb="About Us" /><section className="bg-cream py-8 md:py-12"><div className="container-app">
    {loading && <div className="flex justify-center gap-3 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading about information...</div>}
    {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
    {!loading && !error && !about && <p className="py-16 text-center text-muted">About information has not been published yet.</p>}
    {!loading && !error && about && <><div className="grid items-center gap-8 md:grid-cols-[0.9fr_1.1fr]"><div className="relative min-h-[260px] overflow-hidden bg-navy shadow-xl">{about.image ? <img src={imageUrl(about.image)} alt={about.title} className="h-full min-h-[260px] w-full object-cover" /> : <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-white/80"><ImageOff className="text-gold" size={42} /><span>Image not available</span></div>}</div><div><span className="eyebrow">Our story</span><h2 className="text-3xl font-bold leading-tight text-navy md:text-4xl">{about.title}</h2><p className="mt-5 whitespace-pre-line leading-7 text-muted">{about.description || "No description available."}</p></div></div><div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">{stats.map(([value, label, Icon]) => <div key={label} className="content-reveal border-l-4 border-gold bg-white p-4 shadow-sm"><Icon size={19} className="text-gold-dark" /><p className="mt-3 text-2xl font-bold text-navy">{value || "-"}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p></div>)}</div></>}
  </div></section></div>;
}
