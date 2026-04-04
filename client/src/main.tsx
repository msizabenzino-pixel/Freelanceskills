import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (typeof window !== "undefined") {
  const savedTheme = localStorage.getItem("theme");
  const shouldUseDark = savedTheme ? savedTheme === "dark" : true;
  if (shouldUseDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

createRoot(document.getElementById("root")!).render(<App />);
