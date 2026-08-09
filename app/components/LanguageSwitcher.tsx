"use client";

import { languageLabels, supportedLanguages, type SupportedLanguage } from "../../lib/i18n";
import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label
      className={
        compact
          ? "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white"
          : "inline-flex items-center gap-2 rounded-full border border-[rgba(32,34,31,0.1)] bg-white/45 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-carbon)] shadow-[0_10px_26px_rgba(32,34,31,0.05)] backdrop-blur-xl sm:text-xs"
      }
    >
      <span>{compact ? t("language.short") : t("language.label")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
        className={
          compact
            ? "bg-transparent text-xs font-semibold text-white outline-none"
            : "bg-transparent text-xs font-semibold text-[var(--color-carbon)] outline-none"
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
