import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutGrid,
  NotebookPen,
  ScrollText,
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { examInfo } from "../../data/siteData.js";
import { fetchExamSection, fetchFAQs, fetchSyllabus } from "../../services/backendService.js";
import logo from "../../asset/logo.png";

const quickLinks = [
  { label: "Pages", to: "/sankalp/exam-information", icon: LayoutGrid },
  { label: "Test Series", to: "/sankalp/test-series", icon: NotebookPen },
  { label: "Answer Key", to: "/sankalp/answer-key", icon: FileText },
  { label: "Syllabus", to: "/sankalp/syllabus", icon: FileText },
  { label: "Result Check", to: "/sankalp/result-check", icon: FileCheck2 },
  { label: "Result PDF", to: "/sankalp/results-pdf", icon: ScrollText },
];

const registrationSteps = [
  { number: "01", title: "Start Registration", description: "Click Register Now to begin." },
  { number: "02", title: "Verify & Fill Details", description: "Complete your details and select an exam slot." },
  { number: "03", title: "Pay Fees", description: "Pay the exam fees securely online." },
  { number: "04", title: "Attempt Your Test", description: "Take your test in the selected slot." },
];

const examFaqs = [
  { question: "Who can apply for the Sankalp Scholarship Exam?", answer: `Students from classes ${examInfo.eligibleClasses} can apply for the examination.` },
  { question: "What is the examination fee?", answer: `The registration fee is ₹${examInfo.fee}. Complete registration online to confirm your participation.` },
  { question: "When is the examination scheduled?", answer: `The examination is scheduled for ${examInfo.examDate}. Please complete registration before ${examInfo.registrationDeadline}.` },
  { question: "What do top performers receive?", answer: "Top performers can receive scholarships, certificates and recognition based on their examination performance." },
];

