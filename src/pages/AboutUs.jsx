import React, { useEffect, useState } from "react";
import { BookOpen, ImageOff, LoaderCircle, MapPin, Users } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { API_BASE_URL } from "../utils/api.js";
import { fetchAboutUs } from "../services/backendService.js";

function imageUrl(image) {
  if (!image) return "";
  const value = String(image).trim();
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  const base = API_BASE_URL.replace(/\/+$/, "");
  let path = value.replace(/^\/+/, "");
  if (/\/api$/i.test(base) && /^api\//i.test(path)) {
    path = path.replace(/^api\//i, "");
    return `${base}/${path}`;
  }
  if (value.startsWith("/")) return `${base}${value}`;
  return `${base}/${path}`;
}

export default function AboutUs() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; fetchAboutUs().then((items) => active && setAbout(items[0] || null)).catch(() => active && setError("About information is temporarily unavailable.")).finally(() => active && setLoading(false)); return () => { active = false; }; }, []);
  const stats = about ? [[about.years, "Years of excellence", BookOpen], [about.centers, "Exam centres", MapPin], [about.faculties, "Expert faculty", Users], [about.students, "Students reached", Users]] : [];

  return <div><PageHeader title="About Us" crumb="About Us" /><section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f4f7f6_100%)] py-5 md:py-8"><div className="container-app">
    {loading && <div className="flex justify-center gap-3 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading about information...</div>}
    {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
    {!loading && !error && !about && <p className="py-16 text-center text-muted">About information has not been published yet.</p>}
    {!loading && !error && about && <><div className="grid items-start gap-6 rounded-[28px] border border-[#eadfce] bg-[#fffdf8] p-3 shadow-[0_18px_45px_rgba(23,59,95,0.10)] sm:p-5 md:grid-cols-[0.85fr_1.15fr] md:gap-8"><div className="relative h-[18rem] overflow-hidden rounded-[22px] bg-[#e9eff0] shadow-[0_12px_28px_rgba(23,59,95,0.14)] sm:h-[23rem] md:h-[30rem]">{about.image ? <img src={imageUrl(about.image)} alt={about.title} className="h-full w-full object-cover object-top transition duration-700 hover:scale-105" /> : <div className="flex h-full flex-col items-center justify-center gap-3 bg-navy text-white/80"><ImageOff className="text-gold" size={42} /><span>Image not available</span></div>}<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-transparent" /><span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b65318]">Our story</span></div><div className="flex h-full flex-col justify-center px-2 py-5 sm:px-4 md:px-7"><span className="eyebrow">Shri Shahu Prabodhini</span><h2 className="font-display text-3xl font-bold leading-tight text-navy md:text-4xl">{about.title}</h2><p className="mt-4 whitespace-pre-line leading-7 text-muted">{about.description || "No description available."}</p></div></div><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{stats.map(([value, label, Icon]) => <div key={label} className="content-reveal rounded-2xl border border-[#eadfce] border-l-4 border-l-[#e86516] bg-white p-4 shadow-[0_8px_22px_rgba(23,59,95,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-lg"><Icon size={19} className="text-[#e86516]" /><p className="mt-3 text-2xl font-bold text-navy">{value || "-"}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p></div>)}</div></>}
  </div></section></div>;
}
