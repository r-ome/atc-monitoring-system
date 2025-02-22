import { NavLink } from "react-router-dom";
import { Menu } from "antd";

const lists = [
  {
    key: "1",
    label: "Home",
    path: "/",
  },
  {
    key: "2",
    label: "Auctions",
    path: "/auctions",
  },
  {
    key: "3",
    label: "Bidders",
    path: "/bidders",
  },
  {
    key: "4",
    label: "Suppliers",
    path: "/suppliers",
  },
  {
    key: "5",
    label: "Branches",
    path: "/branches",
  },
].map((item) => ({
  ...item,
  label: <NavLink to={`${item.path}`}>{item.label}</NavLink>,
}));

const Navigation = () => {
  return (
    <div className="flex flex-shrink-0 flex-col mr-2 h-screen w-[260px]">
      {/* <div className="bg-[#F9FBFC] h-36 p-6 flex justify-center items-center">
        Logo and ATC name here
      </div> */}

      <Menu
        defaultSelectedKeys={["1"]}
        className="w-full h-screen"
        mode="vertical"
        items={lists}
      />

      {/* <ul className="flex flex-col p-4">
        {lists.map((item) => {
          return (
            <li
              key={item.name}
              className="w-full hover:text-white hover:bg-[#4E5BA6] hover:rounded mb-2"
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${
                    isActive ? "text-white bg-[#4E5BA6] w-full" : ""
                  } w-full flex items-center h-10 rounded pl-2`
                }
              >
                {item.name}
              </NavLink>
            </li>
          );
        })}
      </ul> */}
    </div>
  );
};

export default Navigation;
