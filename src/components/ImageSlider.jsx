import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageSlider({ slides, interval = 5000 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (paused) return;

    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval, paused]);

  return (
    <section
      className="relative h-[60vh] min-h-[360px] max-h-[680px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "z-10 opacity-100" : "z-0 opacity-0"
          }`}
        >
          <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/25 to-black/80" />

          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:justify-end md:p-10 lg:p-14">
            <div className="w-full max-w-[92vw] rounded-2xl border border-white/10 bg-black/20 p-4 shadow-2xl backdrop-blur-sm md:max-w-[500px] md:p-6 lg:p-7 md:text-right">
              <span className="mb-3 inline-block rounded-full border border-gold/40 bg-gold/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold sm:text-[10px] md:text-xs">
                Shri Shahu Prabodhini
              </span>

              <h2 className="text-[clamp(1.8rem,4vw,4rem)] font-bold leading-[1.05] text-white drop-shadow-lg">
                {slide.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/90 md:text-base md:leading-7">
                {slide.subtitle}
              </p>

              <div className="mt-5 flex justify-start md:justify-end">
                <Link
                  to={slide.link}
                  className="inline-flex items-center rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-navy-dark shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-gold-light"
                >
                  {slide.linkLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-gold hover:text-navy-dark sm:left-5 sm:h-11 sm:w-11"
      >
        <ChevronLeft size={18} className="sm:h-[22px] sm:w-[22px]" />
      </button>

      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-gold hover:text-navy-dark sm:right-5 sm:h-11 sm:w-11"
      >
        <ChevronRight size={18} className="sm:h-[22px] sm:w-[22px]" />
      </button>

      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2.5 sm:bottom-7">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === index ? "h-2.5 w-8 bg-gold" : "h-2.5 w-2.5 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}