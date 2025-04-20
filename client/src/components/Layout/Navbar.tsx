import { useNavigate, useLocation } from "react-router-dom";
import { isAuth } from "../../utility/helper";
import { logout } from "../../services/auth";

const Navbar = ({ scrollToChallenge }: any) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogoutClick = () => {
        logout(() => {
          window.location.href = "/";
        });
    };

    const handleChallengeClick = () => {
        if (location.pathname !== '') {
            navigate('/', { state: { scrollToChallenge: true } });
        } else {
            scrollToChallenge?.();
        }
    };

    return (
        <nav 
            className="navbar" 
            style={
                location.pathname === '/login' || location.pathname === '/register' 
                  ? { background: "none" } 
                  : {}
              }
        >
            <div className="navbar__left">
                <div className="navbar__logo" onClick={()=>navigate('/')}>
                    <img src="/icons/logo2.svg" className="logo" alt="" />
                </div>
                <ul className="navbar__links">
                    <li className="navbar__link pointer" onClick={()=>navigate('/')}>Home</li>
                    <li className="navbar__link pointer" onClick={handleChallengeClick}>Challenge</li>
                    <li className="navbar__link pointer">Write</li>
                    <li className="navbar__link pointer">Learn</li>
                </ul>
            </div>
            {!isAuth() ? (
                <div className="navbar__right">
                    <div className="navbar__action navbar__action--login pointer" onClick={()=>navigate('/login')}>Log In</div>
                    <div className="navbar__action navbar__action--signup pointer gls-box glassmorphism-dark" onClick={()=>navigate('/register')}>Sign Up</div>
                </div>
            ):(
                <div className="navbar__right">
                    <div className="navbar__action pointer" onClick={handleLogoutClick}>Logout</div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
