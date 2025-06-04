import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./Popup";
import { ThemeProvider } from "../../components/theme-provider";
import "../../styles/globals.css";

const container = document.getElementById("popup-root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Popup />
      </ThemeProvider>
    </React.StrictMode>
  );
}
