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
  fetchToppers, fetchHeroSections, fetchContactInfo, submitContactForm,
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

function ColoredTitle({ text, className = "" }) {
  const words = text.split(" ");
  return (
    <h2 className={`text-2xl md:text-4xl font-bold ${className}`}>
      {words.map((word, idx) => (
        <span key={idx} className={idx % 2 === 0 ? "text-gold" : "text-navy"}>
          {word}{idx < words.length - 1 ? " " : ""}
        </span>
      ))}
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
    <div className={`mb-10 ${center ? "text-center max-w-2xl mx-auto" : ""}`}>
      <span className={`eyebrow ${eyebrowClassName}`}>
        {eyebrow}
      </span>

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

function getMapEmbedUrl(mapLink) {
  const value = String(mapLink || "").trim();
  if (/^(https?:\/\/)?(www\.)?openstreetmap\.org\/export\/embed/i.test(value)) return value;
  if (/google\.com\/maps\/embed/i.test(value)) return value;
  return "https://www.openstreetmap.org/export/embed.html?bbox=73.855%2C18.493%2C73.885%2C18.525&layer=mapnik&marker=18.509%2C73.870";
}

function MissingImage({ className = "" }) {
  return <div className={`flex h-full min-h-24 flex-col items-center justify-center gap-2 bg-navy-light text-white/70 ${className}`}><ImageOff className="text-gold" size={28} /><span className="text-xs">Image not available</span></div>;
}

export default function Home() {
  const [liveData, setLiveData] = React.useState({ heroSections: [], courses: [], toppers: [], gallery: [], faculties: [], testimonials: [], contactInfo: null });

  React.useEffect(() => {
    let active = true;
    Promise.allSettled([fetchHeroSections(), fetchCourses(), fetchToppers(), fetchGallery(), fetchFaculties(), fetchTestimonials(), fetchContactInfo()]).then((results) => {
      if (!active) return;
      const [heroResult, coursesResult, toppersResult, galleryResult, facultiesResult, testimonialsResult, contactResult] = results;
      setLiveData({
        heroSections: heroResult.status === "fulfilled" ? heroResult.value : [],
        courses: coursesResult.status === "fulfilled" ? coursesResult.value : [],
        toppers: toppersResult.status === "fulfilled" ? toppersResult.value : [],
        gallery: galleryResult.status === "fulfilled" ? galleryResult.value : [],
        faculties: facultiesResult.status === "fulfilled" ? facultiesResult.value : [],
        testimonials: testimonialsResult.status === "fulfilled" ? testimonialsResult.value : [],
        contactInfo: contactResult.status === "fulfilled" ? contactResult.value : null,
      });
    });
    return () => { active = false; };
  }, []);

  const { heroSections, courses, toppers, gallery, faculties, testimonials, contactInfo } = liveData;
  const heroSlides = heroSections
    .sort((first, second) => first.priority - second.priority);

  return (
    <div>
      {/* 1. Image Slider */}
      <ImageSlider slides={heroSlides.length > 0 ? heroSlides : sliderSlides} />

      {/* 2. Sankalp Exam Info with Registration button */}
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
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {courses.slice(0, 4).map((c) => (
        <div key={c.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ffd8b5] bg-white shadow-[0_14px_32px_rgba(15,35,82,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff9a4d] hover:shadow-[0_18px_40px_rgba(255,109,0,0.16)]">
          <div className="relative aspect-[16/9] overflow-hidden bg-navy-dark">
            {c.image ? <img src={resolveImageUrl(c.image)} alt={c.name} className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" /> : <MissingImage className="h-full w-full" />}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-dark/80 to-transparent px-4 pb-3 pt-8">
              <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">Sankalp Course</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col border-t border-[#ffead8] p-5">
            <h3 className="mb-2 text-base font-bold text-navy">{c.name}</h3>
            <p className="mb-4 text-xs leading-5 text-muted line-clamp-3">{c.desc}</p>
            <div className="mb-4 flex items-center justify-between text-xs text-muted">
              <span>{c.duration}</span>
              <span className="font-bold text-navy">{c.fee}</span>
            </div>
            <Link to="/register" className="btn-primary w-full justify-center">Enroll Now</Link>
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
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {toppers.slice(0, 4).map((t, index) => (
        <div
          key={t.id}
          style={{ animationDelay: `${index * 90}ms` }}
          className="
            topper-reveal
            mx-auto
            flex
            h-full
            flex-col
            w-full
            max-w-none
            overflow-hidden
            rounded-[1.25rem]
            border
            border-gold/20
            bg-white
            text-center
            shadow-[0_8px_24px_rgba(11,37,69,0.08)]
            transition-all
            duration-500
            hover:-translate-y-1
            hover:border-gold/70
            hover:ring-2
            hover:ring-gold/20
            hover:shadow-[0_18px_40px_rgba(11,37,69,0.12)]
          "
        >
          {/* Student Image */}
          <div className="relative aspect-[1.08/1] w-full overflow-hidden bg-[#e9e9e9] ring-1 ring-inset ring-white/80">
            {t.image ? <img src={resolveImageUrl(t.image)} alt={t.name} className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" /> : <MissingImage className="h-full w-full" />}
          </div>

          {/* Content */}
          <div className="px-4 pb-4 pt-4">
            <h3 className="text-[1.05rem] font-bold leading-tight text-navy">
              {t.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
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
      title="Our Gallery"
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
      title="Our Experties"
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
      <section className="section-pad bg-navy">
        <div className="container-app ">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="eyebrow">Voices</span>
          <h2 className="text-2xl md:text-4xl font-bold">
            <span className="text-gold">What</span> <span className="text-white">Our</span> <span className="text-gold">Students</span> <span className="text-white">Say</span>
          </h2>
        </div>
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
          <div className="overflow-hidden rounded-xl bg-navy shadow-lg">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 text-white sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Find Us</p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">{contactInfo?.address || "Swargate, Pune"}</h2>
              </div>
              <MapPin className="mt-1 shrink-0 text-gold" size={24} />
            </div>
            <div className="aspect-[4/3] min-h-[260px] w-full sm:min-h-[320px] md:aspect-auto md:h-[420px]">
              <iframe
                title={`School location map - ${contactInfo?.address || "Swargate, Pune"}`}
                src={getMapEmbedUrl(contactInfo?.mapLink)}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={contactInfo?.mapLink || "https://www.google.com/maps/search/?api=1&query=Swargate%2C%20Pune"}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 items-center justify-center border-t border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#263238] hover:text-gold"
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
