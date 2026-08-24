import React from "react";
export default function PageHeader({ title }) {
  const titleWords = title.split(" ");

  return (
    <div className="bg-white dark:bg-[#172126] border-b border-black/5 dark:border-white/10">
      <div className="container-app py-6 md:py-9 text-center">
        <h1 className="page-header-title text-2xl sm:text-3xl md:text-4xl font-bold text-navy dark:text-white">
          {titleWords.map((word, index) => (
            <React.Fragment key={`${word}-${index}`}>
              {index > 0 && " "}
              <span className={index === 1 ? "text-gold" : "text-navy dark:text-white"}>{word}</span>
            </React.Fragment>
          ))}
        </h1>
      </div>
    </div>
  );
}
