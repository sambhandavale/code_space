import Layout from "../../components/Layout/Layout"
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { postAction } from "../../services/generalServices";
import GenericFormContainer from "../../components/Authentication/AuthContainer";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false);


  const handleRegisterSubmit = async (e: any) => {
      setLoading(true);
      e.preventDefault();
      try {
          const data = { username: username, email: email, password: password, fullname: name };
          if (!name || !username || !email || !password) {
            toast.error('Please fill in all fields');
            return;
          }
          const res = await postAction('/auth/signup',data);
          if (res.data.error) {
              console.error(res.data.error);
              toast.error(res.data.error);
          } else {
              toast.success('You have been enrolled successfully');
              navigate("/login");
          }
      } catch (err) {
          console.error("Failed Authentication, ", err);
          toast.error(`${err}`);
      } finally {
          setLoading(false);
      }
  };


  return (
    <Layout>
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
                <span className="pointer" onClick={() => navigate('/login')}>
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
    </Layout>
  )
  }
  
  export default Register
  