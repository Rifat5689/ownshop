import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [storeSlug, setStoreSlug] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Extract storeSlug from URL if not in admin
    if (!location.pathname.startsWith('/admin')) {
      const pathParts = location.pathname.split('/');
      if (pathParts.length > 1 && pathParts[1]) {
        setStoreSlug(pathParts[1]);
      }
    } else {
      setStoreSlug(null);
    }
  }, [location]);

  return (
    <StoreContext.Provider value={{ storeSlug }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
