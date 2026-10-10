import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Capacitor } from "@capacitor/core";

if (Capacitor.isNativePlatform())
  document.documentElement.classList.add("native-app");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
