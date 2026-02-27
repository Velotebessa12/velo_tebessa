"use client";

import { LanguageContext } from "./LanguageContext";

export default function LanguageProvider({
  lang,
  dict,
  children,
}: {
  lang: string;
  dict: any;
  children: React.ReactNode;
}) {
  return (
    <LanguageContext.Provider value={{ lang, dict }}>
      {children}
    </LanguageContext.Provider>
  );
}
