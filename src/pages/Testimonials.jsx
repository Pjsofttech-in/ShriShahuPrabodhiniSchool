import React, { useEffect, useState } from "react";
import { ImageOff, LoaderCircle, Quote, Trophy } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { API_BASE_URL } from "../utils/api.js";
import { fetchTestimonials } from "../services/backendService.js";

function imageUrl(image) {
  if (!image) return "";
  return /^(https?:|data:|blob:)/i.test(image) ? image : `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
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

  return <div><PageHeader title="Student Testimonials" crumb="Testimonials" /><section className="bg-cream py-8 md:py-12"><div className="container-app">
    {loading && <div className="flex justify-center gap-3 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading testimonials...</div>}
    {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
    {!loading && !error && testimonials.length === 0 && <p className="py-16 text-center text-muted">No testimonials have been published yet.</p>}
    {!loading && !error && testimonials.length > 0 && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{testimonials.map((testimonial, index) => { const image = imageUrl(testimonial.image); return <article key={testimonial.id} className="content-reveal relative overflow-hidden bg-white p-6 shadow-[0_8px_30px_rgba(11,37,69,0.08)]" style={{ animationDelay: `${index * 80}ms` }}><Quote className="mb-5 text-gold" size={30} /><h2 className="text-lg font-bold text-navy">{testimonial.title}</h2><p className="mt-3 min-h-20 text-sm leading-7 text-ink/80">{testimonial.description || "No testimonial text available."}</p><div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">{image ? <img src={image} alt={testimonial.name} className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-gold"><ImageOff size={18} /></div>}<div><p className="text-sm font-bold text-navy">{testimonial.name}</p><p className="text-xs text-muted">{[testimonial.exam, testimonial.post].filter(Boolean).join(" · ") || "Student"}</p></div>{testimonial.rank && <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-gold-dark"><Trophy size={14} /> Rank {testimonial.rank}</span>}</div></article>; })}</div>}
  </div></section></div>;
}
