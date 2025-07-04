import { FiX } from "react-icons/fi";
import { FaUser, FaHome, FaPenNib, FaBookOpen, FaSignOutAlt, FaRocket, FaSignInAlt, FaUserPlus, FaCode } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { isAuth } from "../../utility/helper";
import { useNavigate } from "react-router";
import { logout } from "../../services/auth";
import DefaultProfile from "./DefaultProfile";
import { getInitials } from "../../utility/general-utility";
import { useWindowWidth } from "../../utility/screen-utility";
import { useUser } from "../../context/UserContext";

const MobileSidebar = ({ isOpen, onClose, scrollToChallenge, userRating }: any) => {
    const navigate = useNavigate();
    const CloseIcon = FiX as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
    const width = useWindowWidth();
    const { setUserRating } = useUser();

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    };

    const handleLogoutClick = () => {
        logout(() => {
            window.location.href = "/";
        });
        setUserRating(0)
    };

    const handleChallengeClick = () => {
        if (location.pathname !== "") {
            navigate("/", { state: { scrollToChallenge: true } });
        } else {
            scrollToChallenge?.();
        }
        onClose();
    };

    return (
        <div className={`mobile-sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebar-top">
                {isAuth() ? (
                    <span className="sidebar-title ff-google-n">
                        <DefaultProfile initals={getInitials(`${isAuth().first_name} ${isAuth().last_name}`)}/>
                        <div className="name_rating">
                            <div className="name">{`${isAuth().first_name} ${isAuth().last_name}`}</div>
                            <div className="rating">Rating {userRating}</div>
                        </div>
                    </span>                    
                ):(
                    <span className="sidebar-title ff-google-n">
                        <span className="sidebar-title ff-google-n"><MdSettings /> Settings</span>
                    </span> 
                )}
                <CloseIcon className="close-icon" onClick={onClose} />
            </div>

            {isAuth() && <div className="sidebar-item ff-google-n" onClick={() => handleNavigate(`/profile/${isAuth().username}`)}><FaUser /> Profile</div>}
            {width < 860 && (
                <>
                    <hr />
                    <div className="sidebar-item ff-google-n" onClick={() => handleNavigate("/")}><FaHome /> Home</div>
                    <div className="sidebar-item ff-google-n" onClick={handleChallengeClick}><FaRocket /> Challenge</div>
                    <div className="sidebar-item ff-google-n" onClick={() => handleNavigate("/blog/write")}><FaPenNib /> Write</div>
                    <div className="sidebar-item ff-google-n" onClick={() => handleNavigate("/blogs")}><FaBookOpen /> Blogs</div>
                    <div className="sidebar-item ff-google-n" onClick={() => handleNavigate("/solve/questions")}><FaCode /> Solve</div>

                    <hr />
                </>
            )}
            {
                isAuth() ? (
                    <div className="sidebar-item logout ff-google-n" onClick={handleLogoutClick}><FaSignOutAlt /> Logout</div>
                ):(
                    <>
                        <div className="sidebar-item ff-google-n" onClick={() => handleNavigate("/login")}><FaSignInAlt /> Sign In</div>
                        <div className="sidebar-item ff-google-n"  onClick={() => handleNavigate("/register")}><FaUserPlus /> Sign Up</div>
                    </>
                )
            }
        </div>
    );
};

export default MobileSidebar;
