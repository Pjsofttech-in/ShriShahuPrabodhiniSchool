import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  LogIn,
  Phone,
  Download,
  Bell,
  Moon,
  Sun,
  Award,
  Images,
  MessageCircle,
  BookOpen,
  GraduationCap,
  Info,
  Target,
  Languages,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import logo from "../asset/logo.png";

const getExamLinks = (t) => [
  { to: "/sankalp/exam-information", label: t("exam.information") },
  { to: "/sankalp/ebook", label: t("exam.ebook") },
  { to: "/sankalp/test-series", label: t("exam.testSeries") },
  { to: "/sankalp/syllabus", label: t("exam.syllabus") },
  { to: "/sankalp/answer-key", label: t("exam.answerKey") },
  { to: "/sankalp/result-check", label: t("exam.resultCheck") },
  { to: "/sankalp/results-pdf", label: t("exam.resultsPdf") },
  { to: "/contact-us", label: t("exam.contact") },
];

const navItemClass = ({ isActive }) =>
  `px-2 xl:px-3 py-2 text-sm font-semibold transition-all duration-300 rounded-md hover:-translate-y-0.5 hover:bg-[#fff0df] hover:shadow-[0_6px_14px_rgba(232,101,22,0.10)] ${
    isActive
      ? "text-[#e86516] dark:text-[#ffb36b]"
      : "text-navy hover:text-[#e86516] dark:text-slate-200 dark:hover:text-[#ffb36b]"
  }`;

function BrandMark() {
  return (
    <div className="ml-2 flex min-w-0 shrink items-center md:ml-3">
      <img src={logo} alt="Shri Shahu Prabodhini School" className="h-14 w-auto object-contain drop-shadow-[0_6px_10px_rgba(23,59,95,0.18)] md:h-16 xl:h-[4.3rem]" />
    </div>
  );
}

