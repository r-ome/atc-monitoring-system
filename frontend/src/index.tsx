import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

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
import routes from "./routes";

const router = createBrowserRouter(routes);

axiosInterceptor();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SupplierProvider>
      <ContainerProvider>
        <BranchProvider>
          <InventoryProvider>
            <AuctionProvider>
              <BidderProvider>
                <BidderRequirementProvider>
                  <PaymentProvider>
                    <RouterProvider router={router} />
                  </PaymentProvider>
                </BidderRequirementProvider>
              </BidderProvider>
            </AuctionProvider>
          </InventoryProvider>
        </BranchProvider>
      </ContainerProvider>
    </SupplierProvider>
  </React.StrictMode>
);
