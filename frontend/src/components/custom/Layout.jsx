import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";

const Layout = () => {
  return (
    <div className="flex ">
      <div className="w-1/5 ">
        <LeftSidebar />
      </div>
      <div className="w-4/5">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
