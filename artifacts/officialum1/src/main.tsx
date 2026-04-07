import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// In production (e.g. Vercel static frontend), API can live on a separate host.
// Example: VITE_API_BASE=https://api.officialum1.com
const apiBase = (import.meta.env.VITE_API_BASE as string | undefined)?.trim();
if (apiBase) {
  setBaseUrl(apiBase);
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
