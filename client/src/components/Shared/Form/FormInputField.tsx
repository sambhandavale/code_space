import { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface IInputField {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  className?: string;
  options?: string[];
}

const FormInputField = ({
  label = "",
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  className = "",
  options = [],
}: IInputField) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`form_input__field ${className}`}>
      {label && <div className="form_input__label ff-google-n">{label}</div>}

      {type === "textarea" ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="form_input__textarea glassmorphism-light ff-google-n"
        />
      ) : type === "select" ? (
        <div ref={dropdownRef} className="form_input__dropdown pointer">
          <div
            className={`form_input__dropdown_header glassmorphism-light ff-google-n ${
              isOpen ? "open" : ""
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={`dropdown_text ${value ? "selected" : "placeholder"}`}>
              {value || placeholder}
            </span>
            <IoIosArrowDown className={`dropdown_icon ${isOpen ? "rotated" : ""}`} />
          </div>

          {isOpen && (
            <div className="form_input__dropdown_options">
              {options.length > 0 ? (
                options.map((option, index) => (
                  <div
                    key={index}
                    className={`form_input__dropdown_option glassmorphism-light ff-google-n ${
                      value === option ? "active" : ""
                    }`}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                  >
                    {option}
                  </div>
                ))
              ) : (
                <div className="form_input__dropdown_option disabled">
                  No options available
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="form_input__text glassmorphism-light ff-google-n"
        />
      )}
    </div>
  );
};

export default FormInputField;
