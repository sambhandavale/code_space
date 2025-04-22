import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postAction } from "../../services/generalServices";
import { authenticate, setLocalStorage } from "../../utility/helper";
import { toast } from 'sonner';

interface IAuthContainer{
    method:string;
    route:string;
}

const AuthContainer = ({
    method,
    route,
}:IAuthContainer) =>{
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false);

    const informParent = (response: any) => {
        if (response.data && response.data.error) {
          console.error(response.data.error);
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
            const data = { username: username, email: email, password: password, fullname: name };
            const res = await postAction(route,data);
            if (res.data.error) {
                console.error(res.data.error);
              } else {
                toast.success('You have been enrolled successfully');
                navigate("/login");
              }
        } catch (err) {
            console.error("Failed Authentication, ", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSubmit = async (e: any) => {
        setLoading(true);
        e.preventDefault();
        try {
            const data = { email: email, password: password };
            const res = await postAction(route,data,informParent);
            if(res.status === 200){
                toast.success(`Welcome, ${res.data.user.first_name} ${res.data.user.last_name}`);
                setLocalStorage('token',res.data.jwtToken);
            }
        } catch (err) {
            console.error("Failed Authentication, ", err);
        } finally {
            setLoading(false);
        }
    };
    

    return(
        <div className="auth_container">
            <div className="form_container">
            <header>
                {method === 'register' && (
                    <header>
                        <div className="title">
                            Join Us <br /> <span className="lower-half">To Become a <span className="highlight">Grandmaster</span></span>
                        </div>
                        <div className="switch">Already a Member ? <span className="pointer" onClick={()=>navigate('/login')}>Log In</span></div>
                    </header>
                )}
                {method === 'login' && (
                    <header>
                        <div className="title">
                        Welcome <span className="highlight">Back</span> 
                        </div>
                        <div className="switch">Not a Member Yet ? <span className="pointer" onClick={()=>navigate('/register')}>Sign Up</span></div>
                    </header>
                )}
            </header>
            <form onSubmit={method === 'register' ? handleRegisterSubmit : handleLoginSubmit}>
                {method === 'register' && (
                    <div className="ly">
                        <input 
                            type="text" 
                            placeholder="Full Name"
                            value={name}
                            onChange={((e)=>setName(e.target.value))}
                            aria-label="Full Name"
                            className="glassmorphism-light"
                        />
                        <input 
                            type="text" 
                            placeholder="Username"
                            value={username} 
                            onChange={((e)=>setUsername(e.target.value))}
                            aria-label="Username"
                            className="glassmorphism-light"
                        />
                    </div>
                )}
                <div className="ly">
                    <input 
                        type="email" 
                        placeholder="Email"
                        value={email}
                        onChange={((e)=>setEmail(e.target.value))}
                        aria-label="Email"
                        className="glassmorphism-light"
                    />
                </div>
                <div className="ly">
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={((e)=>setPassword(e.target.value))}
                        aria-label="Password"
                        className="glassmorphism-light"
                    />
                </div>
                <button type="submit" aria-live="assertive" className="pointer">
                    {loading ? 'Loading...' : method === "register" ? 'Sign Up' : 'Log In'}
                </button>
            </form>
            </div>
        </div>
    )
}

export default AuthContainer;