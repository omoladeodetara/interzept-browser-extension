import React, { useEffect } from "react";
import "../app/globals.css";
import { ThemeProvider } from "../components/theme-provider";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  useEffect(() => {
    document.title = "Interzept";
    // You can set other metadata here if needed
  }, []);

  return (
    <div className="inter-font">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </div>
  );
};

export default Layout;
