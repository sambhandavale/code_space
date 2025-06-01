import { FiX } from "react-icons/fi";
import { FaUser, FaHome, FaPenNib, FaBookOpen, FaSignOutAlt, FaRocket, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { isAuth } from "../../utility/helper";
import { useNavigate } from "react-router";
import { logout } from "../../services/auth";

const MobileSidebar = ({ isOpen, onClose, scrollToChallenge }: any) => {
    const navigate = useNavigate();
    const CloseIcon = FiX as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    };

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
        onClose();
    };

    return (
        <div className={`mobile-sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebar-top">
                <span className="sidebar-title ff-google-n"><MdSettings /> Settings</span>
                <CloseIcon className="close-icon" onClick={onClose} />
            </div>

            <div className="sidebar-item locked ff-google-n"><FaUser /> Profile</div>
            <hr />
            <div className="sidebar-item ff-google-n" onClick={() => handleNavigate("/")}><FaHome /> Home</div>
            <div className="sidebar-item ff-google-n" onClick={handleChallengeClick}><FaRocket /> Challenge</div>
            <div className="sidebar-item locked ff-google-n"><FaPenNib /> Write</div>
            <div className="sidebar-item locked ff-google-n"><FaBookOpen /> Learn</div>
            <hr />
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
