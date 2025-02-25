import { NavLink } from "react-router-dom";
import { Menu } from "antd";
import ATCLogo from "@assets/atc_receipt_logo.png";

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
  label: (
    <NavLink
      to={`${item.path}`}
      className={`
    text-3xl`}
    >
      {item.label}
    </NavLink>
  ),
}));

const Navigation = () => {
  return (
    <div className="flex bg-[#F9FBFC] flex-shrink-0 flex-col mr-2 h-screen w-[300px]">
      <div className="border-b-gray-200 p-2">
        <img src={ATCLogo} alt="atc-logo" className="h-40 object-contain" />
      </div>

      <Menu
        defaultSelectedKeys={["1"]}
        className="w-full h-screen flex gap-2 flex-col"
        mode="vertical"
        items={lists}
      />
    </div>
  );
};

export default Navigation;
