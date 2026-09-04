import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../utils/api.js";

const fallbackCourseImage = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop";

function resolveImageUrl(image) {
  if (!image) return fallbackCourseImage;
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

export default function CourseCard({ course }) {
  return (
    <article className="group flex h-auto flex-col overflow-hidden rounded-xl border border-[#e5cdbd] bg-white shadow-[0_6px_18px_rgba(15,35,82,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_14px_28px_rgba(255,109,0,0.18)]">
      <div className="course-image-frame">
        <img
          src={resolveImageUrl(course.image)}
          alt={course.name}
          onError={(event) => { event.currentTarget.src = fallbackCourseImage; }}
          className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex min-h-[3.75rem] items-center justify-center bg-gold px-4 py-2 text-center">
        <h3 className="text-lg font-bold leading-7 text-white">{course.name}</h3>
      </div>
      <Link
        to={`/courses/${course.id}`}
        className="flex min-h-11 items-center justify-center gap-2 border-t border-white/25 bg-gold-dark px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d95700] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        aria-label={`View details for ${course.name}`}
      >
        More <ArrowRight size={17} />
      </Link>
    </article>
  );
}
