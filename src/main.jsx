import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import SuiProvider from "./providers/SuiProvider";
import "./styles/index.css";
import "./styles/government-portal.css";
import "./styles/system-admin.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SuiProvider>
      <App />
    </SuiProvider>
  </React.StrictMode>
);