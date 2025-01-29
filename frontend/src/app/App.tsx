import { Routes, Route } from "react-router-dom";
import {
  SupplierList,
  BranchList,
  CreateBranch,
  RegisterBidder,
  SupplierProfile,
  CreateSupplier,
  AuctionPayments,
  AuctionProfile,
  CreateInventory,
  BranchProfile,
  CreateBidder,
  ContainerProfile,
  CreateBidderRequirement,
  BidderList,
  BidderProfile,
  AuctionList,
  AuctionInventory,
  CreateContainer,
} from "./routes";
import Layout from "./Layout";
import "react-datepicker/dist/react-datepicker.css";
import { BidderAuction } from "./routes/Bidders";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<div>hello world!</div>} />
        <Route path="/suppliers" element={<SupplierList />} />
        <Route path="/suppliers/:id" element={<SupplierProfile />} />
        <Route path="/suppliers/create" element={<CreateSupplier />} />
        <Route path="/containers/:id" element={<ContainerProfile />} />
        <Route path="/containers/create" element={<CreateContainer />} />
        <Route path="/branches" element={<BranchList />} />
        <Route path="/branches/:id" element={<BranchProfile />} />
        <Route path="/branches/create" element={<CreateBranch />} />
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/auctions/:id" element={<AuctionProfile />} />
        <Route
          path="/auctions/:id/register-bidder"
          element={<RegisterBidder />}
        />
        <Route path="/auctions/:id/payments" element={<AuctionPayments />} />
        <Route path="/inventory/create" element={<CreateInventory />} />

        <Route path="/bidders" element={<BidderList />} />
        <Route path="/bidders/create" element={<CreateBidder />} />
        <Route path="/bidders/:id" element={<BidderProfile />} />
        <Route
          path="/bidders/requirement"
          element={<CreateBidderRequirement />}
        />
        <Route
          path="/bidders/:id/auction/:auction_id"
          element={<BidderAuction />}
        />
        <Route path="*" element={<div>Page not found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
