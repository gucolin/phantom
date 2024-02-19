import React, { useRef, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  hideCloseButton,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOffClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="flex bg-slate-200 rounded-lg max-w-lg"
      >
        {children}
        {!hideCloseButton && (
          <div className="flex justify-end m-2">
            <button
              onClick={onClose}
              className="w-5 h-5 flex items-center justify-center text-slate-600 cursor-pointer bg-transparent border-none hover:bg-slate-300 hover:bg-opacity-40"
            >
              <span className="text-3xl leading-none">&times;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
