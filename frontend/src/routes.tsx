import Layout from "./app/Layout";
import { RouteObject } from "react-router-dom";
import NotFoundPage from "./app/routes/NotFoundPage";
import {
  SupplierList,
  SupplierProfile,
  CreateSupplier,
  CreateInventory,
  CreateContainer,
  BranchList,
  ContainerProfile,
  BranchProfile,
  CreateBranch,
  SupplierContainerProfile,
  CreateBidder,
  BidderList,
  BidderProfile,
  AuctionList,
  AuctionProfile,
  EncodePage,
  InventoryProfilePage,
  AuctionBidderProfile,
  BidderTransaction,
  AuctionItemProfile,
  ReceiptViewerPage,
  ContainerList,
  UsersList,
  CreateUser,
} from "./app/routes";
import ProtectedRoutes from "app/routes/ProtectedRoutes";
import { PageLayout } from "./layouts";
import { AddOnPage } from "app/routes/Auctions";
import { LoginPage } from "app/routes/Auth";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "suppliers",
        element: (
          <ProtectedRoutes allowedRoles={["SUPER_ADMIN", "OWNER", "ADMIN"]}>
            <PageLayout
              title="Suppliers"
              breadcrumbs={[{ title: "Suppliers List", path: "suppliers" }]}
            />
          </ProtectedRoutes>
        ),
        children: [
          {
            index: true,
            element: <SupplierList />,
          },
          {
            path: ":supplier_id",
            element: <SupplierProfile />,
            children: [],
          },
          {
            path: "create",
            element: <CreateSupplier />,
          },
          {
            path: ":supplier_id/containers/:container_id",
            element: <SupplierContainerProfile />,
          },
          {
            path: ":supplier_id/containers/create",
            element: <CreateContainer />,
          },
          {
            path: ":supplier_id/containers/:container_id/inventory/create",
            element: <CreateInventory />,
          },
          {
            path: ":supplier_id/containers/:container_id/inventory/:auction_inventory_id",
            element: <AuctionItemProfile />,
          },
        ],
      },
      {
        path: "branches",
        element: (
          <ProtectedRoutes allowedRoles={["SUPER_ADMIN", "OWNER", "ADMIN"]}>
            <PageLayout
              title="Branches"
              breadcrumbs={[{ title: "Branches List", path: "branches" }]}
            />
          </ProtectedRoutes>
        ),
        children: [
          {
            index: true,
            element: <BranchList />,
          },
          {
            path: ":branch_id",
            element: <BranchProfile />,
          },
          {
            path: "create",
            element: <CreateBranch />,
          },
        ],
      },
      {
        path: "bidders",
        element: (
          <ProtectedRoutes
            allowedRoles={["SUPER_ADMIN", "OWNER", "ADMIN", "CASHIER"]}
          >
            <PageLayout
              title="Bidders"
              breadcrumbs={[{ title: "Bidders List", path: "bidders" }]}
            />
          </ProtectedRoutes>
        ),
        children: [
          {
            index: true,
            element: <BidderList />,
          },
          {
            path: ":bidder_id/profile",
            element: <BidderProfile />,
          },
          {
            path: "create",
            element: <CreateBidder />,
          },
        ],
      },
      {
        path: "/containers",
        element: (
          <PageLayout
            title="Containers"
            breadcrumbs={[{ title: "Container List", path: "containers" }]}
          />
        ),
        children: [
          {
            index: true,
            element: <ContainerList />,
          },
          {
            path: ":container_id",
            element: <ContainerProfile />,
          },
          {
            path: ":container_id/inventory/create",
            element: <CreateInventory />,
          },
        ],
      },
      {
        path: "/auctions",
        element: (
          <ProtectedRoutes
            allowedRoles={[
              "SUPER_ADMIN",
              "OWNER",
              "ADMIN",
              "CASHIER",
              "ENCODER",
            ]}
          >
            <PageLayout
              title="Auctions"
              breadcrumbs={[{ title: "Auctions List", path: "auctions" }]}
            />
          </ProtectedRoutes>
        ),
        children: [
          {
            index: true,
            element: <AuctionList />,
          },
          {
            path: ":auction_id",
            element: <AuctionProfile />,
          },
          {
            path: ":auction_id/auction-item/:auction_inventory_id",
            element: <AuctionItemProfile />,
          },
          {
            path: ":auction_id/encode",
            element: <EncodePage />,
          },
          {
            path: ":auction_id/add-on",
            element: <AddOnPage />,
          },
          {
            path: ":auction_id/bidders/:bidder_id",
            element: <AuctionBidderProfile />,
          },
          {
            path: ":auction_id/bidders/:bidder_id/transactions/:payment_id",
            element: <BidderTransaction />,
          },
          {
            path: "receipt",
            element: <ReceiptViewerPage />,
          },
        ],
      },
      {
        path: "/inventories",
        element: (
          <PageLayout
            title="Inventory"
            breadcrumbs={[{ title: "Inventory Profile" }]}
          />
        ),
        children: [
          {
            path: ":inventory_id",
            element: <InventoryProfilePage />,
          },
        ],
      },
      {
        path: "/users",
        element: (
          <ProtectedRoutes allowedRoles={["SUPER_ADMIN", "OWNER"]}>
            <PageLayout title="Users" breadcrumbs={[{ title: "Users List" }]} />
          </ProtectedRoutes>
        ),
        children: [
          {
            index: true,
            element: <UsersList />,
          },
          {
            path: "create",
            element: <CreateUser />,
          },
        ],
      },
    ],
  },
];

export default routes;
