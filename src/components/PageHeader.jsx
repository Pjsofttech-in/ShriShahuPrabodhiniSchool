import React from "react";
export default function PageHeader({ title }) {
  const titleWords = title.split(" ");

  return (
    <div className="border-b border-black/5 bg-gradient-to-r from-[#fffaf3] via-white to-[#f6f9ff] dark:border-white/10 dark:from-[#172126] dark:via-[#172126] dark:to-[#1c2b35]">
      <div className="container-app py-6 md:py-9 text-center">
        <div className="inline-flex items-center justify-center rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-gold-dark md:text-[11px]">
          Shri Shahu Prabodhini
        </div>
        <h1 className="page-header-title mt-4 text-[clamp(1.8rem,4vw,3.25rem)] font-bold tracking-[-0.03em] text-navy dark:text-white">
          {titleWords.map((word, index) => (
            <React.Fragment key={`${word}-${index}`}>
              {index > 0 && " "}
              <span className={index === 1 ? "text-gold-dark" : "text-navy dark:text-white"}>{word}</span>
            </React.Fragment>
          ))}
        </h1>
      </div>
    </div>
  );
}
