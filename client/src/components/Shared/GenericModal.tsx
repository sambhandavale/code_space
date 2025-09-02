import React, { ReactNode, useEffect, useState } from "react";
import { MdClose } from "react-icons/md";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  closeOnOverlayClick = true,
  className = "",
}) => {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      // wait for animation before removing
      const timer = setTimeout(() => setShow(false), 250); // match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!show) return null;

  return (
    <div
      className={`modal-overlay ${isOpen ? "fade-in" : "fade-out"}`}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={`modal-container ${
          isOpen ? "scale-up" : "scale-down"
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || subtitle) && (
          <div className="modal-header-wrapper">
            {title && <div className="modal-header ff-google-n">{title}</div>}
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>
        )}

        <div className="modal-body">{children}</div>

        <button className="modal-close" onClick={onClose} aria-label="Close">
          <MdClose size={22} />
        </button>
      </div>
    </div>
  );
};

export default Modal;
