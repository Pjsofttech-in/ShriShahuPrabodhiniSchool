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
      className="relative w-full h-[62vh] min-h-[360px] max-h-[680px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-black/20 to-black/75" />

          {/* Right Content */}
          <div className="absolute inset-0 flex items-center justify-end">
            <div className="w-full flex justify-end pr-4 md:pr-10 lg:pr-16 xl:pr-24">

              <div className="max-w-[500px] text-right bg-black/20 backdrop-blur-md rounded-2xl p-6 lg:p-7 border border-white/10 shadow-2xl">

                {/* Badge */}
                <span className="inline-block px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-[10px] md:text-xs uppercase tracking-[0.18em] font-semibold mb-4">
                  Shri Shahu Prabodhini
                </span>

                {/* Heading */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                  {slide.title}
                </h2>

                {/* Subtitle */}
                <p className="mt-4 text-sm md:text-base text-white/90 leading-7">
                  {slide.subtitle}
                </p>

                {/* Button */}
                <div className="mt-6 flex justify-end">
                  <Link
                    to={slide.link}
                    className="inline-flex items-center bg-gold hover:bg-gold-light text-navy-dark font-semibold px-5 py-2.5 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 text-sm"
                  >
                    {slide.linkLabel}
                  </Link>
                </div>

              </div>

            </div>
          </div>
        </div>
      ))}

      {/* Previous */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 hover:bg-gold hover:text-navy-dark transition-all duration-300 flex items-center justify-center"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Next */}
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/20 hover:bg-gold hover:text-navy-dark transition-all duration-300 flex items-center justify-center"
      >
        <ChevronRight size={22} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === index
                ? "w-8 h-2 bg-gold"
                : "w-2 h-2 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}