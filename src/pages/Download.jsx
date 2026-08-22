import React, { useEffect, useState } from "react";
import { FileDown } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { fetchDownloads } from "../services/backendService.js";

export default function Download() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDownloads = async () => {
      try {
        const data = await fetchDownloads();
        if (mounted) setDownloads(data);
      } catch (error) {
        console.error("Failed to load downloads:", error);
        if (mounted) setDownloads([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDownloads();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Downloads" />
      <section className="section-pad">
        <div className="container-app max-w-3xl space-y-4">
          {loading ? (
            <div className="card p-5 text-sm text-muted">Loading downloads...</div>
          ) : downloads.length === 0 ? (
            <div className="card p-5 text-sm text-muted">No downloads available right now.</div>
          ) : (
            downloads.map((d) => {
              const downloadUrl = d.file || d.pdf || d.filePath || d.fileUrl || d.url || "#";
              const fileMeta = d.size || d.description || d.fileName || "PDF";

              return (
                <div key={d.id || d.title || d.fileName} className="card p-5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-navy">{d.title}</p>
                    <p className="text-xs text-muted">{fileMeta}</p>
                  </div>
                  <a href={downloadUrl} target="_blank" rel="noreferrer" className="btn-outline !px-4 !py-2 text-sm">
                    <FileDown size={16} /> Download
                  </a>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
