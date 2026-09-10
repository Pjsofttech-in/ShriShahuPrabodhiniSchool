import React, { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, GraduationCap, ImageOff, LoaderCircle, Search, Sparkles } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { fetchMentors } from "../services/backendService.js";
import { API_BASE_URL } from "../utils/api.js";

const fallbackImage = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=900&auto=format&fit=crop";

function resolveImageUrl(image) {
  if (!image) return fallbackImage;
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

export default function Features() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    fetchMentors()
      .then((data) => {
        if (mounted) setMentors(data);
      })
      .catch((error) => {
        console.error("Failed to fetch mentors:", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Our Mentors" crumb="Mentors" />
      <section className="relative overflow-hidden bg-[#f4f7f6] py-10 md:py-16">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border-[34px] border-[#e3a04d]/15" />
        <div className="container-app">
          <div className="mb-10 flex flex-col gap-5 border-b border-[#dfe7e3] pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div><span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e7a064]/60 bg-[#fff4e7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b65318]"><Sparkles size={13} /> Guidance that moves you forward</span><h1 className="font-display text-3xl font-bold leading-tight text-[#18282d] sm:text-4xl">Meet your mentors.</h1></div>
            <div className="relative w-full sm:max-w-xs"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#879795]" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search mentors" aria-label="Search mentors" className="w-full rounded-full border border-[#d7dfda] bg-white py-3 pl-11 pr-4 text-sm text-[#18282d] shadow-sm outline-none transition focus:border-[#d87838] focus:ring-2 focus:ring-[#d87838]/15" /></div>
          </div>
          {loading ? (
            <div className="flex justify-center gap-3 rounded-[28px] bg-white py-20 text-muted shadow-[0_18px_45px_rgba(23,59,95,0.08)]"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading mentors...</div>
          ) : mentors.length === 0 ? (
            <div className="rounded-[28px] bg-white py-16 text-center text-muted shadow-[0_18px_45px_rgba(23,59,95,0.08)]">No mentors are available right now.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.filter((mentor) => [mentor.name, mentor.designation, mentor.subject, mentor.qualification].join(" ").toLowerCase().includes(query.trim().toLowerCase())).map((mentor, index) => {
                const image = resolveImageUrl(mentor.image);
                return <article key={mentor.id} className="content-reveal group overflow-hidden rounded-[26px] border border-[#e1e7e4] bg-white shadow-[0_12px_30px_rgba(23,59,95,0.08)] transition duration-500 hover:-translate-y-2 hover:border-[#ed5a00]/40 hover:shadow-[0_22px_44px_rgba(23,59,95,0.15)]" style={{ animationDelay: `${index * 70}ms` }}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e7ece8]">{image ? <img src={image} alt={mentor.name} onError={(event) => { event.currentTarget.src = fallbackImage; }} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[#81918d]"><ImageOff size={42} /></div>}<div className="absolute inset-0 bg-gradient-to-t from-[#18282d]/75 via-transparent to-transparent" /><span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#355156]"><GraduationCap size={13} className="mr-1 inline text-[#d87838]" /> Mentor</span></div>
                  <div className="p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b8752b]">{mentor.subject || mentor.designation}</p><h2 className="mt-2 font-display text-2xl font-bold leading-tight text-[#18282d]">{mentor.name}</h2>{mentor.designation && <p className="mt-1 text-sm font-semibold text-[#607276]">{mentor.designation}</p>}{mentor.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#607276]">{mentor.description}</p>}<div className="mt-5 grid gap-2 border-t border-[#edf0ed] pt-4 text-xs text-[#607276] sm:grid-cols-2">{mentor.qualification && <span className="flex items-start gap-2"><BookOpen size={15} className="mt-0.5 shrink-0 text-[#d87838]" />{mentor.qualification}</span>}{mentor.experience && <span className="flex items-start gap-2"><GraduationCap size={15} className="mt-0.5 shrink-0 text-[#d87838]" />{mentor.experience}</span>}</div><div className="mt-4 flex justify-end text-[#b05b25]"><ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div></div>
                </article>;
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}