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
  AuctionBidders,
  AuctionPayments,
  RegisterBidder,
  Monitoring,
  EncodePage,
} from "./app/routes";
import { PageLayout } from "./layouts";
import {
  AuctionBidderProfile,
  ManifestList,
  ReceiptView,
} from "./app/routes/Auctions";

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
            path: "encode",
            element: <EncodePage />,
          },
          {
            path: "bidders/:bidder_id",
            element: <AuctionBidderProfile />,
          },
          {
            path: "payments/:payment_id",
            element: <ReceiptView />,
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
