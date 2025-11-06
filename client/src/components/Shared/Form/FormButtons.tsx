export const FormButtons = ({children}) =>{
    return(
        <div className="create_form__buttons">
            {children}
        </div>
    )
}

export const FormButton = ({ buttonText, onClick, loading }) => {
  return (
    <button
      onClick={onClick}
      type="submit"
      aria-live="assertive"
      className="pointer common_button ff-google-n"
      disabled={loading}
    >
      {loading ? "Loading..." : buttonText}
    </button>
  );
};
