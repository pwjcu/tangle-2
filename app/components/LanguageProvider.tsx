"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
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

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window === "undefined") return "ko";

    return normalizeLanguage(window.localStorage.getItem("tangle-language"));
  });

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("tangle-language", language);
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
