interface IInputField {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  className?: string;
}

const InputField = ({
  label="",
  type = "text",
  placeholder = "",
  value,
  onChange,
  textarea = false,
  className = "",
}:IInputField) => (
  <div className="input__field">
    {label && <div className="input__label">{label}</div>}
    {textarea ? (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input__textarea glassmorphism-light ff-google-n ${className}`}
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input__box glassmorphism-light ff-google-n ${className}`}
      />
    )}
  </div>
);

export default InputField;
