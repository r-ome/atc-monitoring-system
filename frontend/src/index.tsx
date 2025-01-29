import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import {
  SupplierProvider,
  BranchProvider,
  ContainerProvider,
  InventoryProvider,
  AuctionProvider,
  BidderProvider,
  BidderRequirementProvider,
  PaymentProvider,
} from "./context";
import axiosInterceptor from "./axios.config";

axiosInterceptor();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SupplierProvider>
        <ContainerProvider>
          <BranchProvider>
            <InventoryProvider>
              <AuctionProvider>
                <BidderProvider>
                  <BidderRequirementProvider>
                    <PaymentProvider>
                      <App />
                    </PaymentProvider>
                  </BidderRequirementProvider>
                </BidderProvider>
              </AuctionProvider>
            </InventoryProvider>
          </BranchProvider>
        </ContainerProvider>
      </SupplierProvider>
    </BrowserRouter>
  </React.StrictMode>
);
