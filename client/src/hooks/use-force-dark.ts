import { useEffect } from "react";

export function useForceDark() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    
    return () => {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = stored || (prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", theme === "dark");
    };
  }, []);
}
