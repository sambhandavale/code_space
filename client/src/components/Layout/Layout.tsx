import { Fragment, useState } from "react";
import Navbar from "./Navbar";
import MobileSidebar from "./Sidebar";

const Layout = ({ children, scrollToChallenge }: any) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Fragment>
      <Navbar
        scrollToChallenge={scrollToChallenge}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        scrollToChallenge={scrollToChallenge}
      />
      {children}
    </Fragment>
  );
};

export default Layout;
