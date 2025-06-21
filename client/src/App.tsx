import { useRoutes } from "react-router-dom"; 
import Routes from "./useRoutes";
import { initializeSocket } from "./hooks/Sockets";
import { useEffect, useState } from "react";
import { isAuth } from "./utility/helper";
// import { getAction } from "./services/generalServices";

const App = (props: { notification?: any; error?: any }) => {
  const { error } = props;
  const [user, setUser] = useState(() => isAuth());

  useEffect(() => {
    if (user) {
      initializeSocket(); 
    }
  }, [user]);

  if (error) console.log("App error:", error);

  const routing = useRoutes(Routes());

  return <>{routing}</>;
};

export default App;
