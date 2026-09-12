import React, { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, GraduationCap, ImageOff, LoaderCircle, Quote, Search, Sparkles, Users, X } from "lucide-react";
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
  const [selectedMentor, setSelectedMentor] = useState(null);

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

  const filteredMentors = mentors.filter((mentor) => [mentor.name, mentor.designation, mentor.subject, mentor.qualification, mentor.description].join(" ").toLowerCase().includes(query.trim().toLowerCase()));

  function MentorPanel({ mentor, featured = false, index = 0 }) {
    const image = resolveImageUrl(mentor.image);

    return <article className="content-reveal group grid h-full min-h-[24rem] cursor-pointer grid-cols-1 overflow-hidden rounded-[26px] border border-[#eadfce] bg-[#fffaf0] shadow-[0_18px_45px_rgba(23,59,95,0.10)] transition duration-500 hover:-translate-y-2 hover:border-[#e86516]/45 hover:shadow-[0_26px_58px_rgba(237,90,0,0.20)] sm:grid-cols-[0.42fr_0.58fr]" style={{ animationDelay: `${index * 80}ms` }} role="button" tabIndex="0" onClick={() => onOpen(mentor)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(mentor); } }}>
      <div className="relative min-h-[15rem] overflow-hidden bg-[#f3e5d6] sm:min-h-full">
        {image ? <img src={image} alt={mentor.name} onError={(event) => { event.currentTarget.src = fallbackImage; }} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[#b8752b]"><ImageOff size={46} /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#7d3b20]/55 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-75" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#e7a064]/70 bg-[#fffdf8]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e86516] shadow-sm transition duration-300 group-hover:-translate-y-0.5"><Sparkles size={12} /> {featured ? "Featured mentor" : "Mentor profile"}</span>
      </div>
      <div className="relative flex min-h-full flex-col justify-start p-5 pb-3 text-[#18282d] sm:p-7 sm:pb-3">
        <Quote className="absolute right-5 top-5 text-[#e9a064]/55 transition duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:text-[#e86516]/70" size={42} strokeWidth={1.2} />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-[#e86516]">{mentor.subject || mentor.designation || "Academic guidance"}</p>
        <h2 className="relative mt-3 font-display text-xl font-bold leading-tight text-[#18282d] sm:text-2xl">{mentor.name}</h2>
        {mentor.description && <p className="mt-4 min-h-[7rem] line-clamp-5 max-w-2xl font-display text-lg font-bold leading-8 text-[#d2763d] transition-colors duration-300 group-hover:text-[#e86516]">{mentor.description}</p>}
        {(mentor.qualification || mentor.experience) && <div className="mt-5 grid gap-2 border-t border-[#eadfce] pt-4 text-xs text-[#607276] sm:grid-cols-2">{mentor.qualification && <span className="flex items-start gap-2"><BookOpen size={15} className="mt-0.5 shrink-0 text-[#d87838]" />{mentor.qualification}</span>}{mentor.experience && <span className="flex items-start gap-2"><GraduationCap size={15} className="mt-0.5 shrink-0 text-[#d87838]" />{mentor.experience}</span>}</div>}
        <div className="mt-auto flex justify-end border-t border-[#eadfce] pt-4"><ArrowUpRight aria-label={`View ${mentor.name} profile`} size={18} className="text-[#b05b25] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
      </div>
    </article>;
  }

  return (
    <div className="bg-[#f3f6f6]">
      <PageHeader title="Our Mentors" crumb="Mentors" />
      <section className="relative overflow-hidden bg-[linear-gradient(115deg,#fffdf8_0%,#f7f4ea_58%,#fff3dc_100%)] py-8 sm:py-12 md:py-14">
        <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full border-[34px] border-[#e3a04d]/15" />
        <div className="container-app relative">
          <div className="mb-7 flex items-center gap-3"><span className="h-px w-8 bg-[#e86516]" /><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b65318]">Guidance for every step</p><span className="h-px flex-1 bg-[#ddd8cb]" /></div>
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8752b]">People behind progress</p><h1 className="mt-2 font-display text-3xl font-bold text-[#e86516] sm:text-4xl">Meet your mentors.</h1></div><div className="relative w-full sm:max-w-xs"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#879795]" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search mentors" aria-label="Search mentors" className="w-full rounded-full border border-[#d7dfda] bg-white py-3 pl-11 pr-4 text-sm text-[#18282d] shadow-sm outline-none transition focus:border-[#d87838] focus:ring-2 focus:ring-[#d87838]/15" /></div></div>
          {loading ? (
            <div className="flex justify-center gap-3 rounded-[28px] bg-white py-20 text-muted shadow-[0_18px_45px_rgba(23,59,95,0.08)]"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading mentors...</div>
          ) : mentors.length === 0 ? (
            <div className="rounded-[28px] bg-white py-16 text-center text-muted shadow-[0_18px_45px_rgba(23,59,95,0.08)]">No mentors are available right now.</div>
          ) : filteredMentors.length === 0 ? (
            <div className="rounded-[28px] bg-white py-16 text-center text-muted shadow-[0_18px_45px_rgba(23,59,95,0.08)]">No mentors match your search.</div>
          ) : (
            <>
              <div className="grid items-stretch gap-5 md:grid-cols-2">{filteredMentors.map((mentor, index) => <MentorPanel key={mentor.id} mentor={mentor} index={index} onOpen={setSelectedMentor} />)}</div>
            </>
          )}
        </div>
      </section>
      {selectedMentor && <div className="mentor-modal fixed inset-0 z-[70] flex items-center justify-center bg-[#17243a]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="mentor-profile-title" onClick={() => setSelectedMentor(null)}>
        <div className="relative grid max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-[26px] border border-[#eadfce] bg-[#fffaf0] shadow-[0_24px_80px_rgba(23,59,95,0.28)] sm:grid-cols-[0.8fr_1.2fr]" onClick={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => setSelectedMentor(null)} aria-label="Close mentor profile" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full !border-0 !bg-white/90 !p-0 !text-[#18282d] shadow-md hover:!bg-white"><X size={18} /></button>
          <div className="relative min-h-[16rem] bg-[#f3e5d6] sm:min-h-[22rem]"><img src={resolveImageUrl(selectedMentor.image)} alt={selectedMentor.name} className="h-full w-full object-cover object-top" /><div className="absolute inset-0 bg-gradient-to-t from-[#7d3b20]/60 via-transparent to-transparent" /></div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e86516]">{selectedMentor.subject || selectedMentor.designation || "Academic guidance"}</p>
            <h2 id="mentor-profile-title" className="mt-2 font-display text-2xl font-bold leading-tight text-[#18282d] sm:text-3xl">{selectedMentor.name}</h2>
            {selectedMentor.designation && <p className="mt-1 text-sm font-semibold text-[#607276]">{selectedMentor.designation}</p>}
            {selectedMentor.description && <p className="mt-5 text-sm leading-7 text-[#526b7e]">{selectedMentor.description}</p>}
            {(selectedMentor.qualification || selectedMentor.experience) && <div className="mt-6 grid gap-3 border-t border-[#eadfce] pt-5 text-sm text-[#607276] sm:grid-cols-2">{selectedMentor.qualification && <div className="flex items-start gap-2"><BookOpen size={17} className="mt-0.5 shrink-0 text-[#d87838]" />{selectedMentor.qualification}</div>}{selectedMentor.experience && <div className="flex items-start gap-2"><GraduationCap size={17} className="mt-0.5 shrink-0 text-[#d87838]" />{selectedMentor.experience}</div>}</div>}
          </div>
        </div>
      </div>}
    </div>
  );
}