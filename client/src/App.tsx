import { useRoutes } from "react-router-dom"; 
import Routes from "./useRoutes";
import { getSocket, initializeSocket } from "./hooks/Sockets";
import { useEffect, useState } from "react";
import { isAuth } from "./utility/helper";
import Layout from "./components/Layout/Layout";
import { UserProvider } from "./context/UserContext";
import ScrollToTop from "./components/Shared/ScrollUp";
// import { getAction } from "./services/generalServices";

const App = (props: { notification?: any; error?: any }) => {
  const { error } = props;
  const [user, setUser] = useState(() => isAuth());
  const [socketId, setSocketId] = useState<string | null | undefined>(null);

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
