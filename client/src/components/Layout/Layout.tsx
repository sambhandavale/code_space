import { Fragment } from "react";
import Navbar from "./Navbar";

const Layout = ({children}:any) => {
  return (
    <Fragment>
        <Navbar/>
        {children}
    </Fragment>
  )
}

export default Layout;
