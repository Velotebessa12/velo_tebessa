import React from "react";
import { Search, X } from "lucide-react";

const CustomInput = ({ value, onChange }) => {
  return (
    <div className="w-full max-w-xl mt-1 flex items-center bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-50 transition-all">
      <div className="relative flex flex-1 items-center">
        <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search bikes, parts, accessories…"
          className="w-full py-3.5 pl-11 pr-3 text-sm text-gray-800 bg-transparent outline-none font-medium placeholder-gray-400"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="pr-3 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        type="button"
        className="bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-bold px-6 py-3.5 transition-colors whitespace-nowrap"
      >
        Search
      </button>
    </div>
  );
};

export default CustomInput;