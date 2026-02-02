import { useState } from "react";

const STORAGE_KEY = "isAuthenticated";
const PASSWORD = "sigil2026"; // Change this to your desired password

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "true";
  });

  const login = (password: string): boolean => {
    if (password === PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { isAuthenticated, login, logout };
}
