import { useNavigate, useLocation } from "react-router-dom";
import { isAuth } from "../../utility/helper";
import { logout } from "../../services/auth";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = ({ scrollToChallenge, isMobileMenuOpen, setMobileMenuOpen }: any) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogoutClick = () => {
        logout(() => {
            window.location.href = "/";
        });
    };

    const handleChallengeClick = () => {
        if (location.pathname !== "") {
            navigate("/", { state: { scrollToChallenge: true } });
        } else {
            scrollToChallenge?.();
        }
        setMobileMenuOpen(false);
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    const isAuthUser = isAuth();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <nav className="navbar" style={isAuthPage ? { background: "none" } : {}}>
            <div className="navbar__left">
                <div className="navbar__logo pointer" onClick={() => handleNavigate("/")}>
                    <img src="/icons/logo.svg" className="logo" alt="Logo" />
                    <img src="/icons/logo_full.svg" className="full_logo" alt="Logo" />
                </div>
                <ul className={`navbar__links ${isMobileMenuOpen ? "open" : ""}`}>
                    <li className="navbar__link pointer" onClick={() => handleNavigate("/")}>Home</li>
                    <li className="navbar__link pointer" onClick={handleChallengeClick}>Challenge</li>
                    <li className="navbar__link pointer locked">Write</li>
                    <li className="navbar__link pointer locked">Learn</li>
                </ul>
            </div>

            <div className="navbar__right">
                {isAuthUser ? (
                    <div className="navbar__action navbar__action--login pointer" onClick={handleLogoutClick}>Logout</div>
                ) : (
                    <>
                    <div className="navbar__action navbar__action--login pointer" onClick={() => handleNavigate("/login")}>Log In</div>
                    <div className="navbar__action navbar__action--signup pointer gls-box glassmorphism-dark" onClick={() => handleNavigate("/register")}>Sign Up</div>
                    </>
                )}

                <div className="navbar__hamburger" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <FiX size={24} color="white"/> : <FiMenu size={24} color="white"/>}
                </div>
            </div>

        </nav>
    );
};

export default Navbar;
