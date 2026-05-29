import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initThemeFromStorage } from "./theme/theme";
import "./styles/themes.css";
import "./styles/index.css";
import "./styles/enterprise.css";
import "./styles/government-portal.css";
import "./styles/system-admin.css";

initThemeFromStorage();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);