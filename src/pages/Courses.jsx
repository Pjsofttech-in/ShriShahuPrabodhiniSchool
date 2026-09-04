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
      <section className="section-pad !pt-0 bg-[#f7f9fc]">
        <div className="container-app grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
