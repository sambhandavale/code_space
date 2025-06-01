// components/GenericFormContainer.tsx
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
}

const GenericFormContainer = ({
  title,
  switchText,
  onSubmit,
  loading = false,
  submitText = 'Submit',
  inputRows,
  className = '',
}: GenericFormContainerProps) => {
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
              {row.fields.map((field, index) => (
                <input
                  key={index}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  className={field.className || 'glassmorphism-light'}
                  aria-label={field.ariaLabel || field.placeholder || field.name}
                />
              ))}
            </div>
          ))}
          <button type="submit" aria-live="assertive" className="pointer">
            {loading ? 'Loading...' : submitText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GenericFormContainer;
