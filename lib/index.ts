import { ALGERIAN_WILAYAS } from "@/data"; 

const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function getWilayaCodeByName(wilayaName: string): string | undefined {
  if (!wilayaName) return undefined;

  const target = normalize(wilayaName);

  return ALGERIAN_WILAYAS.find(
    w => normalize(w.name) === target
  )?.code;
}
