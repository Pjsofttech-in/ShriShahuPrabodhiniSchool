import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";

import { fetchFooter } from "../services/backendService";
import pjLogo from "../asset/image.png";
import Logo from "../asset/logo.png";

export default function Footer() {
  const [footer, setFooter] = useState(null);

  useEffect(() => {
    let active = true;
    fetchFooter()
      .then((data) => active && data && setFooter(data))
      .catch((error) => console.warn("Failed to load footer information:", error));

    return () => {
      active = false;
    };
  }, []);

  const footerData = {
    address: footer?.address ?? "",
    phone: footer?.phone ?? "",
    email: footer?.email ?? "",
    instagram: footer?.instagram ?? "",
    facebook: footer?.facebook ?? "",
    twitter: footer?.twitter ?? "",
    youtube: footer?.youtube ?? "",
    whatsapp: footer?.whatsapp ?? "",
  };

  return (
    <footer className="bg-navy-dark text-white">
      <div className="container-app py-12 md:py-14">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-white shadow-md">
                <img src={Logo} alt="Shri Shahu Prabodhini" className="h-9 w-9 object-contain" />
              </div>

              <div>
                <h3 className="font-display text-lg font-bold leading-tight text-white">Shri Shahu Prabodhini</h3>
                <p className="text-sm text-gold">SANKALP EXAM</p>
              </div>
            </div>

            <p className="text-sm leading-6 text-white/70">
              Empowering students through the Sankalp Scholarship Examination and quality academic guidance.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {[
                { href: footerData.facebook, Icon: FaFacebookF, className: "hover:bg-[#1877F2] hover:border-[#1877F2]" },
                { href: footerData.instagram, Icon: FaInstagram, className: "hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af] hover:border-transparent" },
                { href: footerData.youtube, Icon: FaYoutube, className: "hover:bg-[#FF0000] hover:border-[#FF0000]" },
                { href: footerData.twitter, Icon: FaTwitter, className: "hover:bg-[#1DA1F2] hover:border-[#1DA1F2]" },
                { href: footerData.whatsapp, Icon: FaWhatsapp, className: "hover:bg-[#25D366] hover:border-[#25D366]" },
              ].map(({ href, Icon, className }, index) => (
                <a
                  key={href || `social-link-${index}`}
                  href={href || "#"}
                  aria-label="Social media"
                  className={`group flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 shadow-[0_6px_18px_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:text-white ${className}`}
                >
                  <Icon className="text-base transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-5 font-display text-lg font-bold text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm text-white/75">
              <li><Link to="/courses" className="hover:text-gold transition">Courses</Link></li>
              <li><Link to="/toppers" className="hover:text-gold transition">Toppers</Link></li>
              <li><Link to="/gallery" className="hover:text-gold transition">Gallery</Link></li>
              <li><Link to="/faculties" className="hover:text-gold transition">Faculties</Link></li>
              <li><Link to="/download" className="hover:text-gold transition">Downloads</Link></li>
              <li><Link to="/register" className="hover:text-gold transition">Student Registration</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-display text-lg font-bold text-white">Sankalp Exam</h3>
            <ul className="space-y-3 text-sm text-white/75">
              <li><Link to="/sankalp/exam-information" className="hover:text-gold transition">Exam Information</Link></li>
              <li><Link to="/sankalp/syllabus" className="hover:text-gold transition">Syllabus</Link></li>
              <li><Link to="/sankalp/answer-key" className="hover:text-gold transition">Answer Key</Link></li>
              <li><Link to="/sankalp/result-check" className="hover:text-gold transition">Result Check</Link></li>
              <li><Link to="/sankalp/results-pdf" className="hover:text-gold transition">Results PDF</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-display text-lg font-bold text-white">Contact</h3>
            <div className="space-y-4 text-sm text-white/75">
              <div className="flex gap-3">
                <MapPin size={18} className="mt-1 shrink-0 text-gold" />
                <span>{footerData.address}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gold" />
                <a href={`tel:${footerData.phone}`} className="hover:text-gold transition">{footerData.phone}</a>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gold" />
                <a href={`mailto:${footerData.email}`} className="hover:text-gold transition">{footerData.email}</a>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/75">
              <Link to="/privacy-policy" className="hover:text-gold transition">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-gold transition">Terms and Conditions</Link>
              <Link to="/refund-policy" className="hover:text-gold transition">Refund Policy</Link>
              <Link to="/contact-us" className="hover:text-gold transition">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-app flex flex-col items-center justify-center gap-3 text-center text-sm text-white/60 md:flex-row">
          <span>© {new Date().getFullYear()} Shri Shahu Prabodhini. All Rights Reserved.</span>
          <span className="hidden text-white/30 md:block">|</span>
          <div className="flex items-center justify-center gap-2">
            <span>Designed By</span>
            <img src={pjLogo} alt="PJSoftTech" className="h-6 w-auto object-contain" />
            <a
              href="https://pjsofttech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white transition hover:text-gold"
            >
              PJSOFTTECH Pvt. Ltd.
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}