import React, { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Mail, MapPin, Phone, Send } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { fetchContactInfo, submitContactForm } from "../services/backendService.js";

const emptyForm = { name: "", mobileNo: "", email: "", course: "", subject: "", academicYear: "", description: "" };
const DEFAULT_MAP_LINK = "https://www.openstreetmap.org/export/embed.html?bbox=73.855%2C18.493%2C73.885%2C18.525&layer=mapnik&marker=18.509%2C73.870";
const DEFAULT_MAP_PAGE = "https://www.google.com/maps/search/?api=1&query=Swargate%2C%20Pune";

function getMapEmbedUrl(mapLink) {
  const value = String(mapLink || "").trim();
  if (!value) return DEFAULT_MAP_LINK;
  if (/openstreetmap\.org\/export\/embed/i.test(value)) return value;
  if (/google\.com\/maps\/embed/i.test(value)) return value;
  return DEFAULT_MAP_LINK;
}

export default function ContactUs() {
  const [contactInfo, setContactInfo] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchContactInfo().then((data) => active && setContactInfo(data)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (!/^\d{10}$/.test(form.mobileNo)) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await submitContactForm(form);
      setSent(true);
      setForm(emptyForm);
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
        submitError?.response?.data?.error ||
        "Unable to send your message right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const details = [[MapPin, "Visit us", contactInfo?.address], [Phone, "Call us", contactInfo?.contactNo], [Mail, "Email us", contactInfo?.email]];

  return <div><PageHeader title="Contact Us" crumb="Contact Us" /><section className="bg-cream py-8 md:py-12"><div className="container-app">
    <div className="mb-8 grid gap-4 md:grid-cols-3">{details.map(([Icon, label, value]) => <div key={label} className="content-reveal flex items-start gap-3 border-l-4 border-gold bg-white p-5 shadow-sm"><Icon className="shrink-0 text-gold-dark" size={22} /><div><p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p><p className="mt-2 break-words text-sm font-semibold leading-6 text-navy">{loading ? "Loading..." : value || "Not available"}</p></div></div>)}</div>
    <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="bg-white p-6 shadow-[0_8px_30px_rgba(11,37,69,0.08)] md:p-8"><div className="mb-6"><span className="eyebrow">We are here to help</span><h2 className="text-2xl font-bold text-navy md:text-3xl">Send us a message</h2><p className="mt-2 text-sm leading-6 text-muted">Share your question and our team will get back to you.</p></div>{sent ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><CheckCircle2 className="text-green-600" size={46} /><h3 className="mt-4 text-xl font-bold text-navy">Message sent successfully</h3><p className="mt-2 text-sm text-muted">Thank you. Our team will contact you shortly.</p><button type="button" onClick={() => setSent(false)} className="mt-5 text-sm font-bold text-gold-dark hover:underline">Send another message</button></div> : <form onSubmit={submit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" name="name" value={form.name} onChange={updateField} required /><Field label="Mobile number" name="mobileNo" value={form.mobileNo} onChange={updateField} required type="tel" pattern="[0-9]{10}" maxLength="10" /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Email address" name="email" value={form.email} onChange={updateField} type="email" /><Field label="Academic year" name="academicYear" value={form.academicYear} onChange={updateField} placeholder="e.g. 2026-27" /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Course" name="course" value={form.course} onChange={updateField} placeholder="Class or course" /><Field label="Subject" name="subject" value={form.subject} onChange={updateField} /></div><div><label className="label-field" htmlFor="description">Message</label><textarea id="description" name="description" value={form.description} onChange={updateField} required rows="4" className="input-field resize-y" placeholder="How can we help?" /></div>{error && <p className="text-sm font-semibold text-maroon" role="alert">{error}</p>}<button disabled={submitting} className="btn-primary w-full justify-center disabled:cursor-wait disabled:opacity-70">{submitting ? <><LoaderCircle className="animate-spin" size={18} /> Sending...</> : <><Send size={18} /> Send message</>}</button></form>}</div>
      <div className="overflow-hidden bg-navy shadow-[0_8px_30px_rgba(11,37,69,0.08)]"><div className="flex items-center justify-between border-b border-white/10 p-5 text-white"><div><p className="text-xs font-bold uppercase tracking-wider text-gold">Find us</p><h2 className="mt-1 text-xl font-bold">Swargate, Pune</h2></div><MapPin className="text-gold" /></div><div className="aspect-[4/3] min-h-[260px] w-full sm:min-h-[320px] md:aspect-auto md:h-[420px]"><iframe title="Shri Shahu Prabodhini location in Swargate Pune" src={getMapEmbedUrl(contactInfo?.mapLink)} className="h-full w-full border-0" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" /></div><a href={contactInfo?.mapLink || DEFAULT_MAP_PAGE} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center border-t border-white/10 bg-navy px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#263238] hover:text-gold">Open in Google Maps <MapPin size={16} className="ml-2 shrink-0 text-gold" /></a></div>
    </div>
  </div></section></div>;
}

function Field({ label, name, value, onChange, ...props }) {
  return <div><label className="label-field" htmlFor={name}>{label}{props.required && " *"}</label><input id={name} name={name} value={value} onChange={onChange} className="input-field" {...props} /></div>;
}
