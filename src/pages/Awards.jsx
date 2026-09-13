import React, { useEffect, useState } from "react";
import { Award, ArrowUpRight, BadgeCheck, CalendarDays, LoaderCircle, Medal, Sparkles, Trophy } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { fetchAwards } from "../services/backendService";
import { API_BASE_URL } from "../utils/api";

const icons = [Trophy, Medal, Award, BadgeCheck];

export default function Awards() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");

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

  const years = ["All", ...new Set(awards.map((award) => award.year).filter(Boolean))];
  const filteredAwards = selectedYear === "All" ? awards : awards.filter((award) => award.year === selectedYear);
  const latestAward = awards[0];

  return (
    <>
      <PageHeader title="Awards & Recognition" crumb="Awards" />
      <section className="relative overflow-hidden bg-[#f4f7fa] py-10 md:py-16">
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[#dce9f3] blur-3xl" />
        <div className="container-app relative">
          {!loading && !error && awards.length > 0 && <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-navy"><Trophy size={18} className="text-gold-dark" /> Recognition wall</div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter awards by year">
              {years.map((year) => <button key={year} type="button" onClick={() => setSelectedYear(year)} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${selectedYear === year ? "border-navy bg-navy text-white shadow-md" : "border-[#dce3e9] bg-white text-navy hover:border-gold hover:text-gold-dark"}`}>{year}</button>)}
            </div>
          </div>}

          {!loading && !error && latestAward && selectedYear === "All" && <div className="mb-8 overflow-hidden rounded-[28px] border border-gold/35 bg-white shadow-[0_14px_34px_rgba(23,59,95,0.10)] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative flex min-h-[15rem] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#f9f2df,#fffdfa)] p-5">
              {latestAward.image ? <img src={latestAward.image.match(/^(https?:|data:|blob:)/i) ? latestAward.image : `${API_BASE_URL.replace(/\/+$/, "")}/${latestAward.image.replace(/^\/+/, "")}`} alt={latestAward.title} className="h-full max-h-[18rem] w-full object-contain transition duration-700 hover:scale-105" /> : <Trophy size={90} className="text-gold" />}
              <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-white shadow-md"><CalendarDays size={14} className="mr-1 inline text-white" /> Latest recognition</span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">Featured achievement · {latestAward.year || "Recent"}</p>
              <h3 className="mt-3 font-display text-2xl font-bold text-navy md:text-3xl">{latestAward.title}</h3>
              {latestAward.description && <p className="mt-3 text-sm leading-6 text-muted">{latestAward.description}</p>}
              <p className="mt-5 text-sm text-muted">Awarded by <strong className="text-navy">{latestAward.by}</strong></p>
            </div>
          </div>}
          {loading && <div className="flex items-center justify-center gap-3 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading recognitions...</div>}
          {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
          {!loading && !error && awards.length === 0 && <p className="py-16 text-center text-muted">No recognitions have been published yet.</p>}
          {!loading && !error && filteredAwards.length > 0 && <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {filteredAwards.map((award, index) => {
              const Icon = icons[index % icons.length];
              const image = award.image && (/^(https?:|data:|blob:)/i.test(award.image) ? award.image : `${API_BASE_URL.replace(/\/+$/, "")}/${award.image.replace(/^\/+/, "")}`);
              return <article key={award.id} className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#e1e8ee] bg-white shadow-[0_12px_30px_rgba(23,59,95,0.09)] transition duration-500 hover:-translate-y-2 hover:border-gold/60 hover:shadow-[0_22px_44px_rgba(23,59,95,0.16)]">
                <div className="relative h-[24rem] overflow-hidden bg-[linear-gradient(145deg,#fff8e8,#eef3f6)] sm:h-[19rem] xl:h-[21rem]">
                  {image ? <img src={image} alt={award.title} className="h-full w-full object-contain object-center transition duration-700 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-navy-light"><Icon size={64} className="text-white" strokeWidth={1.2} /></div>}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/55 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-bold text-navy shadow-md backdrop-blur-sm"><CalendarDays size={15} className="text-gold-dark" /> {award.year || "Recognition"}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-4 flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-dark"><Icon size={20} /></div><ArrowUpRight size={18} className="text-slate-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold-dark" /></div>
                  <h3 className="font-display text-xl font-bold leading-tight text-navy">{award.title}</h3>
                  {award.description && <p className="mt-3 text-sm leading-6 text-muted">{award.description}</p>}
                  <p className="mt-auto border-t border-slate-100 pt-4 text-sm text-muted">Awarded by <strong className="text-navy">{award.by}</strong></p>
                  {award.awardedTo && <p className="mt-1 text-xs uppercase tracking-wider text-gold-dark">Presented to {award.awardedTo}</p>}
                </div>
              </article>;
            })}
          </div>}

          <div className="mt-10 grid overflow-hidden rounded-[30px] border border-[#e4eaf0] bg-[linear-gradient(120deg,#fffdf8_0%,#f4f8fa_58%,#fff3d5_100%)] shadow-[0_20px_50px_rgba(23,59,95,0.12)] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden p-6 text-navy sm:p-8 md:p-10">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[24px] border-navy/10" />
              <div className="relative">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark"><Sparkles size={13} /> A legacy of excellence</span>
                <h2 className="max-w-xl font-display text-3xl font-bold leading-tight text-navy sm:text-4xl md:text-5xl">Celebrating every <span className="text-[#ed5a00]">milestone.</span></h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-muted md:text-base">From classroom breakthroughs to national recognition, these moments reflect the ambition and dedication of our learning community.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-3 border-t border-[#dfe7ed] bg-white/45 p-6 text-center sm:p-8 lg:border-l lg:border-t-0">
              <div><p className="font-display text-3xl font-bold text-[#ed5a00] md:text-4xl">{loading ? "--" : awards.length}</p><p className="mt-1 text-xs text-muted">Recognitions</p></div>
              <div><p className="font-display text-3xl font-bold text-[#ed5a00] md:text-4xl">1987</p><p className="mt-1 text-xs text-muted">Established</p></div>
              <div><p className="font-display text-3xl font-bold text-[#ed5a00] md:text-4xl">40K+</p><p className="mt-1 text-xs text-muted">Students served</p></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}