"use client";

import { languageLabels, supportedLanguages, type SupportedLanguage } from "../../lib/i18n";
import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <label
      className={
        compact
          ? "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white"
          : "inline-flex items-center gap-2 rounded-full border border-[#ded4f4] bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-sm"
      }
    >
      <span>{compact ? "Lang" : "Language"}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
        className={
          compact
            ? "bg-transparent text-xs font-semibold text-white outline-none"
            : "bg-transparent text-xs font-semibold text-stone-900 outline-none"
        }
      >
        {supportedLanguages.map((item) => (
          <option key={item} value={item} className="text-stone-900">
            {languageLabels[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
