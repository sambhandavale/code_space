import { useNavigate } from "react-router";
import { useState } from "react";
import { getAction, postAction } from "../../services/generalServices";
import { toast } from "sonner";
import { authenticate, setLocalStorage } from "../../utility/helper";
import GenericFormContainer from "../../components/Authentication/AuthContainer";
import { useUser } from "../../context/UserContext";
import Modal from "../../components/Shared/GenericModal";

const Login = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false);

  const { setUserRating } = useUser();

  const [open, setOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState<boolean>(false);

  const refreshRating = async (userId:string) => {
    try {
      const res = await getAction(`/users/rating/${userId}`);
      if (res && res.data) {
        setUserRating(res.data.rating);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const informParent = (response: any) => {
      if (response.data && response.data.error) {
        console.error(response.data.error);
        toast.error(response.data.error);
      } else {
        authenticate(response, () => {
          navigate("/");
        });
      }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.warning("Please enter your email.");
      return;
    }

    setEmailLoading(true);
    try {
      const res = await postAction("/auth/forgot-password", { email:resetEmail });

      if (res.status === 200) {
        toast.success("Password reset link sent! Check your email.");
        setOpen(false);
      } else{
        toast.error(res.data.error);
      }
    } catch (err) {
      console.error("Request failed:", err);
      toast.error("Failed to send reset link. Try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleLoginSubmit = async (e: any) => {
    setLoading(true);
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Please fill in both email and password fields.");
      setLoading(false);
      return;
    }

    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const data = { email, password, timezone };
        const res = await postAction('/auth/signin',data,informParent);
        if(res.status === 200){
            toast.success(`Welcome, ${res.data.user.first_name} ${res.data.user.last_name}`);
            setLocalStorage('token',res.data.jwtToken);
            refreshRating(res.data.user.id);
        }
    } catch (err) {
        console.error("Failed Authentication, ", err);
        toast.error("Login failed. Please try again later.");
        setLoading(false);
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="login">
        <GenericFormContainer
          title={
            <>
              Welcome Back
            </>
          }
          switchText={
            <>
              Not a Member Yet?{' '}
              <span className="pointer underline auth_switch" onClick={() => navigate('/register')}>
                Sign Up
              </span>
            </>
          }
          onSubmit={handleLoginSubmit}
          loading={loading}
          submitText="Sign In"
          inputRows={[
            {
              fields: [
                {
                  name: 'username',
                  type: 'text',
                  placeholder: 'Email Address',
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                },
              ],
            },
            {
              fields: [
                {
                  name: 'password',
                  type: 'password',
                  placeholder: 'Password',
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                },
              ],
            },
          ]}
          extraContentAboveSubmit={
            <span onClick={() => setOpen(true)}>
              Can’t remember your password?{" "}
              <span className="pointer underline extra_button">
                Forgot Password
              </span>
            </span>
          }
        />
        <Modal 
            isOpen={open} 
            onClose={() => setOpen(false)} 
            title="Forgot Password"
            subtitle="Enter your registered email to receive a reset link"
        >
          <form onSubmit={handleEmailSubmit} className="forgot-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="forgot-input"
            />
            <button
              type="submit"
              disabled={emailLoading}
              className="forgot-submit ff-google-n"
            >
              {emailLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </Modal>
    </div> 
  )
}

export default Login
