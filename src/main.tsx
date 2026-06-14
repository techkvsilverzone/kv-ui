import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initMonitoring } from "@/lib/analytics";

initMonitoring();

createRoot(document.getElementById("root")!).render(<App />);
