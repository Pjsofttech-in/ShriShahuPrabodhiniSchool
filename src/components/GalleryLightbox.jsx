import React, { useEffect, useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";

export default function GalleryLightbox({ image, title, children, compact = false }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block h-full w-full cursor-zoom-in text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold"
        aria-label={`Open ${title || "gallery image"}`}
      >
        {children}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#081827]/85 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label={title || "Gallery image"} onClick={() => setOpen(false)}>
          <div className={`relative flex max-h-[94vh] w-full ${compact ? "max-w-4xl" : "max-w-6xl"} flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#f8fafc] shadow-[0_25px_90px_rgba(0,0,0,0.45)]`} onClick={(event) => event.stopPropagation()}>
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-black/10 bg-white px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark"><ImageIcon size={18} /></span>
                <p className="truncate text-sm font-bold text-navy sm:text-base">{title || "Gallery image"}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white shadow-md transition hover:bg-gold focus:outline-none focus:ring-2 focus:ring-gold" aria-label="Close image"><X size={21} /></button>
            </div>
            <div className="flex min-h-0 items-center justify-center bg-[radial-gradient(circle_at_center,#324b60_0%,#122636_58%,#081827_100%)] p-3 sm:p-6">
              <img src={image} alt={title || "Gallery"} className={`${compact ? "max-h-[62vh] sm:max-h-[68vh]" : "max-h-[calc(94vh-8rem)]"} w-auto max-w-full rounded-lg object-contain shadow-[0_14px_45px_rgba(0,0,0,0.35)]`} />
            </div>
            <div className="flex items-center justify-center border-t border-black/10 bg-white px-4 py-3"><span className="h-1 w-12 rounded-full bg-gold" /></div>
          </div>
        </div>
      )}
    </>
  );
}
