import { Navigate } from "react-router-dom";
import { isAuth } from "./utility/helper";
import Home from "./containers/Home/Home";
import Login from "./containers/Authentication/Login";
import Register from "./containers/Authentication/Register";
import ChallengeRoom from "./containers/Challenge/ChallengeRoom";
import UserProfile from "./containers/User/UserProfile";
import WriteBlog from "./containers/Write/WriteBlog";
import Blog from "./containers/Write/Blog";
import AllBlogs from "./containers/Write/AllBlogs";
import SolveProblem from "./containers/Solve/SolveProblem";
import QuestionsList from "./containers/Solve/QuestionsList";
import ConfirmEmail from "./containers/Authentication/ConfirmEmail";
import ResetPassword from "./containers/Authentication/ForgotPassword";

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
    { path:"/blog/:id/:slug", element:<Blog/> },
    { path:"/blogs", element:<AllBlogs/> },
    { path:"/solve/questions", element:<QuestionsList/> },
    { path:"/solve/:problemId", element:<SolveProblem/> },
    { path:"/confirm-email", element:<ConfirmEmail/> },
    { path:"/blog/write", element:<WriteBlog/> },
    { path: "/challenge/:challengeId", element:<ChallengeRoom/> },
    { path: "/reset-password/:token", element:<ResetPassword/> },
  ];

  const privateRoutes = [
    { path: "/challenge/live/:challengeId", element:<ChallengeRoom/> },
  ];

  const protectedRoutes = privateRoutes.map((route) => ({
    ...route,
    element: <PrivateRoute element={route.element} />,
  }));

  return [...commonRoutes, ...protectedRoutes]; 
};

export default routes;
