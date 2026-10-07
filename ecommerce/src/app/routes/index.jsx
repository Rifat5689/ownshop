import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminRoutes from './adminRoutes'
import StoreRoutes from './storeRoutes'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/:storeSlug/*" element={<StoreRoutes />} />
    </Routes>
  )
}
