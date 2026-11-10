import { useEffect } from "react";
import { savePersisted } from "./use-persistent-state";

/**
 * Mirrors the chart theme onto the document root `.dark` class so that
 * Base UI portals (rendered outside the chart container) inherit the same
 * CSS-variable palette, and persists it to localStorage.
 */
export function useSyncTheme(theme: string) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
      savePersisted("theme", theme);
    } catch {
      /* ignore storage quota / sandbox */
    }
  }, [theme]);
}
