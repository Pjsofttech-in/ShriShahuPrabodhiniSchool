import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, Target, MapPin, FileCheck2, ArrowRight, CalendarDays,
  Quote, MapPinned, ImageOff, BookOpen, Zap, Globe, CheckCircle,
} from "lucide-react";
import ImageSlider from "../components/ImageSlider.jsx";
import {
  sliderSlides, featureCounts, schoolFeatures, examInfo, schoolInfo,
} from "../data/siteData.js";
import {
  fetchCourses, fetchFaculties, fetchGallery, fetchTestimonials,
  fetchToppers, fetchVisionMissions, fetchHeroSections,
} from "../services/backendService.js";
import { API_BASE_URL } from "../utils/api.js";

const icons = { GraduationCap, Target, MapPin, FileCheck2, BookOpen, Zap, Globe, CheckCircle };

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
    <div className={`mb-10 ${center ? "text-center max-w-2xl mx-auto" : ""}`}>
      <span className={`eyebrow ${eyebrowClassName}`}>
        {eyebrow}
      </span>

      <h2
        className={`text-2xl md:text-4xl font-bold text-navy ${titleClassName}`}
      >
        {title}
      </h2>

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

function MissingImage({ className = "" }) {
  return <div className={`flex h-full min-h-24 flex-col items-center justify-center gap-2 bg-navy-light text-white/70 ${className}`}><ImageOff className="text-gold" size={28} /><span className="text-xs">Image not available</span></div>;
}

