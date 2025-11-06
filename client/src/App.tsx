import { useRoutes } from "react-router-dom"; 
import Routes from "./useRoutes";
import { getSocket, initializeSocket } from "./hooks/Sockets";
import { useEffect, useState } from "react";
import { isAuth } from "./utility/helper";
import Layout from "./components/Layout/Layout";
import { UserProvider } from "./context/UserContext";
import ScrollToTop from "./components/Shared/ScrollUp";
import { commonPageTitle } from "./utility/general-utility";
// import { getAction } from "./services/generalServices";

const App = (props: { notification?: any; error?: any }) => {
  const { error } = props;
  const [user, setUser] = useState(() => isAuth());
  const [socketId, setSocketId] = useState<string | null | undefined>(null);
  const allRoutes = Routes();

  useEffect(() => {
    if (user) {
      initializeSocket();

      const existingSocket = getSocket();

      existingSocket.on("connect", () => {
        setSocketId(existingSocket.id);
      });

      return () => { 
        existingSocket.off("connect");
      };
    }
  }, [user]);

  useEffect(() => {
    const match = allRoutes.find(route => {
      if (route.path === "*") return false;
      const regexPath = "^" + route.path.replace(/:[\w]+/g, "[^/]+").replace(/\//g, "\\/") + "$";
      return new RegExp(regexPath).test(location.pathname);
    });

    if (match?.title) {
      document.title = `${match.title} | Codespace`;
    } else {

      document.title = commonPageTitle;
    }
  }, [location.pathname]);


  if (error) console.log("App error:", error);

  const routing = useRoutes(Routes());

  return(
    <UserProvider> 
      <Layout>
        <ScrollToTop />
        {routing}
      </Layout>
    </UserProvider>
  )
};

export default App;
