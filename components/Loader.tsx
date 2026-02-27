import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center py-8 sm:py-10 md:py-12">
  <Loader2
    className="
      animate-spin text-teal-600
      w-8 h-8
      sm:w-10 sm:h-10
      md:w-12 md:h-12
      lg:w-14 lg:h-14
    "
  />
</div>
  );
}
