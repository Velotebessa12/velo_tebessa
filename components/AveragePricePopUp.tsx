import { Calculator } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AveragePricePopUp({
  currentPrice = 0,
  newPrice,
  setNewPrice,
  isOpen,
  onToggle,
  onConfirm,
  disabled = false,
}: any) {
  const handleToggle = () => {
    const price = Number(currentPrice);

    if (disabled) return;

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("You must put price first!");
      return;
    }

    onToggle();
  };

 const handleConfirm = () => {
  const base = Number(currentPrice);
  const incoming = Number(newPrice);
  console.log(base , incoming)
  if (!Number.isFinite(base) || base < 0) {
    toast.error("Current price is invalid");
    return;
  }

  if (!Number.isFinite(incoming) || incoming < 0) {
    toast.error("New price is invalid");
    return;
  }

  const average = (base + incoming) / 2;

  onConfirm(average);
};

  return (
    <div className="relative inline-block">
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleToggle}
        title="Override price"
        className="
          flex items-center justify-center
          p-1.5
          rounded-md
          bg-blue-50 text-teal-600
          hover:bg-teal-100
          border border-teal-200
          transition
        "
      >
        <Calculator className="w-6 h-6" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          className="
            absolute right-0 top-9 z-30
            w-44
            bg-white
            border border-slate-200
            rounded-lg
            shadow-lg
            p-3
            text-xs
          "
        >
          {/* Current price */}
          <div className="mb-2 text-gray-600">
            Current:{" "}
            <span className="font-semibold">
              {currentPrice.toLocaleString()} DA
            </span>
          </div>

          {/* Input */}
          <input
            type="number"
            min={0}
            placeholder="New price"
            value={newPrice}
            onChange={(e) =>
              setNewPrice(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="
              w-full mb-2
              rounded-md
              border border-gray-300
              px-2 py-1
              text-xs
              focus:ring-1 focus:ring-gray-200
              focus:border-gray-200
              outline-none
            "
          />

          {/* Confirm */}
          <button
            type="button"
            onClick={handleConfirm}
            className="
              w-full
              bg-teal-600
              text-white
              rounded-md
              py-1
              text-xs
              hover:bg-teal-700
              transition
            "
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}