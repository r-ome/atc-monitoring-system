import { NavLink } from "react-router-dom";
import { Button, Menu } from "antd";
import ATCLogo from "@assets/atc_receipt_logo.png";
import { useAuth } from "@context";
import { User } from "@types";

const lists = (user: User) => {
  const navigations = [
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
      label: "Containers",
      path: "/containers",
    },
    {
      key: "6",
      label: "Branches",
      path: "/branches",
    },
    {
      key: "7",
      label: "Users",
      path: "/users",
    },
  ];

  return navigations
    .filter((navigation) => {
      if (user) {
        if (["CASHIER"].includes(user.role)) {
          return ["Auctions", "Bidders", "Containers"].includes(
            navigation.label
          );
        }

        if (["ENCODER"].includes(user.role)) {
          return ["Auctions"].includes(navigation.label);
        }

        return true;
      }

      return true;
    })
    .map((item) => ({
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
};

const Navigation = () => {
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex bg-[#F9FBFC] flex-shrink-0 flex-col mr-2 h-screen w-[300px]">
      <div className="border-b-gray-200 p-2">
        <img src={ATCLogo} alt="atc-logo" className="h-40 object-contain" />
      </div>

      {user && (
        <Menu
          defaultSelectedKeys={["1"]}
          className="w-full h-screen flex gap-2 flex-col"
          mode="vertical"
          items={lists(user)}
        />
      )}

      <div className="py-4">
        <Button className="w-full" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
