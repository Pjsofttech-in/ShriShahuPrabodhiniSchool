import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, Target, MapPin, FileCheck2, ArrowRight, CalendarDays,
  Quote, MapPinned, ImageOff, BookOpen, Zap, Globe, CheckCircle, Award,
  BadgeCheck, Medal, Trophy, LoaderCircle, Rocket, Coins, Smartphone, ChevronLeft, ChevronRight,
} from "lucide-react";
import ImageSlider from "../components/ImageSlider.jsx";
import CourseCard from "../components/CourseCard.jsx";
import GalleryLightbox from "../components/GalleryLightbox.jsx";
import {
  sliderSlides, featureCounts, schoolFeatures, examInfo, schoolInfo,
} from "../data/siteData.js";
import {
  fetchCourses, fetchFaculties, fetchGallery, fetchTestimonials,
  fetchToppers, fetchAwards, fetchHeroSections, fetchMarquee, fetchSlideBars, fetchContactInfo, submitContactForm,
} from "../services/backendService.js";
import { API_BASE_URL } from "../utils/api.js";

const icons = { GraduationCap, Target, MapPin, FileCheck2, BookOpen, Zap, Globe, CheckCircle };
const awardIcons = [Trophy, Medal, Award, BadgeCheck];
const prizeHighlights = [
  { title: "A trip to NASA", description: "Don't miss the chance to explore the wonders of space - win an exciting trip to NASA", Icon: Rocket, tone: "text-[#ff4055]" },
  { title: "Cash Rewards", description: "Unlock the potential to win cash rewards as you pave the way to a brighter academic future.", Icon: GraduationCap, tone: "text-[#f1b923]" },
  { title: "Up to 100% Scholarships", description: "Get a chance to win up to 100% scholarships based on your performance", Icon: Coins, tone: "text-[#9d4c0e]" },
  { title: "Gadgets", description: "Participate in SCORE and stand a chance to earn exciting gadgets based on your performance", Icon: Smartphone, tone: "text-[#31597d]" },
];

function Counter({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="font-display text-4xl md:text-5xl font-bold text-navy">
      {count.toLocaleString()}
      <span className="text-gold-dark">{suffix}</span>
    </span>
  );
}

function ColoredTitle({ text, className = "" }) {
  return (
    <h2 className={`font-display text-3xl font-bold leading-tight text-[#ed5a00] md:text-4xl ${className}`}>
      {text}
    </h2>
  );
}

function SectionHeading({
  eyebrow,
  title,
  desc,
  center,
  titleClassName = "",
  eyebrowClassName = "",
  descClassName = "",
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {eyebrow && <span className={`eyebrow ${eyebrowClassName}`}>
        {eyebrow}
      </span>}

      <ColoredTitle text={title} className={titleClassName} />

      {desc && (
        <p className={`text-muted mt-3 ${descClassName}`}>
          {desc}
        </p>
      )}
    </div>
  );
}

