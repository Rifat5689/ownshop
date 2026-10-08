import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";
import { ProtectedRoute } from "../../components/common/ProtectedRoute";
import Dashboard from "../../pages/Dashboard";
import Stores from "../../pages/Stores";
import Admins from "../../pages/Admins";
import Subscriptions from "../../pages/Subscriptions";
import Settings from "../../pages/Settings";
import Login from "../../pages/Login/Login";
import { ProductsManager } from "../../features/products/components/ProductsManager";
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        element={<ProtectedRoute roles={["SUPER_ADMIN"]} loginPath="/login" />}
      >
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {["/stores", "/stores/create", "/stores/:id", "/stores/:id/edit"].map(
            (path) => (
              <Route key={path} path={path} element={<Stores />} />
            ),
          )}
          {["/admins", "/admins/create", "/admins/:id", "/admins/:id/edit"].map(
            (path) => (
              <Route key={path} path={path} element={<Admins />} />
            ),
          )}
          {["/products", "/products/create", "/products/:id/edit"].map(
            (path) => (
              <Route
                key={path}
                path={path}
                element={<ProductsManager base="/products" />}
              />
            ),
          )}
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route
        path="*"
        element={
          <div className="state-card">
            <h1>Page not found</h1>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        }
      />
    </Routes>
  );
}
