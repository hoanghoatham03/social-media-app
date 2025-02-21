
import "./App.css";
import Signup from "./components/custom/Signup";
import Login from "./components/custom/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/custom/Layout";
import Home from "./components/custom/Home";
import Profile from "./components/custom/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/profile",
        element: <Profile />,
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
