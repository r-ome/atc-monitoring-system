import Layout from "./app/Layout";
import { RouteObject } from "react-router-dom";
import NotFoundPage from "./app/routes/NotFoundPage";
import {
  SupplierList,
  SupplierProfile,
  CreateSupplier,
  ContainerProfile,
  CreateInventory,
  CreateContainer,
  BranchList,
  BranchProfile,
  CreateBranch,
  CreateBidder,
  BidderList,
  BidderProfile,
  CreateBidderRequirement,
  AuctionList,
  AuctionProfile,
  AuctionBidders,
  AuctionPayments,
  RegisterBidder,
  Monitoring,
} from "./app/routes";
import { ManifestList } from "./app/routes/Auctions";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "suppliers",
        element: <SupplierList />,
      },
      {
        path: "containers/create",
        element: <CreateContainer />,
      },
      {
        path: "suppliers/:id",
        element: <SupplierProfile />,
        children: [],
      },
      {
        path: "suppliers/create",
        element: <CreateSupplier />,
      },
      {
        path: "containers/:id",
        element: <ContainerProfile />,
      },
      {
        path: "inventory/create",
        element: <CreateInventory />,
      },
      {
        path: "branches",
        element: <BranchList />,
      },
      {
        path: "branches/:id",
        element: <BranchProfile />,
      },
      {
        path: "branches/create",
        element: <CreateBranch />,
      },
      {
        path: "bidders",
        element: <BidderList />,
      },
      {
        path: "bidders/:bidder_id",
        element: <BidderProfile />,
      },
      {
        path: "bidders/requirement",
        element: <CreateBidderRequirement />,
      },
      {
        path: "bidders/create",
        element: <CreateBidder />,
      },
      {
        path: "auctions",
        element: <AuctionList />,
      },
      {
        path: "auctions/:auction_id",
        element: <AuctionProfile />,
        children: [
          {
            index: true,
            element: <AuctionBidders />,
          },
          {
            path: "payments",
            element: <AuctionPayments />,
          },
          {
            path: "register-bidder",
            element: <RegisterBidder />,
          },
          {
            path: "monitoring",
            element: <Monitoring />,
          },
          {
            path: "manifest-records",
            element: <ManifestList />,
          },
        ],
      },
    ],
  },
];

export default routes;
