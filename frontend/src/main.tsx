import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { OptimizationReviewProvider } from "./context/OptimizationReviewContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <OptimizationReviewProvider>
        <App />
      </OptimizationReviewProvider>
    </BrowserRouter>
  </React.StrictMode>
);
