interface IGenericListPage {
  header: string;
  children?: React.ReactNode;
  customFilters?: React.ReactNode;
}

export const GenericListPage = ({
  header,
  children,
  customFilters,
}: IGenericListPage) => {
  return (
    <div className="list__page">
      <header className="list__header">
        <div className="header_text ff-kanit-n">{header}</div>

        <div className="action_bts">
          <div className="bts glassmorphism-medium gls-box pointer ff-google-n">
            CREATE
          </div>
        </div>
      </header>

      {customFilters}
      {children}
    </div>
  );
};

export default GenericListPage;
