"use client";

import LanguageSwitcher from "./LanguageSwitcher";

export default function LanguageDock() {
  return (
    <div className="fixed bottom-5 left-5 z-40 hidden sm:block">
      <LanguageSwitcher />
    </div>
  );
}
