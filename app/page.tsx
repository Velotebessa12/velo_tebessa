import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLang = headersList.get("accept-language") || "";

  let lang = "en";

  if (acceptLang.includes("fr")) lang = "fr";
  else if (acceptLang.includes("ar")) lang = "ar";

  redirect(`/${lang}`);
}
