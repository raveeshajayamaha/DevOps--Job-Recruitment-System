import { useContext } from "react";
import { AdminThemeContext } from "./AdminThemeContext";

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used inside AdminThemeProvider");
  }
  return context;
}
