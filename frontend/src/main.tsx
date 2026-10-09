import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/geist/400.css";
import "@fontsource/geist/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "material-symbols/outlined.css";
import "./styles.css";
import "./stitch.css";
import App from "./App";
import { StoreProvider } from "./features/store";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><BrowserRouter><StoreProvider><App/></StoreProvider></BrowserRouter></React.StrictMode>,
);
