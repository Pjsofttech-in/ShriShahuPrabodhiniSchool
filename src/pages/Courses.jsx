import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import CourseCard from "../components/CourseCard.jsx";
import { fetchCourses } from "../services/backendService.js";

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
      <section className="section-pad !pt-10 md:!pt-14 bg-[linear-gradient(180deg,#f7f9fc_0%,#fffdf8_100%)]">
        <div className="container-app">
          <div className="mb-8 flex flex-col gap-2 border-b border-[#e6ebef] pb-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8752b]">Learn with purpose</p>
              <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">Explore our courses</h1>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted sm:text-right">Focused programs for confident, consistent academic progress.</p>
          </div>
          <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
          </div>
        </div>
      </section>
    </div>
  );
}
