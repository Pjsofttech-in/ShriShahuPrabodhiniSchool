import React, { useEffect, useState } from "react";
import { CalendarDays, ImageOff, LoaderCircle, MapPin } from "lucide-react";
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

  useEffect(() => {
    let active = true;
    fetchGallery().then((items) => active && setGalleries(items)).catch(() => active && setError("Gallery is temporarily unavailable. Please check back soon.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return <div><PageHeader title="Gallery" crumb="Gallery" /><section className="bg-cream py-8 md:py-12"><div className="container-app">
    {loading && <div className="flex justify-center gap-3 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading gallery...</div>}
    {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
    {!loading && !error && galleries.length === 0 && <p className="py-16 text-center text-muted">No gallery events have been published yet.</p>}
    {!loading && !error && galleries.length > 0 && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {galleries.map((gallery, index) => <article key={gallery.id} className="content-reveal overflow-visible bg-white shadow-[0_8px_30px_rgba(11,37,69,0.08)]" style={{ animationDelay: `${index * 80}ms` }}>
        <div className="grid grid-cols-2 gap-1 overflow-visible bg-navy p-1">{gallery.images.length > 0 ? gallery.images.slice(0, 4).map((image, imageIndex) => <GalleryLightbox key={`${gallery.id}-${imageIndex}`} image={imageUrl(image)} title={`${gallery.title} ${imageIndex + 1}`}><img src={imageUrl(image)} alt={`${gallery.title} ${imageIndex + 1}`} className="relative z-0 aspect-square w-full object-cover transition duration-500 hover:z-20 hover:scale-[1.5]" /></GalleryLightbox>) : <div className="col-span-2 flex aspect-[2/1] flex-col items-center justify-center gap-2 bg-navy-light text-center text-white/80"><ImageOff className="text-gold" size={30} /><span className="text-sm">Image not available</span></div>}</div>
        <div className="p-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-dark">{gallery.eventName || "School event"}</p><h2 className="mt-2 text-xl font-bold text-navy">{gallery.title}</h2><div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">{(gallery.month || gallery.year) && <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-gold-dark" /> {[gallery.month, gallery.year].filter(Boolean).join(" ")}</span>}<span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold-dark" /> Shri Shahu Prabodhini</span></div></div>
      </article>)}
    </div>}
  </div></section></div>;
}
