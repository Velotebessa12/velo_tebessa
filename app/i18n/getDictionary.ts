import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";

const dictionaries: any = { en, fr, ar };

export const getDictionary = ( lang : string) => {
  return dictionaries[ lang ] || dictionaries.en;
};
