import React from "react";
export default function PageHeader({ title, compact = false, accentTitle = false, accentTitleClass = "text-gold-dark" }) {
  const titleWords = title.split(" ");

  return (
    <div className="border-b border-black/5 bg-gradient-to-r from-[#fffaf3] via-white to-[#f6f9ff] dark:border-white/10 dark:from-[#172126] dark:via-[#172126] dark:to-[#1c2b35]">
      <div className={`container-app text-center ${compact ? "py-3 md:py-4" : "py-6 md:py-9"}`}>
        <div className="inline-flex items-center justify-center rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-gold-dark md:text-[11px]">
          Shri Shahu Prabodhini
        </div>
        <h1 className={`page-header-title font-bold tracking-[-0.03em] text-navy dark:text-white ${compact ? "mt-2 text-[clamp(1.5rem,3vw,2.4rem)]" : "mt-4 text-[clamp(1.8rem,4vw,3.25rem)]"}`}>
          {titleWords.map((word, index) => (
            <React.Fragment key={`${word}-${index}`}>
              {index > 0 && " "}
              <span className={accentTitle || index === 1 ? accentTitleClass : "text-navy dark:text-white"}>{word}</span>
            </React.Fragment>
          ))}
        </h1>
      </div>
    </div>
  );
}
