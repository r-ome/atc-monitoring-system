import { NavLink } from "react-router-dom";

const lists = [
  { name: "Home", path: "/" },
  { name: "Suppliers", path: "/suppliers" },
  { name: "Branches", path: "/branches" },
  { name: "Auctions", path: "/auctions" },
  { name: "Bidders", path: "/bidders" },
];

const Navigation = () => {
  return (
    <div className="flex flex-shrink-0 flex-col border p-2 mr-2 h-screen  w-1/4">
      <div className="bg-[#F9FBFC] h-36 p-6 flex justify-center items-center">
        Logo and ATC name here
      </div>

      <ul className="flex flex-col p-4">
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
      </ul>
    </div>
  );
};

export default Navigation;
