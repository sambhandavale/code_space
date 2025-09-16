import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { postAction } from "../../services/generalServices";
import { toast } from "sonner";
import GenericFormContainer from "../../components/Authentication/AuthContainer";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleResetSubmit = async (e: any) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.warning("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = { token, newPassword: password };
      const res = await postAction("/auth/reset-password", data);
      console.log(res);

      if (res.status === 200) {
        toast.success("Password reset successful. Please log in.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Password reset failed:", err);
      toast.error("Password reset failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password">
      <GenericFormContainer
        title={<>Reset Your Password</>}
        switchText={
          <>
            Remembered your password?{" "}
            <span
              className="pointer auth_switch underline"
              onClick={() => navigate("/login")}
            >
              Sign In
            </span>
          </>
        }
        onSubmit={handleResetSubmit}
        loading={loading}
        submitText="Reset Password"
        inputRows={[
          {
            fields: [
              {
                name: "password",
                type: "password",
                placeholder: "New Password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
              },
            ],
          },
          {
            fields: [
              {
                name: "confirmPassword",
                type: "password",
                placeholder: "Confirm Password",
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default ResetPassword;
