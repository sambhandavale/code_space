import React, { useState } from 'react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

interface FormField {
  label?: string;
  name: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ariaLabel?: string;
  className?: string;
}

interface InputRow {
  fields: FormField[]; // inputs per row
}

interface GenericFormContainerProps {
  title: React.ReactNode;
  switchText?: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  submitText?: string;
  inputRows: InputRow[];
  className?: string;
  extraContentAboveSubmit?: React.ReactNode; // 👈 NEW
}

const GenericFormContainer = ({
  title,
  switchText,
  onSubmit,
  loading = false,
  submitText = 'Submit',
  inputRows,
  className = '',
  extraContentAboveSubmit,
}: GenericFormContainerProps) => {
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});

  const togglePasswordVisibility = (fieldName: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  return (
    <div className={`auth_container ${className}`}>
      <div className="form_container">
        <header>
          <div className="title">{title}</div>
          {switchText && <div className="switch">{switchText}</div>}
        </header>

        <form onSubmit={onSubmit}>
          {inputRows.map((row, rowIndex) => (
            <div key={rowIndex} className="ly">
              {row.fields.map((field, index) => {
                const isPassword = field.type === 'password';
                const fieldType =
                  isPassword && visiblePasswords[field.name] ? 'text' : field.type;

                return (
                  <div key={index} className="input-wrapper" style={{ position: 'relative' }}>
                    <input
                      type={fieldType}
                      placeholder={field.placeholder}
                      value={field.value}
                      onChange={field.onChange}
                      className={field.className || 'glassmorphism-light'}
                      aria-label={field.ariaLabel || field.placeholder || field.name}
                    />
                    {isPassword && (
                      <span
                        onClick={() => togglePasswordVisibility(field.name)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                        }}
                      >
                        {visiblePasswords[field.name] ? (
                          <MdVisibility size={20} color="white" />
                        ) : (
                          <MdVisibilityOff size={20} color="white" />
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {extraContentAboveSubmit && (
            <div className="extra-content">{extraContentAboveSubmit}</div>
          )}

          <button type="submit" aria-live="assertive" className="pointer">
            {loading ? 'Loading...' : submitText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GenericFormContainer;
