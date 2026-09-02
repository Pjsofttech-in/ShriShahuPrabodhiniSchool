import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenText,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutGrid,
  NotebookPen,
  ScrollText,
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { examInfo } from "../../data/siteData.js";

const quickLinks = [
  { label: "Pages", to: "/sankalp/exam-information", icon: LayoutGrid },
  { label: "Test Series", to: "/sankalp/test-series", icon: NotebookPen },
  { label: "Answer Key", to: "/sankalp/answer-key", icon: FileText },
  { label: "Ebook", to: "/sankalp/ebook", icon: BookOpenText },
  { label: "Result Check", to: "/sankalp/result-check", icon: FileCheck2 },
  { label: "Result PDF", to: "/sankalp/results-pdf", icon: ScrollText },
];

export default function ExamInformation() {
  return (
    <div>
      <PageHeader title="Sankalp Exam Information" crumb="Exam Information" />

      <section className="section-pad !pt-0 bg-cream/70">
        <div className="container-app">
          <div className="mb-8 flex flex-wrap gap-3">
            {quickLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  to === "/sankalp/exam-information"
                    ? "border-gold bg-gold text-white shadow-[0_10px_20px_rgba(255,109,0,0.16)]"
                    : "border-slate-200 bg-white text-navy hover:border-gold hover:text-gold-dark hover:shadow-sm"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_14px_40px_rgba(11,37,69,0.08)] md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
                  Shri Shahu Prabodhini
                </p>
                <h2 className="text-2xl font-black text-navy md:text-4xl">
                  {examInfo.name}
                </h2>
              </div>

              <div className="hidden rounded-full bg-gold/10 px-4 py-2 text-sm font-bold text-gold-dark md:inline-flex md:items-center md:gap-2">
                <GraduationCap size={16} />
                Premium Academic Platform
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
              <div>
                <p className="mb-6 text-base leading-7 text-slate-600">
                  The Sankalp Scholarship Exam is conducted every academic year to identify and reward talented students across Maharashtra. The exam evaluates conceptual clarity in Mathematics, Science, Language and General Knowledge appropriate to each class level, and top scorers are awarded scholarships, certificates and felicitation at the annual ceremony.
                </p>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80">
                  <dl className="divide-y divide-slate-200">
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Eligible Classes</dt>
                      <dd className="text-sm font-bold text-navy">{examInfo.eligibleClasses}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Exam Date</dt>
                      <dd className="text-sm font-bold text-navy">{examInfo.examDate}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Registration Deadline</dt>
                      <dd className="text-sm font-bold text-navy">{examInfo.registrationDeadline}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Registration Fee</dt>
                      <dd className="text-sm font-bold text-navy">₹{examInfo.fee}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Exam Pattern</dt>
                      <dd className="max-w-[18rem] text-right text-sm font-bold text-navy">{examInfo.pattern}</dd>
                    </div>
                    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm text-slate-500">Centers Available</dt>
                      <dd className="text-sm font-bold text-navy">{examInfo.centers}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="lg:pt-2">
                <div className="rounded-[24px] bg-navy p-6 text-white shadow-[0_18px_40px_rgba(11,37,69,0.18)]">
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
        </div>
      </section>
    </div>
  );
}
