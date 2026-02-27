"use client";

import { createContext, useContext } from "react";

type LanguageContextType = {
  lang: string;
  dict: any;
};

export const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang must be used inside LanguageProvider");
  }
  return ctx;
};
