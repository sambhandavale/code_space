import { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { CloseIcon } from "../../Layout/Sidebar";

interface IInputField {
  label?: string;
  subLabel?:string;
  wantLabel?:boolean;
  type?: string;
  placeholder?: string;
  value?: any;
  onChange: (value: any) => void;
  textarea?: boolean;
  className?: string;
  options?: string[];
  zIndex?:number;
}

const FormInputField = ({
  label = "",
  subLabel,
  wantLabel=true,
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  className = "",
  options = [],
  zIndex,
}: IInputField) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
    <div className={`form_input__field ${className}`} style={zIndex ? {zIndex:zIndex}:{}}>
      {wantLabel && label && 
        <div className="form_input__label ff-google-n">
          {label}
          {subLabel && <span>{subLabel}</span>}
        </div>
      }

      {type === "textarea" ? (
          <textarea
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="form_input__textarea glassmorphism-light ff-google-n"
          />
      ) : type === "dropdown" ? (
          <div ref={dropdownRef} className="form_input__dropdown pointer">
            <div
              className={`form_input__dropdown_header glassmorphism-light ff-google-n ${
                isOpen ? "open" : ""
              }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {value || placeholder}
              <IoIosArrowDown className={`dropdown_icon ${isOpen ? "rotated" : ""}`} />
            </div>

            {isOpen && (
              <div className="form_input__dropdown_options scrollbar">
                {options.length > 0 ? (
                  options.map((option, index) => (
                    <div
                      key={index}
                      className={`form_input__dropdown_option glassmorphism-medium ff-google-n ${
                        value === option ? "active" : ""
                      }`}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                      }}
                    >
                      {option}
                      {option === value && <img src="/icons/challenge/won.svg" style={{width:"1rem"}}/>}
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
        ) : type === "datetime" ? (
          <div ref={dropdownRef} className="form_input__dropdown pointer">
            <div
                className="form_input__dropdown_header glassmorphism-light ff-google-n"
                onClick={() => setIsDateOpen(true)}
            >
                <span className={`dropdown_text`}>
                {value
                    ? dayjs(value).format("DD MMM YYYY • hh:mm A")
                    : placeholder || ""}
                </span>
                <span style={{opacity:"0.5", fontSize:"0.75rem"}}>{userTimeZone}</span>
            </div>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                    value={value ? dayjs(value) : null}
                    onChange={(newValue: Dayjs | null) =>
                        onChange(newValue ? newValue.toISOString() : "")
                    }
                    open={isDateOpen}
                    onOpen={() => setIsDateOpen(true)}
                    onClose={() => setIsDateOpen(false)}
                    slotProps={{
                        textField: {
                        sx: {
                            position: "absolute",
                            width: 1,
                            height: 1,
                            opacity: 0,
                            pointerEvents: "none",
                        },
                        },
                    }}
                />
            </LocalizationProvider>
          </div>
      ) : type === "multi-dropdown" ? (
          <div ref={dropdownRef} className="form_input__multidropdown">
              <div
                className={`form_input__multidropdown_header glassmorphism-light ff-google-n ${value.length === 0 ? 'pointer' :''}  ${
                  isOpen ? "open" : ""
                }`}
                onClick={() => setIsOpen(!isOpen)}
              >
                {value && value.length > 0 ? (
                  <div className="form_input__multidropdown_selections">
                    {value.map((v, i) => (
                      <div 
                        key={i} 
                        className="form_input__multidropdown_selection glassmorphism-light ff-google-n"
                      >
                        {v}
                        <CloseIcon 
                          fontSize={14} 
                          className="pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = value.filter((tag: string) => tag !== v);
                            onChange(updated);
                            setIsOpen(false);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  placeholder
                )}

                <IoIosArrowDown className={`dropdown_icon pointer ${isOpen ? "rotated" : ""}`} />
              </div>

              {isOpen && (
                <div className="form_input__multidropdown_options scrollbar">
                  {options.length > 0 ? (
                    options.map((option, index) => (
                      <div
                        key={index}
                        className={`form_input__multidropdown_option pointer glassmorphism-medium ff-google-n ${
                          value === option ? "active" : ""
                        }`}
                        onClick={() => {
                          const safeValue = Array.isArray(value) ? value : [];
                          if (!safeValue.includes(option)) {
                            const updated = [...safeValue, option];
                            onChange(updated);
                          }
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
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="form_input__text glassmorphism-light ff-google-n"
            min={0}
          />
      )}
    </div>
  );
};

export default FormInputField;
