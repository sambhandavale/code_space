import { useNavigate } from "react-router";
import { useState } from "react";
import { getAction, postAction } from "../../services/generalServices";
import { toast } from "sonner";
import { authenticate, isAuth, setLocalStorage } from "../../utility/helper";
import GenericFormContainer from "../../components/Authentication/AuthContainer";
import { useUser } from "../../context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false);

  const { setUserRating } = useUser();

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
              <span className="pointer" onClick={() => navigate('/register')}>
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
        />
    </div> 
  )
}

export default Login
