import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import Providers from "@context";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import axiosInterceptor from "./axios.config";
import routes from "./routes";

const router = createBrowserRouter(routes);

axiosInterceptor();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </React.StrictMode>
);
