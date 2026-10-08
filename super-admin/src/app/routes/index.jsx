import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AdminLayout } from '../../layouts/AdminLayout'
import Dashboard from '../../pages/Dashboard'
import Stores from '../../pages/Stores'
import Admins from '../../pages/Admins'
import Subscriptions from '../../pages/Subscriptions'
import Settings from '../../pages/Settings'
import Login from '../../pages/Login/Login'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('admin_auth');
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

export function AppRoutes() {
  const isAuthenticated = localStorage.getItem('admin_auth');

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
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
