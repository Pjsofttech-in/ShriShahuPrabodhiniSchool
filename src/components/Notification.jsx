import React, { useEffect, useState } from "react";
import { Bell, CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";
import { fetchNotifications } from "../services/backendService.js";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchNotifications().then((items) => active && setNotifications(items)).catch(() => active && setError("Notifications are temporarily unavailable.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  function toggleNotification(id) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return <section className="min-h-[70vh] bg-[linear-gradient(180deg,#fffdf8_0%,#f3f6f6_100%)] py-8 md:py-12">
    <div className="container-app max-w-5xl">
      <div className="relative mb-7 overflow-hidden rounded-[26px] border border-[#eadfce] bg-[#fffaf0] p-5 shadow-[0_16px_38px_rgba(23,59,95,0.09)] sm:p-7"><div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full border-[16px] border-[#e3a04d]/20" /><div className="relative flex items-center gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e86516] text-white shadow-[0_8px_18px_rgba(232,101,22,0.22)]"><Bell size={23} /></div><div><span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b65318]"><Sparkles size={12} /> Stay informed</span><h1 className="mt-1 font-display text-2xl font-bold text-navy sm:text-3xl">Notifications</h1></div></div></div>
      {loading && <div className="flex min-h-52 items-center justify-center gap-3 rounded-[24px] bg-white text-muted shadow-[0_18px_45px_rgba(23,59,95,0.08)]"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading notifications...</div>}
      {!loading && error && <p className="rounded-[24px] bg-white py-16 text-center text-maroon shadow-[0_18px_45px_rgba(23,59,95,0.08)]">{error}</p>}
      {!loading && !error && notifications.length === 0 && <p className="rounded-[24px] bg-white py-16 text-center text-muted shadow-[0_18px_45px_rgba(23,59,95,0.08)]">No notifications have been published yet.</p>}
      {!loading && !error && notifications.length > 0 && <div className="grid gap-3">{notifications.map((item, index) => {
        const expanded = expandedIds.has(item.id);
        return <article key={item.id} className="content-reveal group relative overflow-hidden rounded-[20px] border border-[#e8e1d5] bg-[#fffdf8] p-4 shadow-[0_8px_22px_rgba(23,59,95,0.07)] transition duration-500 hover:-translate-y-1 hover:border-[#e86516]/45 hover:shadow-[0_18px_35px_rgba(237,90,0,0.14)]" style={{ animationDelay: `${index * 60}ms` }}><div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#f3bd63] to-[#e86516] transition-all duration-500 group-hover:w-2" /><div className="flex items-start gap-3 sm:items-center"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0df] text-[#e86516] transition duration-300 group-hover:rotate-3 group-hover:scale-110"><Bell size={17} /></div><div className="min-w-0 flex-1"><h2 className="font-display text-lg font-bold leading-tight text-navy transition-colors duration-300 group-hover:text-[#e86516]">{item.title}</h2><p className={`mt-1 text-sm leading-6 text-muted ${expanded ? "" : "line-clamp-3"}`}>{item.description || "No description available."}</p><span role="button" tabIndex={0} onClick={() => toggleNotification(item.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") toggleNotification(item.id); }} className="mt-1 inline-block cursor-pointer text-xs font-bold text-[#e86516] hover:text-[#b65318]">{expanded ? "Less" : "More"}</span></div><p className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold text-[#b8752b] sm:flex"><CheckCircle2 size={13} className="text-[#e86516]" /> Official announcement</p></div><p className="mt-2 flex items-center gap-1.5 pl-[3.25rem] text-[11px] font-semibold text-[#b8752b] sm:hidden"><CheckCircle2 size={13} className="text-[#e86516]" /> Official announcement</p></article>;
      })}</div>}
    </div>
  </section>;
}
