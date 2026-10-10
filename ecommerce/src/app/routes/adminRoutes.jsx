import React from "react";
import { Routes, Route, Navigate, Link, useParams } from "react-router-dom";
import { ProfessionalAdminLayout as AdminLayout } from "../../layouts/ProfessionalAdminLayout";
import { ProtectedRoute } from "../../components/common/ProtectedRoute";
import Dashboard from "../../pages/admin/Dashboard";
import Products from "../../pages/admin/Products";
import Login from "../../pages/admin/Login/Login";
import Categories from "../../pages/admin/Categories/Categories";
import Orders from "../../pages/admin/Orders/Orders";
import Customers from "../../pages/admin/Customers/ProfessionalCustomers";
import { SettingsView } from "../../features/settings/components/SettingsView";
import { useStore } from "../providers/StoreProvider";
import { PageMetadata } from "../../components/common/PageMetadata";
export default function AdminRoutes() {
  const { storeSlug } = useParams();
  const base = `/${storeSlug}/admin`;
  const { query } = useStore();
  if (query.isPending)
    return (
      <div className="state-card" role="status">
        Loading store...
      </div>
    );
  if (query.isError || !query.data)
    return (
      <div className="state-card">
        <h1>Page not found</h1>
      </div>
    );
  return (
    <>
      <PageMetadata title="Merchant Login | Store Admin" noindex />
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute
              roles={["ADMIN", "ECO"]}
              loginPath={`${base}/login`}
            />
          }
        >
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            {["products", "products/create", "products/:id/edit"].map(
              (path) => (
                <Route key={path} path={path} element={<Products />} />
              ),
            )}
            <Route path="categories" element={<Categories />} />
            {["orders", "orders/:id"].map((path) => (
              <Route key={path} path={path} element={<Orders />} />
            ))}
            {["customers", "customers/:id"].map((path) => (
              <Route key={path} path={path} element={<Customers />} />
            ))}
            <Route path="settings" element={<SettingsView />} />
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <div className="state-card">
              <h1>Page not found</h1>
              <Link to={`${base}/dashboard`}>Dashboard</Link>
            </div>
          }
        />
      </Routes>
    </>
  );
}
