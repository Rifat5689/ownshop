import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "../../features/auth/services/authService";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  useEffect(() => {
    const reset = () => {
      setUser(null);
    };
    window.addEventListener("ownshop:unauthorized", reset);
    return () => window.removeEventListener("ownshop:unauthorized", reset);
  }, []);
  useEffect(() => {
    if (!sessionStorage.getItem("ownshop_access") && !localStorage.getItem("ownshop_session")) {
      setLoading(false);
      return;
    }
    let active = true;
    authService
      .me()
      .then((value) => {
        if (active) setUser(value);
      })
      .catch(() => {
        sessionStorage.removeItem("ownshop_access");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const login = async (data) => {
    const session = await authService.login(data);
    if (session.accessToken)
      sessionStorage.setItem("ownshop_access", session.accessToken);
    const verified = await authService.me();
    localStorage.setItem("ownshop_session", "1");
    queryClient.clear();
    setUser(verified);
    return verified;
  };
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      sessionStorage.removeItem("ownshop_access");
      localStorage.removeItem("admin_auth");
      localStorage.removeItem("ownshop_session");
      queryClient.clear();
      setUser(null);
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
