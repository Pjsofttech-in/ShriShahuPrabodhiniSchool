import React, { useEffect, useState } from "react";
import { ArrowDownToLine, FileText, LoaderCircle, Sparkles } from "lucide-react";
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
      <section className="section-pad !pt-8 md:!pt-12 bg-[linear-gradient(180deg,#fffdf8_0%,#f3f6f6_100%)]">
        <div className="container-app max-w-5xl">
          <div className="mb-8 flex items-end justify-between gap-5 border-b border-[#e7dfd1] pb-6"><div><span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e7a064]/60 bg-[#fff4e7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b65318]"><Sparkles size={13} /> Resource library</span><h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">Downloads</h1></div><p className="hidden max-w-xs text-right text-sm leading-6 text-muted sm:block">Keep the essential Sankalp resources close at hand.</p></div>
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 rounded-[28px] bg-white text-muted shadow-[0_18px_45px_rgba(23,59,95,0.08)]"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading downloads...</div>
          ) : downloads.length === 0 ? (
            <div className="rounded-[28px] bg-white p-8 text-center text-sm text-muted shadow-[0_18px_45px_rgba(23,59,95,0.08)]">No downloads available right now.</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">{downloads.map((d, index) => {
              const downloadUrl = d.file || d.pdf || d.filePath || d.fileUrl || d.url || "#";
              const fileMeta = d.size || d.description || d.fileName || "PDF";

              return <article key={d.id || d.title || d.fileName} className="content-reveal group relative overflow-hidden rounded-[24px] border border-[#eadfce] bg-[#fffdf8] p-5 shadow-[0_12px_30px_rgba(23,59,95,0.08)] transition duration-500 hover:-translate-y-2 hover:border-[#e86516]/45 hover:shadow-[0_22px_44px_rgba(237,90,0,0.15)]" style={{ animationDelay: `${index * 70}ms` }}><div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full border-[12px] border-[#f3bd63]/25 transition duration-500 group-hover:scale-125" /><div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff0df] text-[#e86516] transition duration-300 group-hover:rotate-3 group-hover:scale-110"><FileText size={27} /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8752b]">Official resource</p><h2 className="mt-1 font-display text-xl font-bold leading-tight text-navy">{d.title}</h2><p className="mt-2 text-xs text-muted">{fileMeta}</p></div></div><a href={downloadUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#e86516] px-4 py-2 text-xs font-bold text-white shadow-[0_8px_18px_rgba(232,101,22,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-[#c84c0b] hover:shadow-[0_12px_24px_rgba(232,101,22,0.32)]"><ArrowDownToLine size={16} /> Download file</a></article>;
            })}</div>
          )}
        </div>
      </section>
    </div>
  );
}
