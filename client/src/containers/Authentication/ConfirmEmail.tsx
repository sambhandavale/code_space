import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { postAction } from "../../services/generalServices";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    if (confirmed) {
      navigate("/login");
      return;
    }

    if (!token) {
      toast.error("Token missing from URL.");
      return;
    }

    setLoading(true);

    try {
      const res = await postAction("/auth/confirm-email", { token }); 
      if(res.status === 201){
        toast.success(res.data.message || "Email confirmed!");
        setConfirmed(true);
      }
    } catch (err: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="confirm_email">
      <div className="confirm__section">
        <header>
          <div className="confirm__text white">CONFIRM EMAIL</div>
          <div className="confirm__text__subtext white ff-google-n">
            Click the button below to confirm your email.
          </div>
        </header>

        <button
          aria-live="assertive"
          className={`confirm_button pointer ${loading ? "disabled" : ""}`}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading
            ? "Confirming..."
            : confirmed
            ? "Login"
            : "Confirm Email"}
        </button>
      </div>
    </div>
  );
};

export default ConfirmEmail;
