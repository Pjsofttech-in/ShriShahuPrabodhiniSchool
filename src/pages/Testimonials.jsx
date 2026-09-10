import React, { useEffect, useState } from "react";
import { ArrowUpRight, GraduationCap, ImageOff, LoaderCircle, Quote, Sparkles, Trophy } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { API_BASE_URL } from "../utils/api.js";
import { fetchTestimonials } from "../services/backendService.js";

function imageUrl(image) {
  if (!image) return "";
  return /^(https?:|data:|blob:)/i.test(image) ? image : `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

function TestimonialPanel({ testimonial, featured = false, index = 0 }) {
  const image = imageUrl(testimonial.image);

  return (
    <article className={`content-reveal group grid overflow-hidden rounded-[26px] border border-[#eadfce] bg-[#fffaf0] shadow-[0_18px_45px_rgba(23,59,95,0.10)] transition duration-500 hover:-translate-y-2 hover:border-[#e86516]/45 hover:shadow-[0_26px_58px_rgba(237,90,0,0.20)] ${featured ? "lg:mx-auto lg:max-w-5xl lg:grid-cols-[0.78fr_1.22fr]" : "lg:grid-cols-[0.38fr_0.62fr]"}`} style={{ animationDelay: `${index * 80}ms` }}>
      <div className={`relative overflow-hidden bg-[#f3e5d6] ${featured ? "min-h-[17rem] sm:min-h-[22rem] lg:min-h-[25rem]" : "min-h-[13rem] sm:min-h-[16rem] lg:min-h-full"}`}>
        {image ? <img src={image} alt={testimonial.name} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[#b8752b]"><ImageOff size={46} /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#7d3b20]/55 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-75" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#e7a064]/70 bg-[#fffdf8]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e86516] shadow-sm transition duration-300 group-hover:-translate-y-0.5"><Sparkles size={12} className="text-[#e86516] transition-transform duration-500 group-hover:rotate-12" /> {featured ? "Featured voice" : "Student voice"}</span>
      </div>
      <div className={`relative flex flex-col justify-center p-5 text-[#18282d] sm:p-7 ${featured ? "md:p-9" : "lg:p-7"}`}>
        <Quote className="absolute right-5 top-5 text-[#e9a064]/55 transition duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:text-[#e86516]/70" size={featured ? 58 : 42} strokeWidth={1.2} />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-[#e86516]">{testimonial.title || "A student story"}</p>
        <blockquote className={`relative mt-3 max-w-2xl font-display font-bold leading-snug text-[#d2763d] transition-colors duration-300 group-hover:text-[#e86516] ${featured ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}>“{testimonial.description || "No testimonial text available."}”</blockquote>
        <div className="mt-5 flex items-center gap-3 border-t border-[#eadfce] pt-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3bd63] text-[#7d3518] transition duration-300 group-hover:scale-110 group-hover:rotate-3"><GraduationCap size={18} /></div><div className="min-w-0"><p className="truncate font-display font-bold text-[#18282d]">{testimonial.name}</p><p className="truncate text-xs text-[#607276]">{[testimonial.exam, testimonial.post].filter(Boolean).join(" · ") || "Student"}</p></div>{testimonial.rank && <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#e86516]"><Trophy size={13} /> Rank {testimonial.rank}</span>}</div>
      </div>
    </article>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchTestimonials().then((items) => active && setTestimonials(items)).catch(() => active && setError("Testimonials are temporarily unavailable.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const featured = testimonials[0];
  const remaining = testimonials.slice(1);

  return <div className="bg-[#f3f6f6]">
    <PageHeader title="Student Testimonials" crumb="Testimonials" />
    <section className="relative overflow-hidden bg-[linear-gradient(115deg,#fffdf8_0%,#f7f4ea_58%,#fff3dc_100%)] py-8 sm:py-12 md:py-14">
      <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full border-[34px] border-[#e3a04d]/15" />
      <div className="container-app relative">
        <div className="mb-7 flex items-center gap-3"><span className="h-px w-8 bg-[#e86516]" /><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b65318]">Voices of progress</p><span className="h-px flex-1 bg-[#ddd8cb]" /></div>
        {loading && <div className="flex min-h-64 items-center justify-center gap-3 rounded-[28px] bg-white text-muted shadow-[0_20px_60px_rgba(23,59,95,0.10)]"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading testimonials...</div>}
        {!loading && error && <p className="rounded-[28px] bg-white py-16 text-center text-maroon shadow-[0_20px_60px_rgba(23,59,95,0.10)]">{error}</p>}
        {!loading && !error && testimonials.length === 0 && <p className="rounded-[28px] bg-white py-16 text-center text-muted shadow-[0_20px_60px_rgba(23,59,95,0.10)]">No testimonials have been published yet.</p>}
        {!loading && !error && featured && <>
          <TestimonialPanel testimonial={featured} featured />
          {remaining.length > 0 && <div className="mt-12"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8752b]">More voices</p><h2 className="mt-2 font-display text-3xl font-bold text-[#e86516]">What our learners say.</h2></div><ArrowUpRight className="text-[#e86516] transition duration-300 hover:translate-x-1 hover:-translate-y-1" size={24} /></div><div className="grid gap-5 md:grid-cols-2">{remaining.map((testimonial, index) => <TestimonialPanel key={testimonial.id} testimonial={testimonial} index={index + 1} />)}</div></div>}
        </>}
      </div>
    </section>
  </div>;
}
