import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getAction, postAction } from "../../services/generalServices";
import GenericFormContainer from "../../components/Authentication/AuthContainer";
import { authenticate, setLocalStorage } from "../../utility/helper";
import { validateUserInputs } from "../../utility/sign-up-validation";
import { useUser } from "../../context/UserContext";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [name, setName] = useState<string>('')
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


  const handleRegisterSubmit = async (e: any) => {
      setLoading(true);
      e.preventDefault();
      try {
          const normalizedUsername = username.trim().toLowerCase();
          const data = { username: normalizedUsername, email, password, fullname: name };

          if (!name || !username || !email || !password) {
              toast.error('Please fill in all fields');
              return;
          }

          const validation = validateUserInputs(name, normalizedUsername);
          if (!validation.valid) {
              toast.error(validation.message);
              return;
          }

          const res = await postAction('/auth/signup', data);
          if(res.status == 200){
            toast.success(res.data.message);
            // handleLoginSubmit(email, password);
          } else{
              console.error(res.data.error);
              toast.error(res.data.error);
          }
      } catch (err) {
          console.error("Failed Authentication, ", err);
          toast.error(`${err}`);
      } finally {
          setLoading(false);
      }
  };


  const handleLoginSubmit = async (userEmail:any, userPassword:any) => {
      try {
          const data = { email: userEmail, password: userPassword };
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
    <div className="register">
      <GenericFormContainer
        title={
          <>
            Join Us <br />
            <span className="lower-half">
              Become a Grandmaster
            </span>
          </>
        }
        switchText={
          <>
            Already a Member?{' '}
            <span className="pointer underline auth_switch" onClick={() => navigate('/login')}>
              Log In
            </span>
          </>
        }
        onSubmit={handleRegisterSubmit}
        loading={loading}
        submitText="Sign Up"
        inputRows={[
          {
            fields: [
              {
                name: 'name',
                type: 'text',
                placeholder: 'Full Name',
                value: name,
                onChange: (e) => setName(e.target.value),
              },
              {
                name: 'username',
                type: 'text',
                placeholder: 'Username',
                value: username,
                onChange: (e) => setUsername(e.target.value),
              },
            ],
          },
          {
            fields: [
              {
                name: 'email',
                type: 'email',
                placeholder: 'Email',
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
  
  export default Register
  