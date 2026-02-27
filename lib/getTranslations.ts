export const getTranslations = (
  translations: any[],
  { lang }: string,
  field: string,
) => {
  if (!translations || translations.length === 0) return "Undefined";

  return (
    translations.find((t) => t.language === { lang })?.[field] ||
    translations.find((t) => t.language === "en")?.[field] ||
    translations[0]?.[field] ||
    "Undefined"
  );
};
