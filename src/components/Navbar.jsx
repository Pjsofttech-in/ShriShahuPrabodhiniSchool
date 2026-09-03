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
  Target
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../asset/logo.png";

const examLinks = [
  { to: "/sankalp/exam-information", label: "Exam Information" },
  { to: "/sankalp/test-series", label: "Test Series" },
  { to: "/sankalp/ebook", label: "Ebook" },
  { to: "/sankalp/syllabus", label: "Syllabus" },
  { to: "/sankalp/answer-key", label: "Answer Key" },
  { to: "/sankalp/result-check", label: "Result Check" },
  { to: "/sankalp/results-pdf", label: "Results PDF" },
  { to: "/contact-us", label: "Contact Us" }
];

const moreLinks = [
  { to: "/about-us", label: "About Us" },
  { to: "/vision-mission", label: "Vision & Mission" },
  { to: "/download", label: "Downloads" },
];
const mobilePrimaryLinks = [
  { to: "/home", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/features", label: "Features" },
  { to: "/toppers", label: "Toppers" },
];
const mobileUtilityLinks = [
  { to: "/awards", label: "Awards", Icon: Award },
  { to: "/gallery", label: "Gallery", Icon: Images },
  { to: "/contact-us", label: "Contact", Icon: MessageCircle },
  { to: "/download", label: "Downloads", Icon: Download },
  { to: "/notifications", label: "Notifications", Icon: Bell },
];
const mobileMoreLinks = [
  { to: "/faculties", label: "Faculties", Icon: GraduationCap },
  { to: "/testimonials", label: "Testimonials", Icon: MessageCircle },
  { to: "/about-us", label: "About Us", Icon: Info },
  { to: "/vision-mission", label: "Vision & Mission", Icon: Target },
];
const navItemClass = ({ isActive }) =>
  `px-2 xl:px-3 py-2 text-sm font-semibold transition-colors rounded-md ${
    isActive
      ? "text-gold-dark dark:text-gold-light"
      : "text-navy hover:text-gold dark:text-slate-200 dark:hover:text-gold"
  }`;

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
        className="flex items-center gap-1 px-3 py-2 text-sm font-semibold tracking-wide text-navy hover:text-gold rounded-md focus-ring dark:text-slate-200 dark:hover:text-gold"
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

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const { user } = useAuth();

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
    <header className="sticky top-0 z-50 shadow-lg">
      {/* Top strip */}
      <div className="hidden md:block bg-navy-dark text-white/90 text-xs overflow-hidden border-b border-white/15">
        <div className="container-app overflow-hidden py-1.5">
          <div className="announcement-track flex w-max items-center gap-16 whitespace-nowrap hover:[animation-play-state:paused]">
            <span className="flex items-center gap-2"><Phone size={12} className="text-gold-light" /> 020-24451234 <span className="text-white/40">|</span> info@ssprabodhini.org <span className="text-white/40">|</span> Sankalp Scholarship Exam 2026 Registrations Open</span>
            <span className="flex items-center gap-2" aria-hidden="true"><Phone size={12} className="text-gold-light" /> 020-24451234 <span className="text-white/40">|</span> info@ssprabodhini.org <span className="text-white/40">|</span> Sankalp Scholarship Exam 2026 Registrations Open</span>
          </div>
        </div>
      </div>

      <nav className="bg-white/95 shadow-[0_8px_24px_rgba(38,50,56,0.12)] backdrop-blur-sm dark:border-b dark:border-white/10 dark:bg-[#172126]/95">
        <div className="flex min-h-16 w-full items-center justify-between px-3 py-2 xl:min-h-20 xl:px-6 xl:py-3">
          <Link to="/" className="flex min-w-0 shrink items-center gap-3 -ml-2 xl:-ml-4">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-white shadow-md xl:h-14 xl:w-14 dark:bg-[#263238]">
              <img src={logo} alt="Shri Shahu Prabodhini Logo" className="h-8 w-8 object-contain xl:h-10 xl:w-10" />
            </div>

            <div className="min-w-0 max-w-[170px] leading-tight">
              <h1 className="max-w-full break-words font-display text-base font-bold text-navy xl:text-lg dark:text-white">Shri Shahu Prabodhini</h1>
              <span className="block max-w-full break-words text-[10px] uppercase tracking-[0.18em] text-gold-dark xl:text-[11px]">Sankalp Foundation</span>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-0 2xl:flex 2xl:ml-6">
            <NavLink to="/home" className={navItemClass}>Home</NavLink>
            <Dropdown label="Sankalp" links={examLinks} />
            <NavLink to="/courses" className={navItemClass}>Courses</NavLink>
            <NavLink to="/features" className={navItemClass}>Features</NavLink>
            <NavLink to="/awards" className={navItemClass}>Awards</NavLink>
            <NavLink to="/toppers" className={navItemClass}>Toppers</NavLink>
            <NavLink to="/gallery" className={navItemClass}>Gallery</NavLink>
            <NavLink to="/faculties" className={navItemClass}>Experties</NavLink>
            <NavLink to="/testimonials" className={navItemClass}>Testimonial</NavLink>
            <NavLink to="/contact-us" className={navItemClass}>Contact</NavLink>
            <NavLink to="/about-us" className={navItemClass}>About</NavLink>
            <NavLink to="/vision-mission" className={navItemClass}>Vision</NavLink>

            <Link to="/download" className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-cream group dark:hover:bg-[#263238]" title="Downloads">
              <Download size={20} className="text-navy transition group-hover:text-gold dark:text-slate-200 dark:group-hover:text-gold" />
            </Link>

            <Link to="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-cream group dark:hover:bg-[#263238]" title="Notifications">
              <Bell size={20} className="text-navy transition group-hover:text-gold dark:text-slate-200 dark:group-hover:text-gold" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </Link>

            <button type="button" onClick={() => setDarkMode((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-full text-navy transition hover:bg-cream hover:text-gold dark:text-slate-200 dark:hover:bg-[#263238] dark:hover:text-gold" title={darkMode ? "Switch to light theme" : "Switch to dark theme"} aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}>
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <Link to={loginTarget} className="ml-3 flex items-center gap-2 rounded-lg bg-gold px-4 py-2 font-semibold text-white transition-all duration-300 hover:bg-gold-dark">
              <LogIn size={16} />
              {user ? (user.role === "student" ? "Profile" : "Dashboard") : "Login"}
            </Link>
          </div>

          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-slate-300 text-navy bg-white hover:bg-slate-50 hover:border-slate-400 2xl:hidden dark:text-slate-200 dark:bg-[#263238] dark:border-slate-600 dark:hover:bg-[#2f3d45] dark:hover:border-slate-500 transition-all duration-300" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="2xl:hidden border-t border-black/10 bg-white px-3 pb-4 pt-3 dark:border-white/10 dark:bg-[#172126]">
            <div className="rounded-2xl border border-black/5 bg-slate-50 p-2 shadow-[0_12px_30px_rgba(38,50,56,0.12)] dark:border-white/10 dark:bg-[#1d2a30]">
              <div className="grid grid-cols-5 gap-1">
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
                  className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${mobileDropdownOpen ? "bg-gold text-white shadow-md" : "text-navy hover:bg-white dark:text-slate-200 dark:hover:bg-[#263238]"}`}
                  aria-expanded={mobileDropdownOpen}
                >
                  Sankalp
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

              <div className="mt-2 flex items-center justify-between gap-1 border-t border-black/5 pt-2 dark:border-white/10">
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
                  className="group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[9px] font-medium text-muted transition hover:bg-white hover:text-gold-dark dark:text-slate-300 dark:hover:bg-[#263238] dark:hover:text-gold"
                  title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
                  aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
                >
                  {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                  <span className="truncate">Theme</span>
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-black/5 px-2 pt-2 dark:border-white/10">
                <div className="flex items-center gap-1.5 text-[10px] text-muted dark:text-slate-400">
                  <BookOpen size={13} className="text-gold" />
                  Explore more
                </div>
                <div className="flex items-center gap-3">
                  {mobileMoreLinks.map(({ to, label, Icon }) => (
                    <Link key={to} to={to} onClick={() => setMobileOpen(false)} title={label} aria-label={label} className="text-muted transition hover:text-gold dark:text-slate-400 dark:hover:text-gold">
                      <Icon size={15} />
                    </Link>
                  ))}
                  <Link to={loginTarget} onClick={() => setMobileOpen(false)} className="rounded-lg bg-gold px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-gold-dark">
                    {user ? (user.role === "student" ? "Profile" : "Dashboard") : "Login"}
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