export default function ExamInformation() {
  const [syllabus, setSyllabus] = useState([]);
  const [syllabusLoading, setSyllabusLoading] = useState(true);
  const [examSection, setExamSection] = useState(null);
  const [faqs, setFaqs] = useState(examFaqs);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([fetchSyllabus(), fetchExamSection(), fetchFAQs()]).then(([syllabusResult, sectionResult, faqResult]) => {
      if (!mounted) return;
      if (syllabusResult.status === "fulfilled") setSyllabus(syllabusResult.value);
      if (sectionResult.status === "fulfilled" && sectionResult.value) setExamSection(sectionResult.value);
      if (faqResult.status === "fulfilled" && faqResult.value.length) setFaqs(faqResult.value);
      setSyllabusLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const liveExamInfo = { ...examInfo, ...(examSection || {}) };

  return (
    <div>
      <PageHeader title="Sankalp Exam Information" crumb="Exam Information" compact />

      <section className="relative overflow-hidden bg-[#f8f5ee] pb-10 pt-0 md:pb-16">
        <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-16 h-72 w-72 rounded-full bg-navy/10 blur-3xl" />
        <div className="container-app">
          <div className="relative mb-6 overflow-hidden rounded-[30px] bg-[linear-gradient(120deg,#173b5f_0%,#255b80_58%,#f0bd43_180%)] p-6 text-white shadow-[0_20px_50px_rgba(23,59,95,0.20)] sm:p-8 md:p-10">
            <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[34px] border-white/10" />
            <div className="pointer-events-none absolute bottom-[-5rem] right-32 h-44 w-44 rounded-full bg-gold/20 blur-2xl" />
            <div className="relative grid items-center gap-7 md:grid-cols-[1fr_auto]">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-light">Sankalp 2026 · Registrations open</div>
                <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">A stronger start to a <span className="text-gold-light">brighter future.</span></h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 md:text-base">Discover your academic potential through a thoughtfully designed scholarship examination built for ambitious young learners.</p>
                <Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-navy shadow-[0_10px_24px_rgba(243,185,61,0.25)] transition hover:-translate-y-1 hover:bg-gold-light">Start Registration <ArrowRight size={16} /></Link>
              </div>
              <div className="hidden h-36 w-36 items-center justify-center rounded-[28px] border border-white/20 bg-white/10 p-3 shadow-inner sm:flex md:h-44 md:w-44">
                <img src={logo} alt="Sankalp Scholarship Exam" className="h-full w-full rounded-2xl object-contain" />
              </div>
            </div>
          </div>

          <div className="relative mb-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {quickLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-2 text-xs font-semibold transition-all duration-300 sm:gap-2 sm:px-4 sm:text-sm ${
                  to === "/sankalp/exam-information"
                    ? "border-navy bg-navy text-white shadow-[0_10px_20px_rgba(23,59,95,0.20)]"
                    : "border-[#e4d9c4] bg-white/80 text-navy hover:border-gold hover:text-gold-dark hover:shadow-sm"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          <div className="relative mb-6 rounded-[26px] border border-[#e7dcc8] bg-[#fffdf8] px-4 py-5 shadow-[0_18px_42px_rgba(23,59,95,0.09)] md:px-8 md:py-7">
            <div className="mb-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-dark">Simple registration journey</p>
              <h2 className="mt-2 text-xl font-black text-navy sm:text-2xl md:text-3xl">Four steps to your <span className="text-gold-dark">Sankalp</span> exam</h2>
            </div>

            <div className="relative grid gap-5 md:grid-cols-4 md:gap-4">
              <div className="absolute left-[12%] right-[12%] top-6 hidden h-1 rounded-full bg-[#ead9ad] md:block" />
              {registrationSteps.map((step) => (
                <div key={step.number} className="relative text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-navy text-sm font-black text-white shadow-[0_0_0_3px_#e6bd50]">
                    {step.number}
                  </div>
                  <h3 className="text-sm font-bold text-navy">{step.title}</h3>
                  <p className="mx-auto mt-1 max-w-[12rem] text-[11px] leading-5 text-slate-500 sm:text-xs">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-[28px] border border-[#e4d9c4] bg-[#fffdf9] p-4 shadow-[0_18px_44px_rgba(23,59,95,0.10)] sm:p-5 md:p-8">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 md:mb-6 md:gap-4 md:pb-5">
              <div className="flex min-w-0 items-center gap-3 md:gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#ead9ae] bg-white p-1 shadow-[0_8px_18px_rgba(23,59,95,0.10)] md:h-16 md:w-16">
                  <img src={logo} alt="Sankalp exam logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dark">Scholarship examination</p>
                  <h2 className="text-xl font-black leading-tight text-navy sm:text-2xl md:text-4xl">
                  {liveExamInfo.name}
                  </h2>
                </div>
              </div>

              <div className="hidden rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-bold text-gold-dark md:inline-flex md:items-center md:gap-2">
                <GraduationCap size={16} />
                Premium Academic Platform
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
              <div>
                <p className="mb-5 text-sm leading-6 text-slate-600 md:mb-6 md:text-base md:leading-7">
                  {liveExamInfo.description || "The Sankalp Scholarship Exam is conducted every academic year to identify and reward talented students across Maharashtra. The exam evaluates conceptual clarity in Mathematics, Science, Language and General Knowledge appropriate to each class level, and top scorers are awarded scholarships, certificates and felicitation at the annual ceremony."}
                </p>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80">
                  <dl className="divide-y divide-slate-200">
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Eligible Classes</dt>
                      <dd className="text-sm font-bold text-navy">{liveExamInfo.eligibleClasses}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Exam Date</dt>
                      <dd className="text-sm font-bold text-navy">{liveExamInfo.examDate}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Registration Deadline</dt>
                      <dd className="text-sm font-bold text-navy">{liveExamInfo.registrationDeadline}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Registration Fee</dt>
                      <dd className="text-sm font-bold text-navy">₹{liveExamInfo.fee}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Exam Pattern</dt>
                      <dd className="max-w-[18rem] text-right text-sm font-bold text-navy">{liveExamInfo.pattern}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Centers Available</dt>
                      <dd className="text-sm font-bold text-navy">{liveExamInfo.centers}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="lg:pt-2">
                <div className="relative overflow-hidden rounded-[24px] bg-navy p-6 text-white shadow-[0_18px_40px_rgba(23,59,95,0.22)]">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold/15 blur-2xl" />
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                    <ArrowRight size={12} />
                    Ready to Register?
                  </div>

                  <h3 className="mb-3 text-2xl font-bold">Secure your seat today</h3>
                  <p className="mb-6 text-sm leading-6 text-white/75">
                    Take the next step toward a brighter future and get your roll number confirmed after payment.
                  </p>

                  <Link
                    to="/register"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-base font-bold text-white shadow-[0_12px_24px_rgba(255,109,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-dark"
                  >
                    Register Now
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-6 rounded-[28px] border border-[#ffe7d1] bg-white p-4 shadow-[0_14px_40px_rgba(11,37,69,0.08)] sm:p-5 md:p-8">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">Prepare with confidence</p>
                <h2 className="text-2xl font-black text-navy md:text-3xl">Syllabus</h2>
              </div>
              <Link to="/sankalp/syllabus" className="hidden items-center gap-1 text-sm font-bold text-gold-dark hover:text-gold md:inline-flex">
                View all <ArrowRight size={15} />
              </Link>
            </div>

            {syllabusLoading ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading syllabus...</div>
            ) : syllabus.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#f2c49c] bg-[#fffaf5] px-5 py-8 text-center text-sm text-slate-500">
                No syllabus is available right now.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {syllabus.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                    <span className="font-bold text-navy">{item.title}</span>
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noreferrer" className="shrink-0 text-gold-dark hover:text-gold" aria-label={`Open ${item.title}`}>
                        <ArrowUpRight size={18} />
                      </a>
                    ) : (
                      <span className="shrink-0 text-xs text-slate-400">Unavailable</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative mt-6 overflow-hidden rounded-[28px] border border-[#e4d9c4] bg-[#fffdf8] p-5 shadow-[0_18px_44px_rgba(23,59,95,0.09)] sm:p-7 md:p-9">
            <div className="mb-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-dark">Need to know more?</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-navy md:text-3xl">Frequently Asked Questions</h2>
            </div>
            <div className="mx-auto max-w-4xl space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return <div key={faq.question} className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isOpen ? "border-gold/60 bg-white shadow-[0_10px_24px_rgba(23,59,95,0.08)]" : "border-[#e8dfcf] bg-white/60"}`}>
                  <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5" aria-expanded={isOpen}>
                    <span className="font-bold text-navy">{faq.question}</span>
                    <ChevronDown size={19} className={`shrink-0 text-gold-dark transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden"><p className="border-t border-[#eee5d5] px-4 pb-4 pt-3 text-sm leading-6 text-muted sm:px-5">{faq.answer}</p></div>
                  </div>
                </div>;
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
