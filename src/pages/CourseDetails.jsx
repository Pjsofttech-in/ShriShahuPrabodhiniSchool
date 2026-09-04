import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock3, IndianRupee } from "lucide-react";
import { fetchCourses } from "../services/backendService.js";
import { API_BASE_URL } from "../utils/api.js";

const fallbackCourseImage = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop";

function resolveImageUrl(image) {
  if (!image) return fallbackCourseImage;
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${String(image).replace(/^\/+/, "")}`;
}

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCourses()
      .then((courses) => {
        if (!active) return;
        const selectedCourse = courses.find((item) => String(item.id) === String(id));
        setCourse(selectedCourse || null);
        setNotFound(!selectedCourse);
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <div className="container-app py-20 text-center text-muted">Loading course details...</div>;
  }

  if (notFound) {
    return <div className="container-app py-20 text-center"><p className="mb-6 text-muted">This course is currently unavailable.</p><Link to="/courses" className="btn-outline"><ArrowLeft size={16} /> Back to Courses</Link></div>;
  }

  return (
    <div>
      <section className="bg-[#f7f9fc] py-6 md:py-8">
        <div className="container-app">
          <Link to="/courses" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-gold-dark transition hover:text-navy"><ArrowLeft size={17} /> Back to all courses</Link>
          <div className="overflow-hidden rounded-2xl border border-[#ead8cb] bg-white shadow-[0_14px_40px_rgba(15,35,82,0.12)]">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="course-detail-image-frame">
                <img
                  src={resolveImageUrl(course.image)}
                  alt={course.name}
                  onError={(event) => { event.currentTarget.src = fallbackCourseImage; }}
                  className="h-full w-full object-contain object-center"
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-gold-dark"><BookOpen size={15} /> Course Details</span>
                <h1 className="text-3xl font-bold leading-tight text-navy sm:text-4xl">{course.name}</h1>
                {course.desc && <p className="mt-5 text-base leading-7 text-muted">{course.desc}</p>}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#f1dfd2] bg-[#fffaf6] p-4"><Clock3 className="mb-2 text-gold" size={21} /><p className="text-xs font-bold uppercase tracking-wider text-muted">Duration</p><p className="mt-1 font-bold text-navy">{course.duration || "Not available"}</p></div>
                  <div className="rounded-xl border border-[#f1dfd2] bg-[#fffaf6] p-4"><IndianRupee className="mb-2 text-gold" size={21} /><p className="text-xs font-bold uppercase tracking-wider text-muted">Course Fee</p><p className="mt-1 font-bold text-navy">{course.fee || "Contact us"}</p></div>
                </div>
                <Link to="/register" className="btn-primary mt-8 w-full justify-center sm:w-fit">Enroll Now <ArrowLeft className="rotate-180" size={17} /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
