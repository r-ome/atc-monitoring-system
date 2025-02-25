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
  AuctionList,
  AuctionProfile,
  EncodePage,
  AuctionBidderProfile,
  BidderTransaction,
  AuctionItemProfile,
  OfficialReceiptPage,
} from "./app/routes";
import { PageLayout } from "./layouts";
import { AddOnPage } from "app/routes/Auctions";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "suppliers",
        element: (
          <PageLayout
            title="Suppliers"
            breadcrumbs={[{ title: "Suppliers List", path: "suppliers" }]}
          />
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
            element: <ContainerProfile />,
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
          <PageLayout
            title="Branches"
            breadcrumbs={[{ title: "Branches List", path: "branches" }]}
          />
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
          <PageLayout
            title="Bidders"
            breadcrumbs={[{ title: "Bidders List", path: "bidders" }]}
          />
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
        path: "/auctions",
        element: (
          <PageLayout
            title="Auctions"
            breadcrumbs={[{ title: "Auctions List", path: "auctions" }]}
          />
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
            element: <OfficialReceiptPage />,
          },
        ],
      },
    ],
  },
];

export default routes;
