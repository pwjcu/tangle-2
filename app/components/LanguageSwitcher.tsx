"use client";

import { languageLabels, supportedLanguages, type SupportedLanguage } from "../../lib/i18n";
import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher({ compact = false, compactLight = false }: { compact?: boolean; compactLight?: boolean }) {
  const { language, setLanguage, t } = useLanguage();

  const labelClass = compact
    ? "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white"
    : compactLight
      ? "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-silver-mist)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-carbon)]"
      : "inline-flex items-center gap-2 rounded-full border border-[var(--color-silver-mist)] bg-white px-3 py-2 text-[12px] font-semibold text-[var(--color-carbon)]";

  return (
    <label className={labelClass}>
      <span className={compactLight ? "sr-only" : undefined}>{compact ? t("language.short") : t("language.label")}</span>
      {compactLight && <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" /></svg>}
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
        className={compact ? "bg-transparent text-xs font-semibold text-white outline-none" : "bg-transparent text-[12px] font-semibold text-[var(--color-carbon)] outline-none"}
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
