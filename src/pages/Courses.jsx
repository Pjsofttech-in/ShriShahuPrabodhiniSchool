import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import { fetchCourses } from "../services/backendService.js";
import { API_BASE_URL } from "../utils/api.js";

const fallbackCourseImage = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop";

function resolveImageUrl(image) {
  if (!image) return fallbackCourseImage;
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let mounted = true;

    fetchCourses()
      .then((data) => {
        if (mounted) setCourses(data);
      })
      .catch((error) => {
        console.error("Failed to fetch courses:", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Our Courses" />
      <section className="section-pad !pt-0 bg-[#f7f9fc]">
        <div className="container-app grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <div key={c.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ffd8b5] bg-white shadow-[0_14px_32px_rgba(15,35,82,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff9a4d] hover:shadow-[0_18px_40px_rgba(255,109,0,0.16)]">
              <div className="relative aspect-[16/9] overflow-hidden bg-navy-dark">
                <img
                  src={resolveImageUrl(c.image)}
                  alt={c.name}
                  onError={(event) => { event.currentTarget.src = fallbackCourseImage; }}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
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
      </section>
    </div>
  );
}
