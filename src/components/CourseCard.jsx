import React from "react";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api.js";

const fallbackCourseImage = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop";

function resolveImageUrl(image) {
  if (!image) return fallbackCourseImage;
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

export default function CourseCard({ course, showFullImage = false, overlayMode = false }) {
  return (
    <article className={`group relative flex h-full overflow-hidden rounded-[24px] border border-[#e3e9ee] bg-white shadow-[0_12px_30px_rgba(23,59,95,0.09)] transition-all duration-500 hover:-translate-y-2 hover:border-[#ed5a00]/45 hover:shadow-[0_24px_48px_rgba(23,59,95,0.18)] ${overlayMode ? "aspect-[4/3] flex-col" : "flex-col lg:flex-row"}`} style={{ borderTopColor: course.color || "#f3b93d", borderTopWidth: "4px" }}>
      <div className={`course-image-frame relative overflow-hidden bg-[#f4f7f8] ${overlayMode ? "h-full" : "lg:aspect-auto lg:min-h-[15rem] lg:w-[38%] lg:shrink-0"}`}>
        <img
          src={resolveImageUrl(course.image)}
          alt={course.name}
          onError={(event) => { event.currentTarget.src = fallbackCourseImage; }}
          className={`h-full w-full object-center transition-transform duration-700 group-hover:scale-105 ${showFullImage ? "object-contain p-3" : "object-cover"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/45 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
        <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-white/25 opacity-0 blur-xl transition duration-700 group-hover:left-[115%] group-hover:opacity-100" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-navy shadow-sm backdrop-blur-sm transition duration-300 group-hover:-translate-y-0.5"><Sparkles size={12} className="text-gold-dark transition-transform duration-500 group-hover:rotate-12" /> Featured course</span>
        {overlayMode ? <div className="absolute inset-0 flex flex-col justify-end bg-[#102b46]/72 p-5 text-white opacity-100 backdrop-blur-[2px] transition-all duration-500 sm:translate-y-4 sm:bg-[#102b46]/72 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"><div className="translate-y-0 transition-transform duration-500 sm:translate-y-3 sm:group-hover:translate-y-0"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffd98d]">Featured course</p><p className="mt-2 font-display text-xl font-bold leading-tight">{course.name}</p>{course.desc && <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/80">{course.desc}</p>}<div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/85">{course.duration && <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5">{course.duration}</span>}{course.fee && <span className="rounded-full border border-[#ffd98d]/35 bg-[#ffd98d]/15 px-3 py-1.5 text-[#ffe0a3]">{course.fee}</span>}</div><Link to={`/courses/${course.id}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ed5a00] px-4 py-2 text-xs font-bold text-white shadow-[0_8px_18px_rgba(237,90,0,0.3)] transition hover:bg-[#ff7a24] hover:shadow-[0_12px_24px_rgba(237,90,0,0.4)]" aria-label={`View details for ${course.name}`}>Explore course <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" /></Link></div></div> : <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-[#102b46]/65 px-4 py-3 text-white opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 lg:px-5"><p className="font-display text-base font-bold leading-tight">{course.name}</p></div>}
      </div>
      {!overlayMode && <div className="flex flex-1 flex-col px-5 pb-5 pt-5 lg:px-6 lg:py-6">
        <h3 className="font-display text-xl font-bold leading-tight text-navy transition-colors group-hover:text-gold-dark">{course.name}</h3>
        {course.desc && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{course.desc}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-xs font-semibold text-muted">
          {course.duration && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf3f8] px-3 py-1.5 text-navy"><Clock3 size={13} /> {course.duration}</span>}
          {course.fee && <span className="rounded-full bg-[#f7f1df] px-3 py-1.5 text-gold-dark">{course.fee}</span>}
        </div>
        <Link
          to={`/courses/${course.id}`}
          className="mt-5 inline-flex min-h-10 self-end items-center gap-2 rounded-full border border-[#ed5a00]/35 bg-[#fff8f2] px-4 py-2 text-xs font-bold text-[#c84c0b] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-[#ed5a00] hover:bg-[#ed5a00] hover:text-white hover:shadow-[0_10px_20px_rgba(237,90,0,0.22)] focus:outline-none focus:ring-2 focus:ring-[#ed5a00]/30"
          aria-label={`View details for ${course.name}`}
        >
          Explore course <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>}
    </article>
  );
}
