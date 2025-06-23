import { useRoutes } from "react-router-dom"; 
import Routes from "./useRoutes";
import { getSocket, initializeSocket } from "./hooks/Sockets";
import { useEffect, useState } from "react";
import { isAuth } from "./utility/helper";
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
        console.log("Global socket connected:", existingSocket.id);
        setSocketId(existingSocket.id);
      });

      return () => {
        existingSocket.off("connect");
      };
    }
  }, [user]);

  if (error) console.log("App error:", error);

  const routing = useRoutes(Routes());

  return <>{routing}</>;
};

export default App;
