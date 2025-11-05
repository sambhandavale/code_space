import { Navigate } from "react-router-dom";
import { isAuth } from "./utility/helper";

// 🔹 Pages
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
import Question from "./containers/Solve/Question";

// 🔹 Private route wrapper
interface PrivateRouteProps {
  element: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  return isAuth() ? <>{element}</> : <Navigate to="/login" />;
};

// 🔹 Route definition interface
interface AppRoute {
  path: string;
  element: React.ReactNode;
  title?: string;
}

// 🔹 Define all routes
const routes = (): AppRoute[] => {
  const commonRoutes: AppRoute[] = [
    { path: "/", element: <Home />, title: "Home" },
    { path: "/home", element: <Home />, title: "Home" },
    { path: "/login", element: <Login />, title: "Login" },
    { path: "/register", element: <Register />, title: "Register" },
    { path: "/profile/:username", element: <UserProfile />, title: "User Profile" },
    { path: "/blog/:id/:slug", element: <Blog />, title: "Blog" },
    { path: "/blogs", element: <AllBlogs />, title: "All Blogs" },
    { path: "/solve/questions", element: <QuestionsList />, title: "Practice Questions" },
    { path: "/solve/:problemId", element: <SolveProblem />, title: "Solve Problem" },
    { path: "/confirm-email", element: <ConfirmEmail />, title: "Confirm Email" },
    { path: "/blog/write", element: <WriteBlog />, title: "Write Blog" },
    { path: "/challenge/:challengeId", element: <ChallengeRoom />, title: "Challenge Room" },
    { path: "/reset-password/:token", element: <ResetPassword />, title: "Reset Password" },
    { path: "/question/:questionId", element: <Question />, title: "Question" },
  ];

  const privateRoutes: AppRoute[] = [
    { path: "/challenge/live/:challengeId", element: <ChallengeRoom />, title: "Live Challenge" },
  ];

  // Wrap private routes with authentication
  const protectedRoutes: AppRoute[] = privateRoutes.map((route) => ({
    ...route,
    element: <PrivateRoute element={route.element} />,
  }));

  return [...commonRoutes, ...protectedRoutes];
};

export default routes;
