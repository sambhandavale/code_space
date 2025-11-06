interface IFormSection {
  title:string;
  children: React.ReactNode;
  zIndex?: number;
}

export const FormSection = ({title,children,zIndex}:IFormSection) =>{
    return(
        <div className="form_section" style={zIndex ? {zIndex:zIndex}:{}}>
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