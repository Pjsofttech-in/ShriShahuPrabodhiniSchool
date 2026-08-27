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
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-full bg-navy text-center text-white/80 ring-8 ring-white shadow-xl">
        <ImageOff className="text-gold" size={38} />
        <span className="text-sm">Image not available</span>
      </div>
    );
  }

  return <img src={src} alt={alt} className="aspect-square w-full rounded-full object-cover ring-8 ring-white shadow-xl" onError={() => setHasError(true)} />;
}

export default function VisionMission() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; fetchVisionMissions().then((items) => active && setContent(items[0] || null)).catch(() => active && setError("Vision and mission information is temporarily unavailable.")).finally(() => active && setLoading(false)); return () => { active = false; }; }, []);

  return <div><PageHeader title="Vision & Mission" crumb="Vision & Mission" /><section className="bg-cream py-8 md:py-12"><div className="container-app">
    {loading && <div className="flex justify-center gap-3 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading vision and mission...</div>}
    {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
    {!loading && !error && !content && <p className="py-16 text-center text-muted">Vision and mission information has not been published yet.</p>}
    {!loading && !error && content && <><div className="grid items-center gap-10 md:grid-cols-[250px_1fr] lg:gap-14"><div className="mx-auto w-full max-w-[220px]">{content.directorImage ? <DirectorImage src={imageUrl(content.directorImage)} alt={content.directorName || "Director"} /> : <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-full bg-navy text-center text-white/80 ring-8 ring-white shadow-xl"><ImageOff className="text-gold" size={38} /><span className="text-sm">Image not available</span></div>}<p className="mt-4 text-center font-bold text-navy">{content.directorName || "Director"}</p></div><div className="bg-white p-6 shadow-sm md:p-8"><span className="eyebrow">A message from our leadership</span><p className="mt-2 text-xs font-semibold leading-5 text-navy md:text-sm md:leading-6">{content.directorMessage || "No director message available."}</p>{content.description && <p className="mt-4 whitespace-pre-line text-xs leading-6 text-muted md:text-sm md:leading-7">{content.description}</p>}</div></div><div className="mt-8 grid gap-5 md:grid-cols-2"><article className="content-reveal border-t-4 border-gold bg-white p-6 shadow-sm"><Eye className="text-gold-dark" size={28} /><h2 className="mt-4 text-2xl font-bold text-navy">Our vision</h2><p className="mt-3 whitespace-pre-line leading-7 text-muted">{content.vision || "No vision available."}</p></article><article className="content-reveal border-t-4 border-maroon bg-white p-6 shadow-sm"><Target className="text-maroon" size={28} /><h2 className="mt-4 text-2xl font-bold text-navy">Our mission</h2><p className="mt-3 whitespace-pre-line leading-7 text-muted">{content.mission || "No mission available."}</p></article></div></>}
  </div></section></div>;
}
