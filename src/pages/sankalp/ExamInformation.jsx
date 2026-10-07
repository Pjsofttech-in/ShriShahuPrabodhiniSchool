import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  FileCheck2,
  FileText,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  NotebookPen,
  Coins,
  Award,
  ScrollText,
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { fetchExamSection, fetchFAQs, fetchSyllabus } from "../../services/backendService.js";
import logo from "../../asset/logo.png";

const quickLinks = [
  { label: "Pages", to: "/sankalp/exam-information", icon: LayoutGrid },
  { label: "Mentors", to: "/features", icon: GraduationCap },
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

const prizeHighlights = [
  { title: "Cash Rewards", description: "Win cash rewards for outstanding performance in the Maha Talent Scholarship Exam.", Icon: Coins, tone: "text-[#f1b923]" },
  { title: "Certificates", description: "Receive certificates that celebrate achievement and academic excellence.", Icon: Award, tone: "text-[#ed5a00]" },
  { title: "Up to 100% Scholarship", description: "Earn scholarship support for admission to Shri Shahu Prabodhini School, for students from 4th to 10th class.", Icon: GraduationCap, tone: "text-[#9d4c0e]" },
  { title: "Books", description: "Get valuable books to support learning and strengthen your preparation.", Icon: BookOpen, tone: "text-[#31597d]" },
];

function formatExamInfoDate(value) {
  if (!value) return "—";
  const dateValue = String(value).trim();
  const isoDate = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;

  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
    ? dateValue
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ExamInformation() {
  const [syllabus, setSyllabus] = useState([]);
  const [syllabusLoading, setSyllabusLoading] = useState(true);
  const [examSection, setExamSection] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([fetchSyllabus(), fetchExamSection(), fetchFAQs()]).then(([syllabusResult, sectionResult, faqResult]) => {
      if (!mounted) return;
      if (syllabusResult.status === "fulfilled") setSyllabus(syllabusResult.value);
      if (sectionResult.status === "fulfilled") setExamSection(sectionResult.value);
      if (faqResult.status === "fulfilled") setFaqs(faqResult.value);
      setSyllabusLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const liveExamInfo = examSection || {};
  const examEdition = liveExamInfo.name?.match(/20\d{2}(?:-\d{2,4})?/)?.[0] || "2026";

  return (
    <div className="exam-information-page">
      <PageHeader title={liveExamInfo.name || "Maharashtra Talent Hunt"} crumb="Exam Information" compact />

      <section className="relative isolate overflow-hidden bg-[#102b46]">
        <img
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=85&w=2000&auto=format&fit=crop"
          alt="Students learning in a classroom"
          className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,35,57,0.96)_0%,rgba(12,35,57,0.88)_42%,rgba(12,35,57,0.48)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(12,35,57,0.78)_0%,transparent_52%)]" />
        <div className="container-app relative flex min-h-[440px] items-center py-12 sm:min-h-[470px] md:min-h-[500px] md:py-16">
          <div className="max-w-3xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 border-l-2 border-[#f3bd63] pl-3 text-xs font-bold uppercase text-white/90">
              Maha Talent {examEdition} <span className="text-[#f3bd63]" aria-hidden="true">/</span> Registrations open
            </div>
            <h1 className="max-w-3xl text-[2.6rem] font-extrabold leading-[1.05] text-white sm:text-5xl md:text-6xl">
              {liveExamInfo.name || "Maharashtra Talent Hunt"}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Discover your academic potential through a scholarship examination designed for ambitious young learners.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-md bg-[#ed5a00] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(237,90,0,0.3)] transition hover:-translate-y-0.5 hover:bg-[#d94f00]">
                Register for the exam <ArrowRight size={16} />
              </Link>
              <a href="#exam-details" className="inline-flex items-center gap-2 rounded-md border border-white/45 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">
                View exam details <ArrowRight size={16} />
              </a>
            </div>
            <dl className="mt-9 grid max-w-2xl grid-cols-1 gap-4 border-t border-white/25 pt-5 sm:grid-cols-3 sm:gap-6">
              <div><dt className="text-xs text-white/65">Eligible classes</dt><dd className="mt-1 text-sm font-bold text-white">{liveExamInfo.eligibleClasses || "All students"}</dd></div>
              <div><dt className="text-xs text-white/65">Exam date</dt><dd className="mt-1 text-sm font-bold text-white">{formatExamInfoDate(liveExamInfo.examDate)}</dd></div>
              <div><dt className="text-xs text-white/65">Registration fee</dt><dd className="mt-1 text-sm font-bold text-white">{liveExamInfo.fee != null ? `₹${liveExamInfo.fee}` : "See exam details"}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e4d9c4] bg-[#fffdf8]">
        <nav className="container-app" aria-label="Sankalp resources">
          <div className="flex gap-5 overflow-x-auto">
            {quickLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                aria-current={to === "/sankalp/exam-information" ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-1 py-4 text-xs font-semibold transition-colors sm:text-sm ${
                  to === "/sankalp/exam-information"
                    ? "border-[#ed5a00] text-[#173b5f]"
                    : "border-transparent text-[#607382] hover:border-[#ed5a00]/50 hover:text-[#173b5f]"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </section>

      <section id="exam-details" className="bg-[#f8f5ee] pb-10 pt-7 md:pb-16 md:pt-10">
        <div className="container-app">
          <div className="relative mb-6 rounded-[26px] border border-[#e7dcc8] bg-[#fffdf8] px-4 py-5 shadow-[0_18px_42px_rgba(23,59,95,0.09)] md:px-8 md:py-7">
            <div className="mb-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-dark">Simple registration journey</p>
              <h2 className="mt-2 text-xl font-black text-navy sm:text-2xl md:text-3xl">Four steps to your <span className="text-gold-dark">Maha Talent</span> exam</h2>
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
                  {liveExamInfo.name || "Maharashtra Talent Hunt"}
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
                  {liveExamInfo.description || "No exam information is available right now."}
                </p>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80">
                  <dl className="divide-y divide-slate-200">
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Eligible Classes</dt>
                      <dd className="text-sm font-bold text-navy">{liveExamInfo.eligibleClasses}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Exam Date</dt>
                      <dd className="text-sm font-bold text-navy">{formatExamInfoDate(liveExamInfo.examDate)}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Registration Deadline</dt>
                      <dd className="text-sm font-bold text-navy">{formatExamInfoDate(liveExamInfo.registrationDeadline)}</dd>
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

          <section className="relative mt-6 overflow-hidden rounded-[28px] border border-[#f3e5c5] bg-[#fffdfa] px-4 py-8 shadow-[0_14px_40px_rgba(23,59,95,0.08)] sm:px-6 md:px-8 md:py-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative">
              <div className="mx-auto mb-7 max-w-2xl text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-dark">Rewards for your effort</p>
                <h2 className="mt-2 text-2xl font-black text-navy sm:text-3xl">Scholarships and Prizes</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Top performers can earn recognition, scholarships and exciting rewards.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {prizeHighlights.map(({ title, description, Icon, tone }) => (
                  <article key={title} className="group relative flex min-h-[240px] flex-col items-center overflow-hidden rounded-2xl border border-[#f3e5c5] bg-[#fff7e5] px-4 pb-5 pt-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="prize-card-wave" aria-hidden="true" />
                    <div className={`relative z-10 flex h-20 items-center justify-center ${tone}`}><Icon size={64} strokeWidth={1.35} className="transition duration-300 group-hover:scale-110" /></div>
                    <h3 className="relative z-10 mt-3 text-lg font-bold leading-tight text-navy">{title}</h3>
                    <p className="relative z-10 mt-3 text-sm leading-5 text-[#426078]">{description}</p>
                  </article>
                ))}
              </div>
              <div className="mt-7 flex justify-center"><Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-gold-dark">Register for MAHA TALENT 2026 <ArrowRight size={16} /></Link></div>
            </div>
          </section>

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
                    <div className="min-w-0">
                      <p className="font-bold text-navy">{item.title}</p>
                      {item.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>}
                    </div>
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
              {faqs.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#e8dfcf] px-5 py-8 text-center text-sm text-slate-500">No FAQs are available right now.</p>
              ) : faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return <div key={faq.question} className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${isOpen ? "border-[#ed5a00] shadow-[0_10px_24px_rgba(237,90,0,0.12)]" : "border-[#e8dfcf] hover:border-[#ed5a00]/50"}`}>
                  <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} className={`flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5 ${isOpen ? "!bg-[#ed5a00] !text-white" : "!bg-white !text-navy"}`} aria-expanded={isOpen}>
                    <span className="font-bold">{faq.question}</span>
                    <ChevronDown size={19} className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : "text-[#ed5a00]"}`} />
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
