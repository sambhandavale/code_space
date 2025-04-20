import { Fragment } from "react";
import Navbar from "./Navbar";

const Layout = ({ children, scrollToChallenge }: any) => {
  return (
    <Fragment>
        <Navbar scrollToChallenge={scrollToChallenge} />
        {children}
    </Fragment>
  );
};

export default Layout;

