import { Routes, Route } from "react-router-dom";
import {
  SupplierList,
  SupplierProfile,
  CreateSupplier,
  ContainerList,
  ContainerProfile,
  BidderList,
  BidderProfile,
  AuctionList,
  Monitoring,
  AuctionInventory,
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

        <Route path="/containers" element={<ContainerList />} />
        <Route path="/containers/:id" element={<ContainerProfile />} />

        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/auctions/:id" element={<Monitoring />} />

        <Route path="/bidders" element={<BidderList />} />
        <Route path="/bidders/:id" element={<BidderProfile />} />
        <Route
          path="/bidders/:id/auction/:auction_id"
          element={<BidderAuction />}
        />

        <Route path="/inventories/:id" element={<AuctionInventory />} />

        <Route path="/inventory" element={<BidderList />} />
        <Route path="/inventory/:id" element={<BidderProfile />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
