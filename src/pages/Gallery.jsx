import React, { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Camera, ChevronLeft, ChevronRight, ImageOff, LoaderCircle, MapPin } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { API_BASE_URL } from "../utils/api.js";
import { fetchGallery } from "../services/backendService.js";
import GalleryLightbox from "../components/GalleryLightbox.jsx";

function imageUrl(image) {
  if (!image) return "";
  return /^(https?:|data:|blob:)/i.test(image) ? image : `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

export default function Gallery() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState("All");

  useEffect(() => {
    let active = true;
    fetchGallery().then((items) => active && setGalleries(items)).catch(() => active && setError("Gallery is temporarily unavailable. Please check back soon.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const eventTypes = ["All", ...new Set(galleries.map((gallery) => gallery.eventName).filter(Boolean))];
  const filteredGalleries = selectedEvent === "All" ? galleries : galleries.filter((gallery) => gallery.eventName === selectedEvent);
  const featured = galleries[featuredIndex] || galleries[0];
  const featuredImages = featured?.images || [];
  const featuredImage = featuredImages[0] ? imageUrl(featuredImages[0]) : "";

  useEffect(() => {
    if (galleries.length < 2) return undefined;
    const timer = window.setInterval(() => setFeaturedIndex((current) => (current + 1) % galleries.length), 5500);
    return () => window.clearInterval(timer);
  }, [galleries.length]);

  const moveFeatured = (direction) => {
    setFeaturedIndex((current) => (current + direction + galleries.length) % galleries.length);
  };

  return <div className="bg-[#eef3f4]">
    <PageHeader title="Gallery" crumb="Gallery" />
    <section className="relative py-5 pb-10 sm:py-8 sm:pb-14 md:py-10">
      <div className="container-app relative">
        {loading && <div className="flex min-h-64 items-center justify-center gap-3 rounded-[28px] bg-white text-muted shadow-[0_20px_60px_rgba(24,40,45,0.12)]"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading gallery...</div>}
        {!loading && error && <p className="rounded-[28px] bg-white py-16 text-center text-maroon shadow-[0_20px_60px_rgba(24,40,45,0.12)]">{error}</p>}
        {!loading && !error && galleries.length === 0 && <p className="rounded-[28px] bg-white py-16 text-center text-muted shadow-[0_20px_60px_rgba(24,40,45,0.12)]">No gallery events have been published yet.</p>}

        {!loading && !error && galleries.length > 0 && <>
          <div className="mb-3 flex items-center gap-3 px-1"><span className="h-px w-8 bg-[#e86516]" /><h1 className="whitespace-nowrap font-display text-base font-bold text-[#18282d] sm:text-lg">School moments, beautifully preserved.</h1><span className="h-px flex-1 bg-[#ddd8cb]" /></div>
          <div className="grid overflow-hidden rounded-[24px] border border-white/70 bg-[#fdfbf6] shadow-[0_18px_45px_rgba(24,40,45,0.15)] lg:grid-cols-[1.35fr_0.65fr]">
            <div className="relative min-h-[11rem] overflow-hidden bg-[#24383b] sm:min-h-[13rem] lg:min-h-[15rem]">
              {featuredImage ? <GalleryLightbox image={featuredImage} title={featured.title}><img src={featuredImage} alt={featured.title} className="h-full w-full object-cover transition duration-1000 hover:scale-105" /></GalleryLightbox> : <div className="flex h-full items-center justify-center text-white/60"><ImageOff size={42} /></div>}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#101d21]/90 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ffd98d]"><Camera size={14} /> Featured story</p>
                <h2 className="max-w-2xl font-display text-lg font-bold leading-tight sm:text-xl">{featured.title}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-white/75"><CalendarDays size={15} /> {[featured.month, featured.year].filter(Boolean).join(" ") || "School memories"}</p>
              </div>
              {galleries.length > 1 && <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6"><button type="button" onClick={() => moveFeatured(-1)} aria-label="Previous featured story" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur transition hover:bg-[#f3bd63] hover:text-[#18282d]"><ChevronLeft size={19} /></button><button type="button" onClick={() => moveFeatured(1)} aria-label="Next featured story" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur transition hover:bg-[#f3bd63] hover:text-[#18282d]"><ChevronRight size={19} /></button></div>}
            </div>
            <div className="flex flex-col justify-between bg-[#fdfbf6] p-4 sm:p-5">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8752b]">Featured frames</p><h3 className="mt-1 font-display text-xl font-bold leading-tight text-[#18282d]">Moments in motion.</h3></div>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">{featuredImages.slice(0, 4).map((image, index) => <GalleryLightbox key={`${featured.id}-featured-${index}`} image={imageUrl(image)} title={`${featured.title} ${index + 1}`}><img src={imageUrl(image)} alt={`${featured.title} ${index + 1}`} className="aspect-square w-full max-w-[7rem] rounded-lg object-cover transition duration-500 hover:scale-105" /></GalleryLightbox>)}</div>
              <div className="mt-4 flex items-center justify-between border-t border-[#e7dfd1] pt-3 text-[11px] text-[#607276]"><span className="flex items-center gap-1.5"><MapPin size={13} className="text-[#d87838]" /> Shri Shahu Prabodhini</span><span>{featuredImages.length} frames</span></div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8752b]">Explore the archive</p><h2 className="mt-2 font-display text-3xl font-bold text-[#18282d] sm:text-4xl">Every event has a story.</h2></div><div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter gallery events">{eventTypes.map((eventType) => <button key={eventType} type="button" onClick={() => setSelectedEvent(eventType)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${selectedEvent === eventType ? "border-[#18282d] bg-[#18282d] text-white shadow-lg" : "border-[#d7deda] bg-white text-[#355156] hover:border-[#d87838] hover:text-[#b05b25]"}`}>{eventType}</button>)}</div></div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filteredGalleries.map((gallery, index) => {
            const images = gallery.images || [];
            const image = images[0] ? imageUrl(images[0]) : "";
            return <article key={gallery.id} className="content-reveal group overflow-hidden rounded-[24px] border border-[#e1e7e4] bg-white shadow-[0_12px_30px_rgba(24,40,45,0.08)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_22px_44px_rgba(24,40,45,0.15)]" style={{ animationDelay: `${index * 75}ms` }}>
              <div className="relative aspect-[1.35/1] overflow-hidden bg-[#dfe8e6]">{image ? <GalleryLightbox image={image} title={gallery.title}><img src={image} alt={gallery.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></GalleryLightbox> : <div className="flex h-full items-center justify-center text-[#6e8585]"><ImageOff size={34} /></div>}<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#18282d]/70 via-transparent to-transparent opacity-70" /><span className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#355156]">{gallery.eventName || "School event"}</span><span className="absolute bottom-4 right-4 rounded-full bg-[#f3bd63] px-2.5 py-1 text-[10px] font-bold text-[#18282d]">{images.length} {images.length === 1 ? "frame" : "frames"}</span></div>
              <div className="p-5"><h3 className="font-display text-xl font-bold leading-tight text-[#18282d]">{gallery.title}</h3><div className="mt-3 flex flex-wrap gap-4 text-xs text-[#607276]">{(gallery.month || gallery.year) && <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-[#d87838]" /> {[gallery.month, gallery.year].filter(Boolean).join(" ")}</span>}<span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#d87838]" /> Pune</span></div><div className="mt-5 flex items-center justify-end text-[#b05b25]"><ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div></div>
            </article>;
          })}</div>
        </>}
      </div>
    </section>
  </div>;
}
