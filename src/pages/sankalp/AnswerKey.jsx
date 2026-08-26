import React, { useEffect, useState } from "react";
import { FileDown } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchAnswerKeys } from "../../services/backendService.js";

export default function AnswerKey() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchAnswerKeys()
      .then((data) => {
        if (mounted) setKeys(data);
      })
      .catch((error) => {
        console.error("Failed to load answer keys:", error);
        if (mounted) setKeys([]);
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
      <PageHeader title="Answer Key" crumb="Answer Key" />
      <section className="section-pad">
        <div className="container-app max-w-3xl">
          <p className="text-muted mb-8">
            Official answer keys are published within 48 hours of the exam. Objection window
            remains open for 3 days after publication.
          </p>
          {loading ? (
            <div className="card p-5 text-sm text-muted">Loading answer keys...</div>
          ) : keys.length === 0 ? (
            <div className="card p-5 text-sm text-muted">No answer keys available right now.</div>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => (
                <div key={key.id || key.title} className="card p-5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-navy">{key.title}</p>
                    {key.publishedAt && <p className="text-xs text-muted">Published: {key.publishedAt}</p>}
                  </div>
                  <a href={key.file} target="_blank" rel="noreferrer" className="btn-outline !px-4 !py-2 text-sm">
                    <FileDown size={16} /> Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
