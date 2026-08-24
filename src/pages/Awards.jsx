import React, { useEffect, useState } from "react";
import { Award, BadgeCheck, CalendarDays, LoaderCircle, Medal, Trophy } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { fetchAwards } from "../services/backendService";
import { API_BASE_URL } from "../utils/api";

const icons = [Trophy, Medal, Award, BadgeCheck];

export default function Awards() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchAwards()
      .then((items) => {
        if (active) setAwards(items.sort((first, second) => Number(second.year) - Number(first.year)));
      })
      .catch(() => active && setError("Awards are temporarily unavailable. Please check back soon."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <>
      <PageHeader title="Awards & Recognition" crumb="Awards" />
      <section className="relative overflow-hidden bg-cream section-pad">
        <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-gold/10" />
        <div className="container-app relative">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="eyebrow">A record worth celebrating</span>
            <h2 className="text-3xl font-bold text-navy md:text-5xl">Milestones that inspire</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">Every recognition reflects our commitment to helping students learn with confidence and achieve their full potential.</p>
          </div>
          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border-l-4 border-gold bg-white p-6 shadow-sm"><p className="text-3xl font-bold text-navy">{loading ? "--" : awards.length}</p><p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted">Recognitions</p></div>
            <div className="border-l-4 border-maroon bg-white p-6 shadow-sm"><p className="text-3xl font-bold text-navy">1987</p><p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted">Established</p></div>
            <div className="border-l-4 border-navy bg-white p-6 shadow-sm"><p className="text-3xl font-bold text-navy">40K+</p><p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted">Students served</p></div>
          </div>
          {loading && <div className="flex items-center justify-center gap-3 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading recognitions...</div>}
          {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
          {!loading && !error && awards.length === 0 && <p className="py-16 text-center text-muted">No recognitions have been published yet.</p>}
          {!loading && !error && awards.length > 0 && <div className="grid gap-7 md:grid-cols-2">
            {awards.map((award, index) => {
              const Icon = icons[index % icons.length];
              const image = award.image && (/^(https?:|data:|blob:)/i.test(award.image) ? award.image : `${API_BASE_URL.replace(/\/+$/, "")}/${award.image.replace(/^\/+/, "")}`);
              return <article key={award.id} className="group overflow-hidden bg-white shadow-[0_8px_30px_rgba(11,37,69,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="grid min-h-[250px] sm:grid-cols-[42%_58%]">
                  <div className="relative min-h-[220px] overflow-hidden bg-navy">{image ? <img src={image} alt={award.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-navy-light"><Icon size={64} className="text-gold" strokeWidth={1.2} /></div>}<span className="absolute left-4 top-4 inline-flex items-center gap-1.5 bg-gold px-3 py-1.5 text-sm font-bold text-navy"><CalendarDays size={15} /> {award.year || "Recognition"}</span></div>
                  <div className="flex flex-col justify-center p-6 sm:p-7"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-dark"><Icon size={20} /></div><h3 className="text-xl font-bold leading-tight text-navy">{award.title}</h3>{award.description && <p className="mt-3 text-sm leading-6 text-muted">{award.description}</p>}<p className="mt-5 border-t border-slate-100 pt-4 text-sm text-muted">Awarded by <strong className="text-navy">{award.by}</strong></p>{award.awardedTo && <p className="mt-1 text-xs uppercase tracking-wider text-gold-dark">Presented to {award.awardedTo}</p>}</div>
                </div>
              </article>;
            })}
          </div>}
        </div>
      </section>
    </>
  );
}