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
      <section className="section-pad">
        <div className="container-app grid md:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.id} className="card overflow-hidden group">
              <div className="h-48 overflow-hidden">
                <img
                  src={resolveImageUrl(c.image)}
                  alt={c.name}
                  onError={(event) => { event.currentTarget.src = fallbackCourseImage; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-navy mb-1.5">{c.name}</h3>
                <p className="text-sm text-muted mb-3">{c.desc}</p>
                <div className="flex justify-between items-center text-xs text-muted mb-4">
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
