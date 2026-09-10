import React, { useEffect, useState } from "react";
import { Eye, ImageOff, LoaderCircle, Target } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { API_BASE_URL } from "../utils/api.js";
import { fetchVisionMissions } from "../services/backendService.js";

function imageUrl(image) {
  if (!image) return "";
  return /^(https?:|data:|blob:)/i.test(image) ? image : `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

function DirectorImage({ src, alt }) {
  const [hasError, setHasError] = useState(false);
  if (!src || hasError) {
    return <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-full bg-[#f3e5d6] text-center text-[#b8752b] ring-8 ring-white shadow-xl"><ImageOff size={38} /><span className="text-sm">Image not available</span></div>;
  }
  return <img src={src} alt={alt} onError={() => setHasError(true)} className="aspect-square w-full rounded-full object-cover ring-8 ring-white shadow-[0_16px_35px_rgba(23,59,95,0.16)] transition duration-700 hover:-translate-y-2 hover:scale-[1.04] hover:shadow-[0_24px_45px_rgba(237,90,0,0.20)]" />;
}

function PrincipleCard({ type, icon: Icon, title, children }) {
  return <article className="content-reveal group rounded-[24px] border border-[#eadfce] border-t-4 border-t-[#e86516] bg-[#fffdf8] p-6 shadow-[0_12px_30px_rgba(23,59,95,0.08)] transition duration-500 hover:-translate-y-2 hover:border-[#e86516]/45 hover:shadow-[0_24px_45px_rgba(237,90,0,0.17)]"><div className="flex items-center justify-between"><Icon className="text-[#e86516] transition duration-500 group-hover:rotate-6 group-hover:scale-125" size={28} /><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8752b]">{type}</span></div><h2 className="mt-5 font-display text-2xl font-bold text-navy transition-colors duration-300 group-hover:text-[#e86516]">{title}</h2><p className="mt-3 whitespace-pre-line leading-7 text-muted">{children}</p></article>;
}

export default function VisionMission() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchVisionMissions().then((items) => active && setContent(items[0] || null)).catch(() => active && setError("Vision and mission information is temporarily unavailable.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return <div className="bg-[#f3f6f6]">
    <PageHeader title="Vision & Mission" crumb="Vision & Mission" />
    <section className="bg-[linear-gradient(180deg,#fffdf8_0%,#f3f6f6_100%)] py-5 md:py-8">
      <div className="container-app">
        {loading && <div className="flex min-h-64 items-center justify-center gap-3 rounded-[28px] bg-white text-muted shadow-[0_20px_60px_rgba(23,59,95,0.10)]"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading vision and mission...</div>}
        {!loading && error && <p className="rounded-[28px] bg-white py-16 text-center text-maroon shadow-[0_20px_60px_rgba(23,59,95,0.10)]">{error}</p>}
        {!loading && !error && !content && <p className="rounded-[28px] bg-white py-16 text-center text-muted shadow-[0_20px_60px_rgba(23,59,95,0.10)]">Vision and mission information has not been published yet.</p>}
        {!loading && !error && content && <>
          <div className="content-reveal group grid items-center gap-6 rounded-[30px] border border-[#eadfce] bg-[#fffdf8] p-4 shadow-[0_20px_55px_rgba(23,59,95,0.11)] transition duration-500 hover:border-[#e86516]/35 hover:shadow-[0_28px_65px_rgba(237,90,0,0.14)] sm:p-6 md:grid-cols-[300px_1fr] md:gap-10 lg:p-8">
            <div className="relative mx-auto w-full max-w-[250px] md:order-1"><div className="pointer-events-none absolute -inset-3 rounded-full border border-[#e3a04d]/35 opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />{content.directorImage ? <DirectorImage src={imageUrl(content.directorImage)} alt={content.directorName || "Director"} /> : <DirectorImage alt="Director" />}<p className="mt-4 text-center font-display text-lg font-bold text-navy transition-colors duration-300 group-hover:text-[#e86516]">{content.directorName || "Director"}</p></div>
            <div className="relative md:order-2 rounded-[22px] border border-[#f0e4d4] bg-[linear-gradient(135deg,#fffaf0_0%,#fffdf8_100%)] p-5 shadow-sm transition duration-500 hover:-translate-y-1 hover:border-[#e86516]/35 hover:shadow-[0_16px_32px_rgba(237,90,0,0.12)] sm:p-7"><div className="pointer-events-none absolute right-5 top-4 h-12 w-12 rounded-full border border-[#e3a04d]/30 transition duration-500 hover:rotate-12" /><span className="eyebrow">A message from our leadership</span><p className="mt-2 text-sm font-semibold leading-6 text-navy md:text-base md:leading-7">{content.directorMessage || "No director message available."}</p>{content.description && <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{content.description}</p>}</div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2"><PrincipleCard type="Our direction" icon={Eye} title="Our vision">{content.vision || "No vision available."}</PrincipleCard><PrincipleCard type="Our purpose" icon={Target} title="Our mission">{content.mission || "No mission available."}</PrincipleCard></div>
        </>}
      </div>
    </section>
  </div>;
}
