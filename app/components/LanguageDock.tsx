"use client";

import LanguageSwitcher from "./LanguageSwitcher";

export default function LanguageDock() {
  return (
    <div className="fixed right-5 top-5 z-40 hidden sm:block">
      <LanguageSwitcher />
    </div>
  );
}
