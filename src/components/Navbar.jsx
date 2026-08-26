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
  Sun
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../asset/logo.png";

const examLinks = [
  { to: "/sankalp/exam-information", label: "Exam Information" },
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
const navItemClass = ({ isActive }) =>
  `px-2 xl:px-3 py-2 text-sm font-semibold transition-colors rounded-md ${
    isActive ? "text-gold-dark" : "text-navy hover:text-gold"
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
        className="flex items-center gap-1 px-3 py-2 text-sm font-semibold tracking-wide text-navy hover:text-gold rounded-md focus-ring"
        aria-expanded={open}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-black/5 py-2 z-50 animate-[fadeIn_.15s_ease]">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-ink hover:bg-cream hover:text-navy font-medium"
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

      <nav className="bg-white shadow-[0_8px_24px_rgba(38,50,56,0.12)]">
      <div className="w-full flex items-center justify-between h-16 xl:h-20 px-3 xl:px-6">
       <Link
  to="/"
  className="flex items-center gap-3 shrink-0 -ml-2 xl:-ml-4"
>
  {/* Logo */}
  <div className="w-12 h-12 xl:w-14 xl:h-14 rounded-full bg-white border-2 border-gold shadow-md overflow-hidden flex items-center justify-center">
    <img
      src={logo}
      alt="Shri Shahu Prabodhini Logo"
      className="w-9 h-9 xl:w-10 xl:h-10 object-contain"
    />
  </div>

  {/* School Name */}
  <div className="flex flex-col leading-tight">
    <h1 className="text-navy font-bold text-base xl:text-lg font-display whitespace-nowrap">
      Shri Shahu Prabodhini
    </h1>

    <span className="text-gold-dark text-[10px] xl:text-[11px] uppercase tracking-[0.18em] whitespace-nowrap">
      Sankalp 
    </span>
  </div>
</Link>
          {/* Desktop nav */}
        <div className="hidden xl:flex items-center gap-1 ml-4 xl:ml-10 flex-1">
          <NavLink to="/home" className={navItemClass}>Home</NavLink>
            <Dropdown label="Sankalp" links={examLinks} />
            <NavLink to="/courses" className={navItemClass}>Courses</NavLink>
            <NavLink to="/features" className={navItemClass}>Features</NavLink>
            <NavLink to="/awards" className={navItemClass}>Awards</NavLink>
            <NavLink to="/toppers" className={navItemClass}>Toppers</NavLink>
            <NavLink to="/gallery" className={navItemClass}>Gallery</NavLink>
            <NavLink to="/faculties" className={navItemClass}>Experties</NavLink>
            <NavLink to="/testimonials" className={navItemClass}>Testimonial</NavLink>
            <NavLink to="/contact-us" className={navItemClass}>
  Contact 
</NavLink>
            <NavLink to="/about-us" className={navItemClass}>About </NavLink>
            <NavLink to="/vision-mission" className={navItemClass}>Vision</NavLink>
            <Link
  to="/download"
  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-cream transition group"
  title="Downloads"
>
  <Download
    size={20}
    className="text-navy group-hover:text-gold transition"
  />
</Link>

<Link
  to="/notifications"
  className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-cream transition group"
  title="Notifications"
>
  <Bell
    size={20}
    className="text-navy group-hover:text-gold transition"
  />

  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
</Link>
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              className="flex items-center justify-center w-10 h-10 rounded-full text-navy hover:bg-cream hover:text-gold transition"
              title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
              aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <Link
  to={loginTarget}
  className="ml-3 flex-shrink-0 flex items-center gap-2 bg-gold hover:bg-gold-dark text-navy-dark font-semibold px-4 py-2 rounded-lg transition-all duration-300"
>
  <LogIn size={16} />
  {user ? (user.role === "student" ? "Profile" : "Dashboard") : "Login"}
</Link>
          </div>

          {/* Mobile toggle */}
          <button className="xl:hidden text-navy" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="xl:hidden bg-white border-t border-black/10 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col py-2">
              {[
                { to: "/", label: "Home" },
                ...examLinks.map((l) => ({ ...l, label: `Sankalp: ${l.label}` })),
                { to: "/courses", label: "Courses" },
                { to: "/features", label: "Features" },
                { to: "/awards", label: "Awards" },
                { to: "/toppers", label: "Toppers" },
                { to: "/gallery", label: "Gallery" },
                { to: "/faculties", label: "Faculties" },
                { to: "/testimonials", label: "Testimonial" },
                { to: "/contact-us", label: "Contact Us" },
                { to: "/about-us", label: "About Us" },
                { to: "/vision-mission", label: "Vision & Mission" },
                { to: "/download", label: "Downloads" },
{ to: "/notifications", label: "Notifications" },
                { to: loginTarget, label: user ? (user.role === "student" ? "Profile" : "Dashboard") : "Login" },
              ].map((l) => (
                <Link
                  key={l.to + l.label}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-5 py-3 text-sm font-semibold text-navy border-b border-black/5 hover:bg-cream"
                >
                  {l.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-navy border-b border-black/5 hover:bg-cream text-left"
              >
                {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                {darkMode ? "Light Theme" : "Dark Theme"}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
