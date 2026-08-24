import React from "react";
export default function PageHeader({ title }) {
  return (
    <div className="bg-white dark:bg-[#172126] border-b border-black/5 dark:border-white/10">
      <div className="container-app py-10 md:py-14 text-center">
        <h1 className="page-header-title text-3xl md:text-5xl font-bold text-navy dark:text-white">{title}</h1>
      </div>
    </div>
  );
}
