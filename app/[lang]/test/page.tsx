"use client"

import { useLang } from "@/components/LanguageContext";

export default function Page() {
  const { lang, dict } = useLang();

  return (
    <div>
      <h1>{dict.home.title}</h1>
      <p>{dict.home.description}</p>
      <button>{dict.common.login}</button>
    </div>
  );
}