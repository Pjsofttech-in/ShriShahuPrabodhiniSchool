import React, { useEffect, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchSyllabus } from "../../services/backendService.js";

export default function Syllabus() {
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchSyllabus()
      .then((data) => {
        if (mounted) setSyllabus(data);
      })
      .catch((error) => {
        console.error("Failed to fetch syllabus:", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Syllabus" crumb="Syllabus" />
      <section className="section-pad">
        <div className="container-app">
          {loading ? (
            <div className="py-16 text-center text-muted">Loading syllabus...</div>
          ) : syllabus.length === 0 ? (
            <div className="py-16 text-center text-muted">No syllabus is available right now.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {syllabus.map((item) => (
                <article key={item.id} className="card p-6 flex flex-col">
                  <FileText size={28} className="text-gold-dark mb-4" />
                  <h2 className="font-display font-bold text-navy text-lg mb-5">{item.title}</h2>
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 self-start text-sm font-bold text-gold-dark hover:text-navy transition-colors"
                    >
                      Open syllabus <ExternalLink size={15} />
                    </a>
                  ) : (
                    <span className="text-sm text-muted">Link not available</span>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
