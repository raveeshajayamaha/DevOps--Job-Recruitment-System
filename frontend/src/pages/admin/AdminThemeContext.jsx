import { createContext, useContext, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

const AdminThemeContext = createContext(null);

export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <AdminThemeContext.Provider value={value}>
      {children ?? <Outlet />}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used inside AdminThemeProvider");
  }
  return context;
}
