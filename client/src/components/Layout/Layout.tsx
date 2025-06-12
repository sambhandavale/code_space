import { Fragment, useEffect, useState } from "react";
import Navbar from "./Navbar/Navbar";
import MobileSidebar from "./Sidebar";
import { getAction } from "../../services/generalServices";
import { isAuth } from "../../utility/helper";

const Layout = ({ children, scrollToChallenge }: any) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRating,setUserRating] = useState<number>(0);

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

  return (
    <Fragment>
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
    </Fragment>
  );
};

export default Layout;
