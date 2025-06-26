import { useNavigate, useLocation } from "react-router-dom";
import { isAuth } from "../../../utility/helper";
import { FiMenu, FiX } from "react-icons/fi";
import DefaultProfile from "../DefaultProfile";
import { getInitials } from "../../../utility/general-utility";
import { FiChevronDown } from 'react-icons/fi';

const Navbar = ({ scrollToChallenge, isMobileMenuOpen, setMobileMenuOpen, userRating }: any) => {
    const navigate = useNavigate();
    const location = useLocation();

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
                    <li className="navbar__link pointer" onClick={()=> navigate('/blog/write')}>Write</li>
                    <li className="navbar__link pointer" onClick={()=> navigate('/blogs')}>Blogs</li>
                    <li className="navbar__link pointer" onClick={()=> navigate('/solve/questions')}>Solve</li>
                </ul>
            </div>

            <div className="navbar__right">
                {isAuthUser ? (
                    <div className="setting pointer" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                        <DefaultProfile scale={0.9} initals={getInitials(`${isAuth().first_name} ${isAuth().last_name}`)}/>
                        <div className="name_rating">
                            <div className="name white">{`${isAuth().username}`}</div>
                            <div className="rating">Rating {userRating}</div>
                        </div>
                        <FiChevronDown color="grey" size={24}/>
                    </div>
                    // <div className="navbar__action navbar__action--login pointer" onClick={handleLogoutClick}>Logout</div>
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
