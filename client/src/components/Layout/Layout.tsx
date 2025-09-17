import { Fragment, useEffect, useState } from "react";
import Navbar from "./Navbar/Navbar";
import MobileSidebar from "./Sidebar";
import { getAction } from "../../services/generalServices";
import { isAuth } from "../../utility/helper";
import Footer from "./Footer";
import { useUser } from "../../context/UserContext";
 
const Layout = ({ children, scrollToChallenge }: any) => {
  const { userRating, setUserRating } = useUser();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(()=>{
    const getUserRating = async () =>{
      try{
        const res = await getAction(`/users/rating/${isAuth()._id}`);
        if(res && res.data){
          setUserRating(res.data.rating);
        }
      }catch(err){
        console.error(err);
      }
    }

    if(isAuth()){
      getUserRating()
    }
  },[])

  const noFooterRoutes = [
    "/login", 
    "/register", 
    "/challenge/live/:challengeId",
    "/challenge/:challengeId",
    "/blog/write",
    "/login",
    "/register", 
    "/solve/:problemId",
    "/confirm-email",
    "/reset-password/:token",
  ];

  // Simple match: For dynamic routes you may need to improve matching logic
  const shouldShowFooter = !noFooterRoutes.some(route => location.pathname.startsWith(route.split("/:")[0]));

  return (
    <Fragment>
      <div className="layout-container">
        <Navbar
          scrollToChallenge={scrollToChallenge}
          isMobileMenuOpen={isMobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          userRating={userRating}
        />
        <MobileSidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
          scrollToChallenge={scrollToChallenge}
          userRating={userRating}
        />
        {children}
        {shouldShowFooter && <Footer/>}
      </div>
    </Fragment>
  );
};

export default Layout;
