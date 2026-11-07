import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminThemeContext } from "./AdminThemeContext";

export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <AdminThemeContext.Provider value={value}>
      {children ?? <Outlet />}
    </AdminThemeContext.Provider>
  );
}
