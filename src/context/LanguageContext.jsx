import { createContext, useContext, useEffect, useState } from "react";

const translations = {
  en: {
    "nav.home": "Home",
    "nav.sankalp": "Maha Talent",
    "nav.courses": "Courses",
    "nav.mentors": "Mentors",
    "nav.awards": "Awards",
    "nav.toppers": "Toppers",
    "nav.gallery": "Gallery",
    "nav.faculty": "Faculty",
    "nav.testimonial": "Testimonial",
    "nav.contact": "Contact",
    "nav.about": "About",
    "nav.vision": "Vision",
    "nav.downloads": "Downloads",
    "nav.notifications": "Notifications",
    "nav.language": "Language",
    "nav.theme.dark": "Switch to dark theme",
    "nav.theme.light": "Switch to light theme",
    "nav.explore": "Explore more",
    "common.login": "Login",
    "common.profile": "Profile",
    "common.dashboard": "Dashboard",
    "common.theme": "Theme",
    "common.register": "Register",
    "common.registration": "Registration",
    "common.english": "English",
    "common.marathi": "मराठी",
    "common.marathiLabel": "Marathi",
    "common.languageEnglish": "English",
    "common.languageMarathi": "मराठी",
    "announcement": "8999571010 | shrishahuprabodhini@gmail.com | Maha Talent Scholarship Exam 2026 Registrations Open",
    "exam.information": "Exam Information",
    "exam.ebook": "Ebook",
    "exam.testSeries": "Test Series",
    "exam.syllabus": "Syllabus",
    "exam.answerKey": "Answer Key",
    "exam.resultCheck": "Result Check",
    "exam.resultsPdf": "Results PDF",
    "exam.contact": "Contact Us",
    "footer.quickLinks": "Quick Links",
    "footer.sankalpExam": "Maha Talent Exam",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms and Conditions",
    "footer.refund": "Refund Policy",
    "footer.contactUs": "Contact Us",
    "footer.designedBy": "Designed By",
    "footer.rights": "All Rights Reserved.",
    "footer.social": "Social media",
    "home.registrationOpen": "Now open for registration",
    "home.atAGlance": "At a glance",
    "home.examSnapshot": "Exam Snapshot",
    "home.eligibleClasses": "Eligible Classes",
    "home.getStarted": "Registration",
    "home.examDetails": "Exam Details",
    "home.exploreMore": "Explore more",
  },
  mr: {
    "nav.home": "मुख्य पान",
    "nav.sankalp": "महा टॅलेन्ट",
    "nav.courses": "कोर्स/अभ्यास",
    "nav.mentors": "मार्गदर्शक",
    "nav.awards": "पुरस्कार",
    "nav.toppers": "उत्कृष्ट विद्यार्थी",
    "nav.gallery": "फोटो/गॅलरी",
    "nav.faculty": "शिक्षक",
    "nav.testimonial": "प्रशंसा",
    "nav.contact": "संपर्क",
    "nav.about": "आमच्याबद्दल",
    "nav.vision": "दृष्टी",
    "nav.downloads": "डाउनलोड",
    "nav.notifications": "संदेश / सूचना",
    "nav.language": "भाषा",
    "nav.theme.dark": "गडद थीम लावा",
    "nav.theme.light": "हलकी थीम लावा",
    "nav.explore": "अधिक माहिती",
    "common.login": "लॉगिन",
    "common.profile": "प्रोफाइल",
    "common.dashboard": "डॅशबोर्ड",
    "common.theme": "थीम",
    "common.register": "नोंदणी करा",
    "common.registration": "नोंदणी",
    "common.english": "English",
    "common.marathi": "मराठी",
    "common.marathiLabel": "मराठी",
    "common.languageEnglish": "इंग्रजी",
    "common.languageMarathi": "मराठी",
    "announcement": "८९९९५७१०१० | shrishahuprabodhini@gmail.com | महा टॅलेन्ट शिष्यवृत्ती परीक्षा २०२६ साठी नोंदणी सुरू आहे",
    "exam.information": "परीक्षा माहिती",
    "exam.ebook": "ईबुक",
    "exam.testSeries": "टेस्ट सीरिज",
    "exam.syllabus": "अभ्यासक्रम",
    "exam.answerKey": "उत्तरं / उत्तरक",
    "exam.resultCheck": "परिणाम पाहा",
    "exam.resultsPdf": "परिणाम पीडीएफ",
    "exam.contact": "संपर्क करा",
    "footer.quickLinks": "द्रुत दुवे",
    "footer.sankalpExam": "महा टॅलेन्ट परीक्षा",
    "footer.contact": "संपर्क",
    "footer.privacy": "गोपनीयता धोरण",
    "footer.terms": "अटी व शर्ती",
    "footer.refund": "वापसी धोरण",
    "footer.contactUs": "संपर्क करा",
    "footer.designedBy": "डिझाइन केलेले",
    "footer.rights": "सर्व हक्क राखीव",
    "footer.social": "सोशल मीडिया",
    "home.registrationOpen": "नोंदणी सुरू आहे",
    "home.atAGlance": "एक झलक",
    "home.examSnapshot": "परीक्षेची माहिती",
    "home.eligibleClasses": "योग्य वर्ग",
    "home.getStarted": "नोंदणी करा",
    "home.examDetails": "परीक्षा तपशील",
    "home.exploreMore": "अधिक माहिती",
  },
};

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key, fallback = "") => fallback || key,
  isMarathi: false,
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const storedLanguage = typeof window !== "undefined" ? localStorage.getItem("site-language") : null;
    return storedLanguage === "mr" ? "mr" : "en";
  });

  useEffect(() => {
    document.documentElement.lang = language === "mr" ? "mr" : "en";
    localStorage.setItem("site-language", language);
  }, [language]);

  const t = (key, fallback = "") => translations[language]?.[key] ?? fallback ?? key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isMarathi: language === "mr" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
