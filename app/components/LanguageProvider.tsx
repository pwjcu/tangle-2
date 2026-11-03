"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { getTranslation, supportedLanguages, type SupportedLanguage } from "../../lib/i18n";

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function normalizeLanguage(value: string | null): SupportedLanguage {
  if (value && supportedLanguages.includes(value as SupportedLanguage)) {
    return value as SupportedLanguage;
  }

  return "ko";
}

let currentLanguage: SupportedLanguage = "ko";
let memoryOnly = false;
function readLanguage() {
  if (memoryOnly) return currentLanguage;
  try { return normalizeLanguage(window.localStorage.getItem("tangle-language")); }
  catch { return currentLanguage; }
}
function subscribeLanguage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("tangle-language-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("tangle-language-change", onChange);
  };
}
function setLanguageState(language: SupportedLanguage) {
  currentLanguage = language;
  try { window.localStorage.setItem("tangle-language", language); memoryOnly = false; } catch { memoryOnly = true; }
  window.dispatchEvent(new Event("tangle-language-change"));
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribeLanguage, readLanguage, () => "ko" as SupportedLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: (key: string) => getTranslation(language, key),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