function DirectorImage({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <MissingImage className="min-h-full rounded-full" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export default function Home() {
  const [liveData, setLiveData] = React.useState({ heroSections: [], courses: [], toppers: [], gallery: [], faculties: [], testimonials: [], visionMission: null });

  React.useEffect(() => {
    let active = true;
    Promise.allSettled([fetchHeroSections(), fetchCourses(), fetchToppers(), fetchGallery(), fetchFaculties(), fetchTestimonials(), fetchVisionMissions()]).then((results) => {
      if (!active) return;
      const [heroResult, coursesResult, toppersResult, galleryResult, facultiesResult, testimonialsResult, visionResult] = results;
      setLiveData({
        heroSections: heroResult.status === "fulfilled" ? heroResult.value : [],
        courses: coursesResult.status === "fulfilled" ? coursesResult.value : [],
        toppers: toppersResult.status === "fulfilled" ? toppersResult.value : [],
        gallery: galleryResult.status === "fulfilled" ? galleryResult.value : [],
        faculties: facultiesResult.status === "fulfilled" ? facultiesResult.value : [],
        testimonials: testimonialsResult.status === "fulfilled" ? testimonialsResult.value : [],
        visionMission: visionResult.status === "fulfilled" ? visionResult.value[0] || null : null,
      });
    });
    return () => { active = false; };
  }, []);

  const { heroSections, courses, toppers, gallery, faculties, testimonials, visionMission } = liveData;
  const heroSlides = heroSections
    .sort((first, second) => first.priority - second.priority);

  const directorMessage = (visionMission?.directorMessage || "Every child carries a spark — Sankalp helps it become a flame.").trim();
  const directorPreview = directorMessage.length > 220
    ? `${directorMessage.slice(0, 220).trim().replace(/\s+\S*$/, "")}...`
    : directorMessage;

  return (
    <div>
      {/* 1. Image Slider */}
      <ImageSlider slides={heroSlides.length > 0 ? heroSlides : sliderSlides} />

      {/* 2. Principal / Sanchalk / Director Message */}
      <section className="section-pad bg-cream">
        <div className="container-app grid gap-10 md:grid-cols-[250px_1fr] md:items-center lg:gap-14">
          <div className="relative mx-auto w-full max-w-[220px] md:max-w-none">
            <div className="h-56 w-56 overflow-hidden rounded-full ring-8 ring-white shadow-xl md:h-64 md:w-64">
              {visionMission?.directorImage ? (
                <DirectorImage src={resolveImageUrl(visionMission.directorImage)} alt={visionMission.directorName || "Director"} />
              ) : (
                <MissingImage className="min-h-full rounded-full" />
              )}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-4 py-1.5 text-[10px] font-bold text-navy-dark shadow-md md:text-xs">
              Director's Message
            </div>
          </div>
          <div>
            <span className="eyebrow">A Word From Our Sanchalak</span>
            <h2 className="mb-3 line-clamp-4 text-[0.72rem] font-bold leading-[1.5] tracking-[-0.02em] text-navy md:text-[0.8rem]">
              {directorPreview}
            </h2>

            <p className="mb-4 hidden text-[0.7rem] leading-relaxed text-muted md:block md:text-xs">
              {visionMission?.description || "Shri Shahu Prabodhini stands beside students across rural and urban Maharashtra, helping every child discover their potential and earn a fair chance to shine."}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-display text-xs font-semibold text-navy md:text-sm">— {visionMission?.directorName || "Director"}, Director</p>
              <Link to="/vision-mission" className="inline-flex items-center justify-center gap-1 rounded-md bg-gold px-3.5 py-2 text-[11px] font-bold text-navy-dark shadow-sm transition hover:bg-gold-dark hover:text-white">
                Read More <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sankalp Exam Info with Registration button */}
      <section className="section-pad bg-navy relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-72 h-72 bg-gold/10 rounded-full" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-gold/10 rounded-full" />
        <div className="container-app relative grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="eyebrow">Now Open</span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">{examInfo.name}</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Open to students of classes {examInfo.eligibleClasses}. Compete with the finest
              young minds across {examInfo.centers} and win scholarships, certificates &amp; recognition.
            </p>
            <ul className="grid grid-cols-2 gap-4 mb-8">
              <li className="flex items-center gap-2 text-white/85 text-sm"><CalendarDays size={16} className="text-gold" /> Exam: {examInfo.examDate}</li>
              <li className="flex items-center gap-2 text-white/85 text-sm"><CalendarDays size={16} className="text-gold" /> Last Date: {examInfo.registrationDeadline}</li>
            </ul>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary">Registration <ArrowRight size={16} /></Link>
              <Link to="/sankalp/exam-information" className="border-2 border-white/30 text-white font-bold px-6 py-3 rounded-md hover:bg-white/10 transition">
                Exam Details
              </Link>
            </div>
          </div>
          <div className="card p-6 md:p-8 bg-white/95">
            <h3 className="font-display font-bold text-navy text-lg mb-4">Exam Snapshot</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-black/5 pb-2"><dt className="text-muted">Registration Fee</dt><dd className="font-bold text-navy">₹{examInfo.fee}</dd></div>
              <div className="flex justify-between border-b border-black/5 pb-2"><dt className="text-muted">Eligible Classes</dt><dd className="font-bold text-navy">{examInfo.eligibleClasses}</dd></div>
              <div className="flex justify-between border-b border-black/5 pb-2"><dt className="text-muted">Exam Pattern</dt><dd className="font-bold text-navy text-right max-w-[60%]">{examInfo.pattern}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Centers</dt><dd className="font-bold text-navy">{examInfo.centers}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* 4. School Features & Counts */}
      <section className="section-pad bg-gradient-to-b from-slate-50 to-white">
        <div className="container-app">
          <SectionHeading
            eyebrow="FEATURES"
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
<section className="section-pad bg-cream">
  <div className="container-app">

    {/* Center Heading */}
    <SectionHeading
      eyebrow="Programs"
      title="Our Courses"
      center
    />

    {/* Courses Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
      {courses.slice(0, 3).map((c) => (
        <div
          key={c.id}
          className="
            card
            overflow-hidden
            group
            transition-all
            duration-500
            hover:-translate-y-2
            hover:shadow-2xl
            hover:ring-2
            hover:ring-gold/40
            rounded-2xl
          "
        >
          <div className="h-40 overflow-hidden bg-slate-100">
            {c.image ? <img src={resolveImageUrl(c.image)} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <MissingImage />}
          </div>

          <div className="p-5">
            <h3 className="font-bold text-navy text-base mb-2 transition-colors duration-300 group-hover:text-gold line-clamp-2">
              {c.name}
            </h3>

            <p className="text-xs text-muted mb-3 line-clamp-2">
              {c.desc}
            </p>

            <div className="flex justify-between items-center text-xs text-muted mb-4">
              <span className="bg-slate-100 px-2 py-1 rounded-md text-[10px]">{c.duration}</span>
              <span className="font-bold text-gold text-xs">
                {c.fee}
              </span>
            </div>

            <Link
              to="/register"
              className="btn-primary w-full justify-center transition-transform duration-300 group-hover:scale-[1.02] text-xs"
            >
              Enroll Now
            </Link>
          </div>
        </div>
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
<section className="section-pad">
  <div className="container-app">

    {/* Center Heading */}
    <SectionHeading
      eyebrow="Hall of Fame"
      title="Our Toppers"
      center
    />

    {/* Toppers Grid */}
    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10">
      {toppers.slice(0, 4).map((t) => (
        <div
          key={t.id}
          className="
            card
            overflow-hidden
            text-center
            relative
            group
            transition-all
            duration-500
            hover:-translate-y-2
            hover:shadow-2xl
            hover:ring-2
            hover:ring-gold/40
          "
        >
          {/* Score Badge */}
          <div className="absolute top-3 right-3 bg-ribbon text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow transition-transform duration-300 group-hover:scale-110">
            {t.score}
          </div>

          {/* Student Image */}
          {t.image ? <img src={resolveImageUrl(t.image)} alt={t.name} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" /> : <MissingImage className="h-48" />}

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-navy transition-colors duration-300 group-hover:text-gold">
              {t.name}
            </h3>

            <p className="text-xs text-muted">
              Class {t.className || t.post || "-"} · {t.year || "Sankalp Exam"}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* View All Button */}
    <div className="flex justify-center mt-10">
      <Link to="/toppers" className="btn-outline">
        View All Toppers
      </Link>
    </div>

  </div>
</section>

  {/* 7. Gallery */}
<section className="section-pad bg-cream">
  <div className="container-app">

    {/* Center Heading */}
    <SectionHeading
      eyebrow="Moments"
      title="Gallery"
      center
    />

    {/* Gallery Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
      {gallery.slice(0, 4).map((g) => (
        <div
          key={g.id}
          className="
            relative
            rounded-xl
            overflow-hidden
            group
            h-44
            transition-all
            duration-500
            hover:-translate-y-2
            hover:shadow-2xl
            hover:ring-2
            hover:ring-gold/40
          "
        >
          {g.images?.[0] ? <img src={resolveImageUrl(g.images[0])} alt={g.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <MissingImage />}

          <div className="absolute inset-0 bg-navy-dark/0 group-hover:bg-navy-dark/50 transition-colors duration-500 flex items-end p-3">
            <p className="text-white text-xs font-semibold opacity-0 translate-y-3 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              {g.title}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* View All Button */}
    <div className="flex justify-center mt-10">
      <Link to="/gallery" className="btn-outline">
        View All Gallery
      </Link>
    </div>

  </div>
</section>

  {/* 8. Faculties */}
<section className="section-pad">
  <div className="container-app">

    {/* Center Heading */}
    <SectionHeading
      eyebrow="Our Mentors"
      title="Experties"
      center
    />

    {/* Faculties Grid */}
    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {faculties.slice(0, 4).map((f) => (
        <div
          key={f.id}
          className="
            card
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
          {f.image ? <img src={resolveImageUrl(f.image)} alt={f.name} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" /> : <MissingImage className="h-48" />}

          <div className="p-4">
            <h3 className="font-bold text-navy transition-colors duration-300 group-hover:text-gold">
              {f.name}
            </h3>

            <p className="text-xs text-gold-dark font-semibold transition-colors duration-300 group-hover:text-gold">
              {f.subject}
            </p>

            <p className="text-xs text-muted mt-1">
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
      <section className="section-pad bg-navy">
        <div className="container-app ">
        <SectionHeading
  eyebrow="Voices"
  title="What Our Students Say"
  center
  titleClassName="text-white"
/>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t) => (
              <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-6 relative">
                <Quote className="text-gold mb-3" size={26} />
                <p className="text-white/85 text-sm leading-relaxed mb-5">"{t.description || "No testimonial text available."}"</p>
                <div className="flex items-center gap-3">
                  {t.image ? <img src={resolveImageUrl(t.image)} alt={t.name} className="w-11 h-11 rounded-full object-cover" /> : <MissingImage className="h-11 w-11 min-h-0 rounded-full" />}
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-white/50 text-xs">{[t.exam, t.post].filter(Boolean).join(" · ") || "Student"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/testimonials" className="border-2 border-white/30 text-white font-bold px-6 py-3 rounded-md hover:bg-white/10 transition inline-flex">
              View All Testimonials
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Contact Us Form & Map */}
      <section className="section-pad">
        <div className="container-app grid md:grid-cols-2 gap-10">
          <div>
            <SectionHeading eyebrow="Get In Touch" title="Contact Us" desc="Have a question about admissions, centers or results? Send us a message." />
            <ContactMiniForm />
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg border border-black/5 min-h-[360px]">
            <iframe
              title="School location map"
              src={schoolInfo.mapEmbed}
              className="w-full h-full min-h-[360px]"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactMiniForm() {
  const [sent, setSent] = useState(false);
  function submit(e) {
    e.preventDefault();
    setSent(true);
  }
  if (sent) {
    return (
      <div className="card p-6 bg-cream text-navy font-semibold">
        Thank you! Your message has been received. Our team will contact you shortly.
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="card p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Full Name</label>
          <input required className="input-field" placeholder="Your name" />
        </div>
        <div>
          <label className="label-field">Mobile No.</label>
          <input required className="input-field" placeholder="10-digit mobile" />
        </div>
      </div>
      <div>
        <label className="label-field">Email</label>
        <input type="email" className="input-field" placeholder="you@example.com" />
      </div>
      <div>
        <label className="label-field">Message</label>
        <textarea required rows={4} className="input-field" placeholder="How can we help?" />
      </div>
      <button className="btn-primary w-full justify-center">Send Message</button>
    </form>
  );
}
