import { useNavigate, useLocation } from "react-router-dom";
import { isAuth } from "../../utility/helper";
import { logout } from "../../services/auth";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogoutClick = () => {
        logout(() => {
          window.location.href = "/";
        });
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
                <div className="navbar__logo" onClick={()=>navigate('/')}>LOGO</div>
                <ul className="navbar__links">
                    <li className="navbar__link pointer" onClick={()=>navigate('/')}>Home</li>
                    <li className="navbar__link pointer">Challenge</li>
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
