import React, { createContext, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { request } from "../../services/api";
const StoreContext = createContext(null);
export function StoreProvider({ children }) {
  const { pathname } = useLocation();
  const segment = pathname.split("/")[1];
  const storeSlug = segment && segment !== "admin" ? segment : null;
  const query = useQuery({
    queryKey: ["store", storeSlug],
    queryFn: () =>
      request("get", `/stores/slug/${encodeURIComponent(storeSlug)}`),
    enabled: !!storeSlug,
  });
  return (
    <StoreContext.Provider value={{ storeSlug, store: query.data, query }}>
      {children}
    </StoreContext.Provider>
  );
}
export const useStore = () => useContext(StoreContext);
