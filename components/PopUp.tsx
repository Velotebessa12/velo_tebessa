import React, { ReactNode, useEffect } from "react";

interface PopUpProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  showCloseButton?: boolean;
}

const PopUp: React.FC<PopUpProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = "",
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
        
      <div
        className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >

        {showCloseButton && (
          <div className="flex justify-end">
              <button
          onClick={onClose}
          className="border cursor-pointer w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
        >
          <span className="text-gray-700 text-xl font-light">×</span>
        </button>
          </div>
        )}

        {title && (
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
        )}

        <div className=" overflow-y-auto max-h-[700px]">{children}</div>

        
      </div>
    </div>
  );
};

export default PopUp;
