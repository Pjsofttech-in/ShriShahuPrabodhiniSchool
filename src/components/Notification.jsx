import React, { useEffect, useState } from "react";
import { Bell, CheckCircle2, LoaderCircle } from "lucide-react";
import { fetchNotifications } from "../services/backendService.js";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; fetchNotifications().then((items) => active && setNotifications(items)).catch(() => active && setError("Notifications are temporarily unavailable.")).finally(() => active && setLoading(false)); return () => { active = false; }; }, []);

  return <section className="min-h-[70vh] bg-cream py-8 md:py-12"><div className="container-app max-w-4xl"><div className="mb-7 flex items-center gap-4 border-b-4 border-gold bg-navy p-5 text-white shadow-lg md:p-7"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"><Bell size={25} className="text-gold" /></div><div><h1 className="text-2xl font-bold md:text-3xl">Notifications</h1><p className="mt-1 text-sm text-white/70">Important updates from Shri Shahu Prabodhini</p></div></div>
    {loading && <div className="flex justify-center gap-3 py-20 text-muted"><LoaderCircle className="animate-spin text-gold" size={24} /> Loading notifications...</div>}
    {!loading && error && <p className="py-16 text-center text-maroon">{error}</p>}
    {!loading && !error && notifications.length === 0 && <p className="py-16 text-center text-muted">No notifications have been published yet.</p>}
    {!loading && !error && notifications.length > 0 && <div className="grid gap-3">{notifications.map((item, index) => <article key={item.id} className="content-reveal flex gap-4 border-l-4 border-gold bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${index * 70}ms` }}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark"><Bell size={19} /></div><div><h2 className="font-bold text-navy">{item.title}</h2><p className="mt-1 text-sm leading-6 text-muted">{item.description || "No description available."}</p><p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><CheckCircle2 size={14} className="text-gold-dark" /> Official announcement</p></div></article>)}</div>}
  </div></section>;
}
