import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

const Layout = () => {
  return (
    <div className="flex w-full overflow-hidden">
      <Navigation />
      <div className="flex flex-col h-full w-full mr-4 overflow-scroll">
        <div className="h-36 border flex justify-center items-center">
          header here
        </div>
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
