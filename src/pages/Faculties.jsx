import React, { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, GraduationCap, ImageOff, LoaderCircle, Search, Sparkles } from "lucide-react";
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
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");

  useEffect(() => {
    let active = true;
    fetchFaculties().then((items) => active && setFaculties(items)).catch(() => active && setError("Faculty information is temporarily unavailable.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const subjects = ["All", ...new Set(faculties.map((faculty) => faculty.subject).filter(Boolean))];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredFaculties = faculties.filter((faculty) => {
    const matchesSubject = subject === "All" || faculty.subject === subject;
    const searchable = [faculty.name, faculty.subject, faculty.education, faculty.description].filter(Boolean).join(" ").toLowerCase();
    return matchesSubject && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
  const featuredFaculty = filteredFaculties[0] || faculties[0];
  const featuredImage = imageUrl(featuredFaculty?.image);

  return <div className="bg-[#f4f7f6]">
    <PageHeader title="Our Faculty" crumb="Faculty" />
    <section className="relative overflow-hidden border-b border-[#e3e8e2] bg-[#fffdf8] py-6 sm:py-8 md:py-10">
      <div className="container-app relative">
        <div className="grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e7a064]/60 bg-[#fff4e7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b65318]"><Sparkles size={13} /> The people behind progress</span>
            <h1 className="font-display text-2xl font-bold leading-tight text-[#18282d] sm:text-3xl md:text-4xl">Meet our faculty.</h1>
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-[#d9d3c7] pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div><p className="font-display text-3xl font-bold text-[#e86516] sm:text-4xl">{faculties.length}</p><p className="mt-1 text-[11px] leading-4 text-[#65777b] sm:text-xs">Faculty members</p></div>
            <div><p className="font-display text-3xl font-bold text-[#e86516] sm:text-4xl">{subjects.length > 1 ? subjects.length - 1 : 0}</p><p className="mt-1 text-[11px] leading-4 text-[#65777b] sm:text-xs">Disciplines</p></div>
            <div><p className="font-display text-3xl font-bold text-[#e86516] sm:text-4xl">{faculties.filter((faculty) => faculty.education).length}</p><p className="mt-1 text-[11px] leading-4 text-[#65777b] sm:text-xs">Profiles</p></div>
          </div>
        </div>
      </div>
    </section>

    <section className="relative py-10 pb-16 sm:py-14 md:py-16">
      <div className="container-app">
        {loading && <div className="flex min-h-64 items-center justify-center gap-3 rounded-[28px] bg-white text-muted shadow-[0_20px_60px_rgba(23,59,95,0.10)]"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading faculty...</div>}
        {!loading && error && <p className="rounded-[28px] bg-white py-16 text-center text-maroon shadow-[0_20px_60px_rgba(23,59,95,0.10)]">{error}</p>}
        {!loading && !error && faculties.length === 0 && <p className="rounded-[28px] bg-white py-16 text-center text-muted shadow-[0_20px_60px_rgba(23,59,95,0.10)]">No faculty profiles have been published yet.</p>}

        {!loading && !error && faculties.length > 0 && <>
          {featuredFaculty && <div className="grid overflow-hidden rounded-[30px] border border-[#e7e1d5] bg-[#fffdf8] shadow-[0_24px_60px_rgba(23,59,95,0.13)] lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative min-h-[22rem] overflow-hidden bg-[#e7ece8] sm:min-h-[28rem]">{featuredImage ? <img src={featuredImage} alt={featuredFaculty.name} className="h-full w-full object-cover object-top transition duration-700 hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[#81918d]"><ImageOff size={48} /></div>}<div className="absolute inset-0 bg-gradient-to-t from-[#18282d]/65 via-transparent to-transparent" /><span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#355156]"><GraduationCap size={14} className="text-[#d87838]" /> Featured faculty</span></div>
            <div className="flex flex-col justify-center p-6 sm:p-9 md:p-12"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8752b]">{featuredFaculty.subject || "Academic specialist"}</p><h2 className="mt-3 font-display text-3xl font-bold leading-tight text-[#18282d] sm:text-4xl">{featuredFaculty.name}</h2>{featuredFaculty.description && <p className="mt-4 max-w-xl text-sm leading-7 text-[#607276]">{featuredFaculty.description}</p>}<div className="mt-7 grid gap-3 sm:grid-cols-2">{featuredFaculty.education && <div className="flex items-start gap-3 rounded-2xl border border-[#eadfce] bg-[#fffaf0] p-4"><BookOpen size={18} className="mt-0.5 shrink-0 text-[#d87838]" /><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b8752b]">Education</p><p className="mt-1 text-sm font-semibold text-[#355156]">{featuredFaculty.education}</p></div></div>}{featuredFaculty.experience && <div className="flex items-start gap-3 rounded-2xl border border-[#eadfce] bg-[#fffaf0] p-4"><GraduationCap size={18} className="mt-0.5 shrink-0 text-[#d87838]" /><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b8752b]">Experience</p><p className="mt-1 text-sm font-semibold text-[#355156]">{featuredFaculty.experience}</p></div></div>}</div></div>
          </div>}

          <div className="mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8752b]">Our teaching community</p><h2 className="mt-2 font-display text-3xl font-bold text-[#18282d] sm:text-4xl">Find your subject expert.</h2></div><div className="relative w-full sm:max-w-xs"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#879795]" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search faculty" aria-label="Search faculty" className="w-full rounded-full border border-[#d7dfda] bg-white py-3 pl-11 pr-4 text-sm text-[#18282d] shadow-sm outline-none transition focus:border-[#d87838] focus:ring-2 focus:ring-[#d87838]/15" /></div></div>
          <div className="mt-5 flex max-w-full gap-2 overflow-x-auto pb-1">{subjects.map((item) => <button key={item} type="button" onClick={() => setSubject(item)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${subject === item ? "border-[#18282d] bg-[#18282d] text-white shadow-md" : "border-[#d7dfda] bg-white text-[#355156] hover:border-[#d87838] hover:text-[#b05b25]"}`}>{item}</button>)}</div>

          {filteredFaculties.length > 0 ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredFaculties.map((faculty, index) => { const image = imageUrl(faculty.image); return <article key={faculty.id} className="content-reveal group overflow-hidden rounded-[24px] border border-[#e1e7e4] bg-white shadow-[0_12px_30px_rgba(23,59,95,0.08)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_22px_44px_rgba(23,59,95,0.15)]" style={{ animationDelay: `${index * 65}ms` }}><div className="relative aspect-[4/4.5] overflow-hidden bg-[#e7ece8]">{image ? <img src={image} alt={faculty.name} loading="lazy" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[#81918d]"><ImageOff size={36} /></div>}<div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#18282d]/75 to-transparent" /><span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#355156]">{faculty.subject || "Faculty"}</span></div><div className="p-5"><h3 className="font-display text-lg font-bold leading-tight text-[#18282d]">{faculty.name}</h3>{faculty.experience && <p className="mt-1 text-xs font-semibold text-[#b8752b]">{faculty.experience}</p>}{faculty.education && <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#607276]">{faculty.education}</p>}<div className="mt-4 flex items-center justify-end border-t border-[#edf0ed] pt-3 text-[#b05b25]"><ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div></div></article>; })}</div> : <p className="mt-10 rounded-2xl bg-white py-12 text-center text-muted shadow-sm">No faculty profiles match your search.</p>}
        </>}
      </div>
    </section>
  </div>;
}
