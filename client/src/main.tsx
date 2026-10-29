import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root")!;
if (window.location.pathname !== "/") {
  (window as any).__PUBLIC_PAGE_BOOTSTRAP__ = {
    path: window.location.pathname,
    html: root.innerHTML,
    bodyClass: document.body.className,
  };
}

createRoot(root).render(<App />);
