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

  // temp solution for cold starts
  // useEffect(()=>{
  //   const wakeupServer = async () =>{
  //     try{
  //       const res = await getAction('/extra/wakeup');
  //       console.log(res.data.message);
  //     }catch(err){
  //       console.error(err);
  //     }
  //   }

  //   wakeupServer();
  // },[])

  if (error) console.log("App error:", error);

  const routing = useRoutes(Routes());

  return <>{routing}</>;
};

export default App;
