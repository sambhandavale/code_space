import React from "react";
import { AiOutlineClose } from "react-icons/ai";

interface IDescriptionPopup {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const DescriptionPopup = ({
  isOpen,
  onClose,
  title,
  children,
}: IDescriptionPopup) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div
        className="modal-content glassmorphism-dark"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "1.5rem 1.5rem",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "350px",
          zIndex: 1001,
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
          boxSizing: "border-box",
        }}
      >
        {/* Close Icon */}
        <AiOutlineClose
          onClick={onClose}
          size={24}
          style={{
            position: "absolute",
            top: "12px",
            right: "15px",
            cursor: "pointer",
            color: "white",
          }}
        />

        {/* Title */}
        <h2
          className="white ff-arp-150"
          style={{
            fontSize: "clamp(1.2rem, 2vw, 1.5rem)",
            marginBottom: "1rem",
            paddingRight: "2rem",
            lineHeight:"normal"
          }}
        >
          {title}
        </h2>

        {/* Content */}
        <div
          className="white"
          style={{
            fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
            wordBreak: "break-word",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default DescriptionPopup;
