import { Navigate } from "react-router-dom";
import { isAuth } from "./utility/helper";
import Home from "./containers/Home/Home";
import Login from "./containers/Authentication/Login";
import Register from "./containers/Authentication/Register";
import ChallengeRoom from "./containers/Challenge/ChallengeRoom";
import UserProfile from "./containers/User/UserProfile";
import WriteBlog from "./containers/Write/WriteBlog";
import Blog from "./containers/Write/Blog";

interface PrivateRouteProps {
  element: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  return isAuth() ? <>{element}</> : <Navigate to="/login" />;
};

const routes = () => {
  const commonRoutes = [
    { path: "/", element: <Home /> },
    { path: "/home", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path:"/profile/:username", element:<UserProfile/> },
    { path:"/blog/:slug", element:<Blog/> }
  ];

  const privateRoutes = [
    { path: "/challenge/live/:challengeId", element:<ChallengeRoom/> },
    { path:"/blog/write", element:<WriteBlog/> },
  ];

  const protectedRoutes = privateRoutes.map((route) => ({
    ...route,
    element: <PrivateRoute element={route.element} />,
  }));

  return [...commonRoutes, ...protectedRoutes]; // ✅ Return correct structure
};

export default routes;
