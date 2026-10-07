import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AdminLayout } from '../../layouts/AdminLayout'
import Dashboard from '../../pages/admin/Dashboard'
import Products from '../../pages/admin/Products'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<div>Categories Admin</div>} />
        <Route path="orders" element={<div>Orders Admin</div>} />
        <Route path="customers" element={<div>Customers Admin</div>} />
        <Route path="settings" element={<div>Settings Admin</div>} />
        <Route path="" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