function resolveImageUrl(image) {
  if (!image) return "";
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

function getMapEmbedUrl(mapLink, address = "Shri Shahu Prabodhini School, Pune") {
  const value = String(mapLink || "").trim();
  if (/google\.com\/maps\/embed/i.test(value)) return value;
  if (/google\.com\/maps/i.test(value)) return value.includes("output=embed") ? value : `${value}${value.includes("?") ? "&" : "?"}output=embed`;
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

function MissingImage({ className = "" }) {
  return <div className={`flex h-full min-h-24 flex-col items-center justify-center gap-2 bg-navy-light text-white/70 ${className}`}><ImageOff className="text-gold" size={28} /><span className="text-xs">Image not available</span></div>;
}

export default function Home() {
  const [liveData, setLiveData] = React.useState({ heroSections: [], slideBars: [], marquee: [], courses: [], toppers: [], awards: [], gallery: [], faculties: [], testimonials: [], contactInfo: null });
  const [awardsLoading, setAwardsLoading] = React.useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);

  React.useEffect(() => {
    let active = true;
    Promise.allSettled([fetchHeroSections(), fetchSlideBars(), fetchMarquee(), fetchCourses(), fetchToppers(), fetchAwards(), fetchGallery(), fetchFaculties(), fetchTestimonials(), fetchContactInfo()]).then((results) => {
      if (!active) return;
      const [heroResult, slideBarResult, marqueeResult, coursesResult, toppersResult, awardsResult, galleryResult, facultiesResult, testimonialsResult, contactResult] = results;
      setLiveData({
        heroSections: heroResult.status === "fulfilled" ? heroResult.value : [],
        slideBars: slideBarResult.status === "fulfilled" ? slideBarResult.value : [],
        marquee: marqueeResult.status === "fulfilled" ? marqueeResult.value : [],
        courses: coursesResult.status === "fulfilled" ? coursesResult.value : [],
        toppers: toppersResult.status === "fulfilled" ? toppersResult.value : [],
        awards: awardsResult.status === "fulfilled" ? awardsResult.value.sort((first, second) => Number(second.year) - Number(first.year)) : [],
        gallery: galleryResult.status === "fulfilled" ? galleryResult.value : [],
        faculties: facultiesResult.status === "fulfilled" ? facultiesResult.value : [],
        testimonials: testimonialsResult.status === "fulfilled" ? testimonialsResult.value : [],
        contactInfo: contactResult.status === "fulfilled" ? contactResult.value : null,
      });
      setAwardsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const { heroSections, slideBars, marquee, courses, toppers, awards, gallery, faculties, testimonials, contactInfo } = liveData;
  const heroSlides = (slideBars.length > 0 ? slideBars : heroSections)
    .sort((first, second) => first.priority - second.priority)
    .map((slide) => ({
      ...slide,
      image: resolveImageUrl(slide.image),
      linkLabel: slide.linkLabel || "Soon will be released",
      subtitle: slide.subtitle || "Soon will be released",
    }));
  const marqueeItems = marquee.length > 0 ? marquee : ["Soon will be released"];
  const galleryPreview = gallery.slice(0, 5);

  useEffect(() => {
    if (galleryPreview.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setGalleryIndex((current) => (current + 1) % galleryPreview.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [galleryPreview.length]);

  const showPreviousGallery = () => {
    setGalleryIndex((current) => (current - 1 + galleryPreview.length) % galleryPreview.length);
  };

  const showNextGallery = () => {
    setGalleryIndex((current) => (current + 1) % galleryPreview.length);
  };

  return (
    <div>
      {/* 1. Image Slider */}
      <ImageSlider slides={heroSlides.length > 0 ? heroSlides : sliderSlides} />

      <div className="marquee-shell overflow-hidden border-y border-[#d5a733] bg-[linear-gradient(90deg,#f3c446_0%,#f4d66d_25%,#edb928_50%,#f5ce68_75%,#efb72d_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(17,45,73,0.08)]">
        <div className="hero-marquee flex w-max min-w-full items-center gap-8 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#112d49] md:text-base">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <div key={`${item}-${index}`} className="hero-marquee-item flex items-center gap-2 whitespace-nowrap px-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#112d49] text-[10px] font-bold text-[#f6d46a] shadow-[0_0_12px_rgba(17,45,73,0.35)]">★</span>
              <span className="drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="prize-section bg-[#fffdfa] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="mb-9 text-center font-display text-3xl font-bold leading-tight text-[#ed5a00] md:text-4xl">
            Earn Scholarships and Prizes
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {prizeHighlights.map(({ title, description, Icon, tone }) => (
              <article key={title} className="prize-card group relative flex min-h-[300px] flex-col items-center overflow-hidden rounded-[24px] border border-[#f3e5c5] bg-[#fff7e5] px-5 pb-7 pt-6 text-center shadow-[0_10px_28px_rgba(23,59,95,0.10)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_18px_36px_rgba(23,59,95,0.16)]">
                <div className="prize-card-wave" aria-hidden="true" />
                <div className={`relative z-10 flex h-28 items-center justify-center ${tone}`}>
                  <Icon size={92} strokeWidth={1.35} className="transition duration-300 group-hover:scale-110 group-hover:-rotate-3" />
                </div>
                <h3 className="relative z-10 mt-4 max-w-[250px] font-display text-[1.55rem] font-bold leading-tight text-navy">
                  {title}
                </h3>
                <p className="relative z-10 mt-5 max-w-[280px] text-[0.98rem] leading-6 text-[#426078]">
                  {description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link to="/register" className="group inline-flex items-center gap-3 rounded-full bg-navy px-7 py-3.5 text-base font-semibold text-white shadow-[0_10px_22px_rgba(23,59,95,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-navy-light hover:shadow-[0_16px_28px_rgba(23,59,95,0.28)] sm:px-8">
              Register for SCORE 2026 now
              <ArrowRight size={21} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Sankalp Exam Info with Registration button */}
      <section className="relative overflow-hidden bg-[#fffdfa] py-14 md:py-20">
        <div className="pointer-events-none absolute -right-24 top-8 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#dce9f3] blur-3xl" />
        <div className="container-app relative">
          <div className="grid overflow-hidden rounded-[30px] border border-[#e9dfcf] bg-white shadow-[0_20px_55px_rgba(23,59,95,0.12)] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#f8f3e8_0%,#fffdfa_62%,#f4e8c9_100%)] p-6 sm:p-8 md:p-10">
              <div className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full border-[22px] border-gold/15" />
              <div className="absolute right-8 top-8 h-16 w-16 rounded-full bg-gold/15 blur-xl" />
              <div className="relative max-w-xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/75 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gold-dark shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_0_4px_rgba(243,185,61,0.18)]" /> Now open for registration
                </div>
                <h3 className="font-display text-2xl font-bold text-navy md:text-3xl">{examInfo.name}</h3>
                <p className="mt-4 max-w-lg text-sm leading-7 text-[#526b7e] md:text-base">Open to students of classes {examInfo.eligibleClasses}. Compete with young minds across {examInfo.centers} and earn scholarships, certificates and recognition.</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-semibold text-navy shadow-sm"><CalendarDays size={17} className="text-gold-dark" /> Exam: {examInfo.examDate}</div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-semibold text-navy shadow-sm"><CalendarDays size={17} className="text-gold-dark" /> Last date: {examInfo.registrationDeadline}</div>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/register" className="btn-primary">Registration <ArrowRight size={16} /></Link>
                  <Link to="/sankalp/exam-information" className="inline-flex items-center gap-2 rounded-md border-2 border-navy/15 px-6 py-3 font-bold text-navy transition hover:border-navy hover:bg-navy hover:text-white">Exam Details <ArrowRight size={16} /></Link>
                </div>
              </div>
            </div>

            <div className="bg-[#173b5f] p-6 text-white sm:p-8 md:p-10">
              <div className="mb-7 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-light">At a glance</p>
                  <h3 className="mt-1 font-display text-2xl font-bold">Exam Snapshot</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-gold-light"><GraduationCap size={23} /></div>
              </div>
              <dl className="space-y-0 text-sm">
                <div className="flex items-center justify-between gap-4 border-t border-white/15 py-4"><dt className="text-white/65">Registration Fee</dt><dd className="font-bold text-gold-light">₹{examInfo.fee}</dd></div>
                <div className="flex items-center justify-between gap-4 border-t border-white/15 py-4"><dt className="text-white/65">Eligible Classes</dt><dd className="text-right font-bold">{examInfo.eligibleClasses}</dd></div>
                <div className="flex items-start justify-between gap-4 border-t border-white/15 py-4"><dt className="text-white/65">Exam Pattern</dt><dd className="max-w-[15rem] text-right font-bold leading-5">{examInfo.pattern}</dd></div>
                <div className="flex items-center justify-between gap-4 border-y border-white/15 py-4"><dt className="text-white/65">Centers</dt><dd className="text-right font-bold">{examInfo.centers}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Awards & Recognition */}
      <section className="relative overflow-hidden bg-cream py-8 md:py-12">
        <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-gold/10" />
        <div className="container-app relative">
          <SectionHeading title="Awards & Recognition" center />
          {awardsLoading && <div className="flex items-center justify-center gap-3 py-12 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading recognitions...</div>}
          {!awardsLoading && awards.length === 0 && <p className="py-8 text-center text-muted">No recognitions have been published yet.</p>}
          {!awardsLoading && awards.length > 0 && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {awards.slice(0, 4).map((award, index) => {
              const Icon = awardIcons[index % awardIcons.length];
              const image = resolveImageUrl(award.image);
              return <article key={award.id} className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#ffe0c2] bg-white shadow-[0_12px_30px_rgba(11,37,69,0.08)] transition duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_18px_38px_rgba(255,109,0,0.15)]">
                <div className="relative h-56 overflow-hidden bg-[linear-gradient(145deg,#fff7ed,#f3f4f6)] sm:h-48">
                  {image ? <img src={image} alt={award.title} className="h-full w-full object-contain object-center transition duration-500 group-hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center bg-navy-light"><Icon size={56} className="text-white" strokeWidth={1.2} /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-white shadow-md"><CalendarDays size={15} /> {award.year || "Recognition"}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-dark"><Icon size={20} /></div>
                  <h3 className="text-lg font-bold leading-tight text-navy">{award.title}</h3>
                  {award.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{award.description}</p>}
                  <p className="mt-auto border-t border-slate-100 pt-4 text-sm text-muted">Awarded by <strong className="text-navy">{award.by}</strong></p>
                </div>
              </article>;
            })}
          </div>}
          <div className="mt-10 flex justify-center"><Link to="/awards" className="btn-outline">View More Awards <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      {/* 4. School Features & Counts */}
      <section className="section-pad bg-gradient-to-b from-slate-50 to-white">
        <div className="container-app">
          <SectionHeading
            title="Built For Better Outcomes"
            center
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-16 max-w-sm sm:max-w-none lg:max-w-6xl mx-auto">
            {schoolFeatures.map((f, idx) => {
              const Icon = icons[f.icon];
              const gradients = [
                "from-blue-500 via-blue-400 to-cyan-300",
                "from-purple-500 via-purple-400 to-pink-300",
                "from-emerald-500 via-emerald-400 to-teal-300",
                "from-orange-500 via-orange-400 to-rose-300",
              ];
              const gradient = gradients[idx % gradients.length];
              return (
                <div key={f.title} className={`group overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 sm:p-5 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/20 backdrop-blur-sm flex flex-col items-center text-center space-y-3`}>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                    <Icon size={24} strokeWidth={2.5} className="sm:block hidden" />
                    <Icon size={20} strokeWidth={2.5} className="sm:hidden block" />
                  </div>
                  <h3 className="font-bold text-white text-sm sm:text-base lg:text-lg leading-tight">{f.title}</h3>
                  <p className="text-white/85 text-xs sm:text-sm lg:text-base leading-snug">{f.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-cream rounded-3xl p-8 md:p-12">
            {featureCounts.map((c) => (
              <div key={c.label} className="text-center">
                <Counter value={c.value} suffix={c.suffix} />
                <p className="text-sm text-muted font-medium mt-2">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    {/* 5. Courses & Enroll button */}
<section className="relative overflow-hidden bg-[#f4f7fa] py-14 md:py-20">
  <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
  <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#dce9f3] blur-3xl" />
  <div className="container-app">

    {/* Center Heading */}
    <SectionHeading
      title="Our Courses"
      center
    />

    {/* <div className="mx-auto mb-8 flex max-w-3xl items-center justify-center gap-2 text-center text-sm text-muted">
      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
      Explore our latest programs, updated directly from the live course catalog.
    </div> */}

    {/* Courses Grid */}
    <div className="relative mt-8 grid items-stretch grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.slice(0, 3).map((c) => (
        <CourseCard key={c.id} course={c} showFullImage overlayMode />
      ))}
    </div>

    {/* View All Button */}
    <div className="flex justify-center mt-10">
      <Link to="/courses" className="btn-outline">
        View All Courses
      </Link>
    </div>

  </div>
</section>

   {/* 6. School Exam Toppers */}
<section className="relative overflow-hidden bg-[#f7f8fa] py-14 md:py-20">
  <div className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
  <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#dce9f3] blur-3xl" />
  <div className="container-app relative">
    <div className="mb-9 text-center">
      <div>
        <h2 className="text-center font-display text-3xl font-bold leading-tight text-[#ed5a00] md:text-4xl">Our Toppers</h2>
      </div>
    </div>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {toppers.slice(0, 4).map((t, index) => {
        const rank = t.rank || index + 1;
        return <article key={t.id} style={{ animationDelay: `${index * 90}ms` }} className="topper-reveal group relative overflow-hidden rounded-[24px] border border-[#e2e7ec] bg-white shadow-[0_12px_30px_rgba(23,59,95,0.10)] transition-all duration-500 hover:-translate-y-2 hover:border-gold/60 hover:shadow-[0_20px_42px_rgba(23,59,95,0.17)]">
          <div className="relative aspect-[1.05/1] overflow-hidden bg-[#e9eff3]">
            {t.image ? <img src={resolveImageUrl(t.image)} alt={t.name} className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" /> : <MissingImage className="h-full w-full" />}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/65 to-transparent" />
            <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-navy shadow-lg backdrop-blur-sm">
              <Trophy size={14} className="text-gold-dark" /> Rank #{rank}
            </div>
            <span className="absolute bottom-3 left-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-navy">Top achiever</span>
          </div>

          <div className="px-4 pb-5 pt-4">
            <h3 className="font-display text-lg font-bold leading-tight text-navy">{t.name}</h3>
            <p className="mt-1 text-sm text-muted">Class {t.className || t.post || "-"} · {t.year || "Sankalp Exam"}</p>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#edf0f3] pt-3">
              <span className="text-xs font-semibold text-gold-dark">Sankalp achiever</span>
              {t.score && <span className="rounded-full bg-[#f7f1df] px-2.5 py-1 text-xs font-bold text-gold-dark">{t.score}</span>}
            </div>
          </div>
        </article>;
      })}
    </div>

    <div className="mt-10 flex justify-center">
      <Link to="/toppers" className="group inline-flex items-center gap-2 rounded-full border-2 border-navy px-6 py-3 font-bold text-navy transition hover:-translate-y-1 hover:bg-navy hover:text-white hover:shadow-lg">
        View All Toppers <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  </div>
</section>

  {/* 7. Gallery */}
<section className="relative overflow-hidden bg-[#fffaf0] py-14 md:py-20">
  <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
  <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#dce9f3] blur-3xl" />
  <div className="container-app relative">
    <div className="mx-auto mb-8 max-w-2xl text-center">
      <h2 className="font-display text-3xl font-bold leading-tight text-[#ed5a00] md:text-4xl">Our Stories</h2>
    </div>

    {galleryPreview.length > 0 && (
      <div className="relative mx-auto max-w-6xl px-0 sm:px-10">
        <div className="relative flex h-[18rem] items-center justify-center overflow-hidden sm:h-[23rem] md:h-[27rem]">
          {galleryPreview.map((g, index) => {
            const offset = (index - galleryIndex + galleryPreview.length) % galleryPreview.length;
            const normalizedOffset = offset > galleryPreview.length / 2 ? offset - galleryPreview.length : offset;
            const isActive = normalizedOffset === 0;
            const isNeighbor = Math.abs(normalizedOffset) === 1;
            const image = g.images?.[0] ? resolveImageUrl(g.images[0]) : "";
            return (
              <div
                key={g.id}
                className={`gallery-story-card absolute left-1/2 top-1/2 w-[86%] max-w-[650px] overflow-hidden rounded-[22px] border bg-white shadow-[0_18px_45px_rgba(23,59,95,0.18)] transition-all duration-700 ease-out sm:w-[72%] md:w-[64%] ${isActive ? "z-20 border-gold/60 opacity-100" : isNeighbor ? "z-10 opacity-55" : "pointer-events-none z-0 opacity-0"}`}
                style={{ transform: `translate(calc(-50% + ${normalizedOffset * 62}%), -50%) scale(${isActive ? 1 : isNeighbor ? 0.78 : 0.65})` }}
              >
                {image ? <GalleryLightbox image={image} title={g.title} compact><img src={image} alt={g.title} className="aspect-[16/8] w-full object-cover transition duration-700 hover:scale-105" /></GalleryLightbox> : <MissingImage className="aspect-[16/8]" />}
                <div className="flex items-center justify-between gap-3 border-t border-[#eee3cf] bg-white px-4 py-3 sm:px-5">
                  <p className="truncate text-sm font-bold text-navy sm:text-base">{g.title || "Sankalp memory"}</p>
                  {isActive && <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-dark">Featured</span>}
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={showPreviousGallery} aria-label="Previous success story" className="absolute left-0 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5d6b5] bg-white text-navy shadow-lg transition hover:-translate-x-1 hover:bg-navy hover:text-white sm:flex"><ChevronLeft size={21} /></button>
        <button type="button" onClick={showNextGallery} aria-label="Next success story" className="absolute right-0 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5d6b5] bg-white text-navy shadow-lg transition hover:translate-x-1 hover:bg-navy hover:text-white sm:flex"><ChevronRight size={21} /></button>

        <div className="mt-5 flex items-center justify-center gap-2">
          {galleryPreview.map((g, index) => <button key={g.id} type="button" onClick={() => setGalleryIndex(index)} aria-label={`Show ${g.title || "success story"}`} className={`h-2 rounded-full transition-all duration-300 ${index === galleryIndex ? "w-8 bg-navy" : "w-2 bg-[#d9d9d9] hover:bg-gold"}`} />)}
        </div>
      </div>
    )}

    <div className="mt-9 flex justify-center">
      <Link to="/gallery" className="btn-outline">View All Gallery <ArrowRight size={16} /></Link>
    </div>
  </div>
</section>

  {/* 8. Faculties */}
<section className="section-pad">
  <div className="container-app">

    {/* Center Heading */}
    <SectionHeading
      title="Our Faculty"
      center
    />

    {/* Faculties Grid */}
    <div className="mt-10 grid items-stretch gap-6 sm:grid-cols-2 md:grid-cols-4">
            {faculties.slice(0, 4).map((f) => (
        <div
          key={f.id}
          className="
            card
            flex
            h-full
            flex-col
            overflow-hidden
            text-center
            group
            transition-all
            duration-500
            hover:-translate-y-2
            hover:shadow-2xl
            hover:ring-2
            hover:ring-gold/40
          "
        >
          <div className="px-3 pt-3">
            {f.image ? (
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={resolveImageUrl(f.image)}
                  alt={f.name}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
                <MissingImage className="h-full w-full" />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-center p-4">
            <h3 className="font-bold text-navy transition-colors duration-300 group-hover:text-gold">
              {f.name}
            </h3>

            <p className="text-xs text-gold-dark font-semibold transition-colors duration-300 group-hover:text-gold">
              {f.subject}
            </p>

            <p className="mt-1 text-xs text-muted">
              {f.experience ? `${f.experience} years experience` : "Experience not available"}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* View All Button */}
    <div className="flex justify-center mt-10">
      <Link to="/faculties" className="btn-outline">
        View All Faculties
      </Link>
    </div>

  </div>
</section>

      {/* 9. Student Testimonials */}
      <section className="relative overflow-hidden bg-[#f4f7fa] py-14 md:py-20">
        <div className="pointer-events-none absolute -left-24 top-8 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#dce9f3] blur-3xl" />
        <div className="container-app relative">
          <div className="content-reveal mx-auto mb-8 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold leading-tight text-[#ed5a00] sm:text-4xl md:text-4xl">
              What Our Students Say
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted md:text-base">Real experiences from students and families who have grown with Sankalp.</p>
          </div>
          <div className="grid items-stretch gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t, index) => (
              <article key={t.id} className="testimonial-reveal group relative flex h-full min-h-[17rem] flex-col overflow-hidden rounded-[24px] border border-[#e1e8ee] bg-white p-6 shadow-[0_12px_30px_rgba(23,59,95,0.09)] transition-all duration-500 hover:-translate-y-2 hover:border-gold/60 hover:shadow-[0_22px_44px_rgba(23,59,95,0.15)]" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold to-[#f7d77b] opacity-90" />
                <Quote className="testimonial-float mb-5 text-gold-dark" size={32} strokeWidth={1.8} />
                <p className="flex-1 text-sm leading-7 text-[#526b7e]">“{t.description || "No testimonial text available."}”</p>
                <div className="mt-7 flex items-center gap-3 border-t border-[#edf0f3] pt-4">
                  {t.image ? <img src={resolveImageUrl(t.image)} alt={t.name} className="h-12 w-12 rounded-full border-2 border-gold/60 object-cover transition-transform duration-300 group-hover:scale-110" /> : <MissingImage className="h-12 w-12 min-h-0 rounded-full" />}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy">{t.name}</p>
                    <p className="truncate text-xs text-muted">{[t.exam, t.post].filter(Boolean).join(" · ") || "Student"}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/testimonials" className="group inline-flex items-center gap-2 rounded-full border-2 border-navy px-6 py-3 font-bold text-navy transition hover:-translate-y-1 hover:bg-navy hover:text-white hover:shadow-[0_10px_22px_rgba(23,59,95,0.18)]">
              View All Testimonials <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Contact Us Form & Map */}
      <section className="relative overflow-hidden bg-[#f4f7fa] py-14 md:py-20">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#dce9f3] blur-3xl" />
        <div className="container-app relative grid items-start gap-8 md:grid-cols-2 md:gap-10">
          <div>
            <h2 className="mb-8 text-center font-display text-3xl font-bold leading-tight text-[#ed5a00] md:text-4xl">Get In Touch</h2>
            <ContactMiniForm />
          </div>
          <div className="h-fit self-start overflow-hidden rounded-[26px] border border-[#dfe7ed] bg-white shadow-[0_18px_42px_rgba(23,59,95,0.13)]">
            <div className="flex items-start justify-between gap-4 bg-navy px-5 py-5 text-white sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Find Us</p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">{contactInfo?.address || "Swargate, Pune"}</h2>
              </div>
              <MapPin className="mt-1 shrink-0 text-gold" size={24} />
            </div>
            <div className="aspect-[4/3] min-h-[260px] w-full sm:min-h-[320px]">
              <iframe
                title={`School location map - ${contactInfo?.address || "Swargate, Pune"}`}
                src={getMapEmbedUrl(contactInfo?.mapLink, contactInfo?.address || "Shri Shahu Prabodhini School, Swargate, Pune")}
                className="h-full w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={contactInfo?.mapLink || "https://www.google.com/maps/search/?api=1&query=Shri+Shahu+Prabodhini+School+Pune"}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 items-center justify-center border-t border-[#e6ebef] bg-white px-4 py-3 text-center text-sm font-semibold text-navy transition hover:bg-cream hover:text-gold-dark"
            >
              Open in Google Maps <MapPin size={16} className="ml-2 shrink-0 text-gold" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactMiniForm() {
  const [form, setForm] = useState({
    name: "",
    mobileNo: "",
    email: "",
    course: "",
    subject: "Home contact enquiry",
    academicYear: "",
    description: "",
  });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(e) {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.mobileNo)) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await submitContactForm(form);
      setSent(true);
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
        submitError?.response?.data?.error ||
        "Unable to send your message right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }
  if (sent) {
    return (
      <div className="card p-6 bg-cream text-navy font-semibold">
        Thank you! Your message has been received. Our team will contact you shortly.
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field" htmlFor="home-contact-name">Full Name</label>
          <input id="home-contact-name" name="name" value={form.name} onChange={updateField} required className="input-field" placeholder="Your name" />
        </div>
        <div>
          <label className="label-field" htmlFor="home-contact-mobile">Mobile No.</label>
          <input id="home-contact-mobile" name="mobileNo" value={form.mobileNo} onChange={updateField} required pattern="[0-9]{10}" maxLength="10" inputMode="numeric" className="input-field" placeholder="10-digit mobile" />
        </div>
      </div>
      <div>
        <label className="label-field" htmlFor="home-contact-email">Email</label>
        <input id="home-contact-email" name="email" value={form.email} onChange={updateField} type="email" className="input-field" placeholder="you@example.com" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field" htmlFor="home-contact-academic-year">Academic Year</label>
          <input id="home-contact-academic-year" name="academicYear" value={form.academicYear} onChange={updateField} className="input-field" placeholder="e.g. 2026-27" />
        </div>
        <div>
          <label className="label-field" htmlFor="home-contact-course">Course</label>
          <input id="home-contact-course" name="course" value={form.course} onChange={updateField} className="input-field" placeholder="Class or course" />
        </div>
      </div>
      <div>
        <label className="label-field" htmlFor="home-contact-subject">Subject</label>
        <input id="home-contact-subject" name="subject" value={form.subject} onChange={updateField} className="input-field" placeholder="What is your question about?" />
      </div>
      <div>
        <label className="label-field" htmlFor="home-contact-description">Message</label>
        <textarea id="home-contact-description" name="description" value={form.description} onChange={updateField} required rows={4} className="input-field" placeholder="How can we help?" />
      </div>
      {error && <p className="text-sm font-semibold text-maroon" role="alert">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Sending..." : "Send Message"}</button>
    </form>
  );
}
