
import "./App.css";
import Signup from "./components/custom/Signup";
import Login from "./components/custom/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/custom/Layout";
import Home from "./components/custom/Home";
import Profile from "./components/custom/Profile";
import PrivateRoutes from "./components/custom/PrivateRoutes";
import EditProfile from "./components/custom/EditProfile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoutes><Layout /></PrivateRoutes>,
    children: [
      {
        path: "/",
        element: <PrivateRoutes><Home /></PrivateRoutes>,
      },
      {
        path: "/profile/:id",
        element: <PrivateRoutes><Profile /></PrivateRoutes>,
      },
      {
        path: "/edit-profile",
        element: <PrivateRoutes><EditProfile /></PrivateRoutes>,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
