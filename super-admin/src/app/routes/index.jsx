import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '../../layouts/AdminLayout'
import Dashboard from '../../pages/Dashboard'
import Stores from '../../pages/Stores'
import Admins from '../../pages/Admins'
import Subscriptions from '../../pages/Subscriptions'
import Settings from '../../pages/Settings'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<div>404 - Not Found</div>} />
    </Routes>
  )
}
