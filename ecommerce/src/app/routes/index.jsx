import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoutes from "./adminRoutes";
import StoreRoutes from "./storeRoutes";
import Directory from "../../pages/store/Directory/Directory";
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Directory />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/:storeSlug/*" element={<StoreRoutes />} />
    </Routes>
  );
}