function Dropdown({ label, links }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="sankalp-trigger flex items-center gap-1 px-3 py-2 text-sm font-semibold tracking-wide text-navy hover:text-gold rounded-md focus-ring dark:text-slate-200 dark:hover:text-gold"
        aria-expanded={open}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 mt-1 w-64 rounded-lg border border-black/5 bg-white py-2 shadow-xl z-50 animate-[fadeIn_.15s_ease] dark:border-white/10 dark:bg-[#1b2a2f]">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-ink hover:bg-cream hover:text-navy dark:text-slate-100 dark:hover:bg-[#263238] dark:hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy transition hover:border-[#e86516] hover:text-gold dark:border-slate-600 dark:bg-[#1d2a30] dark:text-slate-200 dark:hover:border-[#ffb36b]"
        aria-expanded={open}
      >
        <Languages size={16} />
        <span>{language === "mr" ? t("common.marathi") : t("common.english")}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-black/5 bg-white py-2 shadow-xl dark:border-white/10 dark:bg-[#1b2a2f]">
          {[
            { value: "en", label: "English" },
            { value: "mr", label: "मराठी" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setLanguage(option.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-sm font-medium transition ${
                language === option.value ? "bg-cream text-navy dark:bg-[#263238] dark:text-gold" : "text-ink hover:bg-cream hover:text-navy dark:text-slate-100 dark:hover:bg-[#263238]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  const examLinks = getExamLinks(t);
  const mobilePrimaryLinks = [
    { to: "/home", label: t("nav.home") },
    { to: "/courses", label: t("nav.courses") },
    { to: "/features", label: t("nav.mentors") },
    { to: "/toppers", label: t("nav.toppers") },
  ];
  const mobileUtilityLinks = [
    { to: "/awards", label: t("nav.awards"), Icon: Award },
    { to: "/gallery", label: t("nav.gallery"), Icon: Images },
    { to: "/contact-us", label: t("nav.contact"), Icon: MessageCircle },
    { to: "/download", label: t("nav.downloads"), Icon: Download },
    { to: "/notifications", label: t("nav.notifications"), Icon: Bell },
  ];
  const mobileMoreLinks = [
    { to: "/faculties", label: t("nav.faculty"), Icon: GraduationCap },
    { to: "/testimonials", label: t("nav.testimonial"), Icon: MessageCircle },
    { to: "/about-us", label: t("nav.about"), Icon: Info },
    { to: "/vision-mission", label: t("nav.vision"), Icon: Target },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const loginTarget = user
    ? user.role === "admin"
      ? "/admin/dashboard"
      : user.role === "coordinator"
      ? "/coordinator/dashboard"
      : "/student/profile"
    : "/login";

  return (
    <header className="fixed inset-x-0 top-0 z-50 shadow-[0_10px_30px_rgba(23,59,95,0.10)]">
      <div className="hidden overflow-hidden border-b border-[#d87838]/40 bg-[linear-gradient(90deg,#f6a23a_0%,#ed6a16_48%,#f3bd63_100%)] text-xs text-white shadow-[0_4px_14px_rgba(232,101,22,0.16)] md:block">
        <div className="container-app overflow-hidden py-1.5">
          <div className="announcement-track flex w-max items-center gap-16 whitespace-nowrap text-white hover:[animation-play-state:paused]">
            <span className="flex items-center gap-2 font-semibold text-white">
              <Phone size={12} className="text-white" />
              {t("announcement")}
            </span>
            <span className="flex items-center gap-2 font-semibold text-white" aria-hidden="true">
              <Phone size={12} className="text-white" />
              {t("announcement")}
            </span>
          </div>
        </div>
      </div>

      <nav className="border-b-2 border-[#e86516]/25 bg-[linear-gradient(100deg,#fffdf8_0%,#fff9f1_58%,#fff0df_100%)] shadow-[0_10px_28px_rgba(232,101,22,0.13)] backdrop-blur-sm dark:border-b dark:border-white/10 dark:bg-[#12273d]/95">
        <div className="flex min-h-16 w-full items-center justify-between px-3 py-2 xl:min-h-20 xl:px-6 xl:py-3">
          <Link to="/" className="-ml-2 flex min-w-0 shrink items-center xl:-ml-4">
            <BrandMark />
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-0 xl:flex xl:ml-6">
            <NavLink to="/home" className={navItemClass}>{t("nav.home")}</NavLink>
            <Dropdown label={t("nav.sankalp")} links={examLinks} />
            <NavLink to="/courses" className={navItemClass}>{t("nav.courses")}</NavLink>
            <NavLink to="/features" className={navItemClass}>{t("nav.mentors")}</NavLink>
            <NavLink to="/awards" className={navItemClass}>{t("nav.awards")}</NavLink>
            <NavLink to="/toppers" className={navItemClass}>{t("nav.toppers")}</NavLink>
            <NavLink to="/gallery" className={navItemClass}>{t("nav.gallery")}</NavLink>
            <NavLink to="/faculties" className={navItemClass}>{t("nav.faculty")}</NavLink>
            <NavLink to="/testimonials" className={navItemClass}>{t("nav.testimonial")}</NavLink>
            <NavLink to="/contact-us" className={navItemClass}>{t("nav.contact")}</NavLink>
            <NavLink to="/about-us" className={navItemClass}>{t("nav.about")}</NavLink>
            <NavLink to="/vision-mission" className={navItemClass}>{t("nav.vision")}</NavLink>

            <Link to="/download" className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-cream group dark:hover:bg-[#263238]" title={t("nav.downloads")}>
              <Download size={20} className="text-navy transition group-hover:text-gold dark:text-slate-200 dark:group-hover:text-gold" />
            </Link>

            <Link to="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-cream group dark:hover:bg-[#263238]" title={t("nav.notifications")}>
              <Bell size={20} className="text-navy transition group-hover:text-gold dark:text-slate-200 dark:group-hover:text-gold" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </Link>

            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              className="theme-toggle flex h-10 w-10 items-center justify-center rounded-full text-navy transition hover:bg-cream hover:text-gold dark:text-slate-200 dark:hover:bg-[#263238] dark:hover:text-gold"
              title={darkMode ? t("nav.theme.light") : t("nav.theme.dark")}
              aria-label={darkMode ? t("nav.theme.light") : t("nav.theme.dark")}
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <LanguageSelector />

            <Link to={loginTarget} className="ml-3 flex items-center gap-2 rounded-lg bg-[#e86516] px-4 py-2 font-semibold text-white shadow-[0_8px_18px_rgba(232,101,22,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c84c0b] hover:shadow-[0_12px_24px_rgba(232,101,22,0.30)]">
              <LogIn size={16} />
              {user ? (user.role === "student" ? t("common.profile") : t("common.dashboard")) : t("common.login")}
            </Link>
          </div>

          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-slate-300 text-navy bg-white hover:bg-slate-50 hover:border-slate-400 xl:hidden dark:text-slate-200 dark:bg-[#263238] dark:border-slate-600 dark:hover:bg-[#2f3d45] dark:hover:border-slate-500 transition-all duration-300" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="xl:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-black/10 bg-white px-3 pb-4 pt-3 dark:border-white/10 dark:bg-[#172126]">
            <div className="rounded-2xl border border-black/5 bg-slate-50 p-2 shadow-[0_12px_30px_rgba(38,50,56,0.12)] dark:border-white/10 dark:bg-[#1d2a30]">
              <div className="grid grid-cols-3 gap-1 sm:grid-cols-5">
                {mobilePrimaryLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `rounded-xl px-2 py-2.5 text-center text-xs font-semibold transition ${isActive ? "bg-navy text-white shadow-md" : "text-navy hover:bg-white dark:text-slate-200 dark:hover:bg-[#263238]"}`}
                  >
                    {link.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={() => setMobileDropdownOpen((open) => !open)}
                  className={`sankalp-trigger flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${mobileDropdownOpen ? "bg-gold text-white shadow-md" : "text-navy hover:bg-white dark:text-slate-200 dark:hover:bg-[#263238]"}`}
                  aria-expanded={mobileDropdownOpen}
                >
                  {t("nav.sankalp")}
                  <ChevronDown size={13} className={`transition-transform ${mobileDropdownOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {mobileDropdownOpen && (
                <div className="mt-2 grid grid-cols-2 gap-1 border-t border-black/5 pt-2 dark:border-white/10">
                  {examLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileDropdownOpen(false);
                      }}
                      className="rounded-lg px-3 py-2 text-xs font-medium text-navy transition hover:bg-white hover:text-gold-dark dark:text-slate-200 dark:hover:bg-[#263238] dark:hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-2 grid grid-cols-4 gap-1 border-t border-black/5 pt-2 dark:border-white/10">
                {mobileUtilityLinks.map(({ to, label, Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[9px] font-medium text-muted transition hover:bg-white hover:text-gold-dark dark:text-slate-300 dark:hover:bg-[#263238] dark:hover:text-gold"
                    title={label}
                    aria-label={label}
                  >
                    <Icon size={17} className="transition-transform group-hover:-translate-y-0.5" />
                    <span className="truncate">{label}</span>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => setDarkMode((value) => !value)}
                  className="theme-toggle group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[9px] font-medium text-muted transition hover:bg-white hover:text-gold-dark dark:text-slate-300 dark:hover:bg-[#263238] dark:hover:text-gold"
                  title={darkMode ? t("nav.theme.light") : t("nav.theme.dark")}
                  aria-label={darkMode ? t("nav.theme.light") : t("nav.theme.dark")}
                >
                  {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                  <span className="truncate">{t("common.theme")}</span>
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-black/5 px-2 pt-2 dark:border-white/10">
                <div className="flex items-center gap-1.5 text-[10px] text-muted dark:text-slate-400">
                  <BookOpen size={13} className="text-gold" />
                  {t("nav.explore")}
                </div>
                <div className="flex items-center gap-3">
                  {mobileMoreLinks.map(({ to, label, Icon }) => (
                    <Link key={to} to={to} onClick={() => setMobileOpen(false)} title={label} aria-label={label} className="text-muted transition hover:text-gold dark:text-slate-400 dark:hover:text-gold">
                      <Icon size={15} />
                    </Link>
                  ))}
                  <Link to={loginTarget} onClick={() => setMobileOpen(false)} className="rounded-lg bg-gold px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-gold-dark">
                    {user ? (user.role === "student" ? t("common.profile") : t("common.dashboard")) : t("common.login")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
