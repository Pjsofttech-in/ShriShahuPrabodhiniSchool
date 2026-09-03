import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919823456789";

export default function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setShowScrollTop(window.scrollY > 260);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-center gap-3 sm:bottom-6 sm:right-6">
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white shadow-[0_8px_22px_rgba(38,50,56,0.28)] transition-all duration-300 hover:-translate-y-1 hover:bg-gold focus-ring"
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ArrowUp size={21} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
      )}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_rgba(37,211,102,0.32)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1ebe5d] focus-ring"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp size={28} className="transition-transform duration-300 group-hover:scale-110" />
      </a>
    </div>
  );
}