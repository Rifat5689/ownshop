import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoutes from "./adminRoutes";
import StoreRoutes from "./storeRoutes";
import MobileAdminGateway, {
  MobileLaunch,
} from "../../pages/mobile/MobileAdminGateway";
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MobileLaunch />} />
      <Route path="/mobile" element={<MobileAdminGateway />} />
      <Route
        path="/admin/*"
        element={
          <div className="state-card">
            <h1>Page not found</h1>
          </div>
        }
      />
      <Route path="/:storeSlug/admin/*" element={<AdminRoutes />} />
      <Route path="/:storeSlug/*" element={<StoreRoutes />} />
    </Routes>
  );
}
