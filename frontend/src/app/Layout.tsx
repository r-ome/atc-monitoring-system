import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

const Layout = () => {
  return (
    <div className="flex w-full overflow-hidden bg-gray-100">
      <Navigation />

      <div className="flex flex-col max-h-screen w-full mr-4 overflow-scroll">
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
