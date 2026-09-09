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
          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border-l-4 border-gold bg-white p-6 shadow-sm"><p className="text-3xl font-bold text-navy">{loading ? "--" : awards.length}</p><p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted">Recognitions</p></div>
            <div className="border-l-4 border-maroon bg-white p-6 shadow-sm"><p className="text-3xl font-bold text-navy">1987</p><p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted">Established</p></div>
            <div className="border-l-4 border-navy bg-white p-6 shadow-sm"><p className="text-3xl font-bold text-navy">40K+</p><p className="mt-1 text-sm font-semibold uppercase tracking-wider text-muted">Students served</p></div>
          </div>
          {loading && <div className="flex items-center justify-center gap-3 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading recognitions...</div>}
          {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
          {!loading && !error && awards.length === 0 && <p className="py-16 text-center text-muted">No recognitions have been published yet.</p>}
          {!loading && !error && awards.length > 0 && <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {awards.map((award, index) => {
              const Icon = icons[index % icons.length];
              const image = award.image && (/^(https?:|data:|blob:)/i.test(award.image) ? award.image : `${API_BASE_URL.replace(/\/+$/, "")}/${award.image.replace(/^\/+/, "")}`);
              return <article key={award.id} className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#ffe0c2] bg-white shadow-[0_12px_30px_rgba(11,37,69,0.08)] transition duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_18px_38px_rgba(255,109,0,0.15)]">
                <div className="relative h-[24rem] overflow-hidden bg-[linear-gradient(145deg,#fff7ed,#f3f4f6)] sm:h-[19rem] xl:h-[21rem]">
                  {image ? <img src={image} alt={award.title} className="h-full w-full object-contain object-center transition duration-500 group-hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center bg-navy-light"><Icon size={64} className="text-white" strokeWidth={1.2} /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-white shadow-md"><CalendarDays size={15} /> {award.year || "Recognition"}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-dark"><Icon size={20} /></div>
                  <h3 className="text-xl font-bold leading-tight text-navy">{award.title}</h3>
                  {award.description && <p className="mt-3 text-sm leading-6 text-muted">{award.description}</p>}
                  <p className="mt-auto border-t border-slate-100 pt-4 text-sm text-muted">Awarded by <strong className="text-navy">{award.by}</strong></p>
                  {award.awardedTo && <p className="mt-1 text-xs uppercase tracking-wider text-gold-dark">Presented to {award.awardedTo}</p>}
                </div>
              </article>;
            })}
          </div>}
        </div>
      </section>
    </>
  );
}