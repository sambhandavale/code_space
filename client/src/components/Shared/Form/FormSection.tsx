export const FormSection = ({title,children}) =>{
    return(
        <div className="form_section">
            <div className="form_section__header">{title}</div>
            {children}
        </div>
    )
}

interface IFormSectionRow {
  children: React.ReactNode;
  zIndex?: number;
}

export const FormSectionRow = ({ children, zIndex }: IFormSectionRow) => {
  return (
    <div
      className="form_section__row"
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      {children}
    </div>
  );
};


export const FormSectionColumn = ({children}) =>{
    return(
        <div className="form_section__column">
            {children}
        </div>
    )
}