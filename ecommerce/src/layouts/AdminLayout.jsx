import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useStore } from '../app/providers/StoreProvider'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="app-container">
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} onClick={() => setSidebarOpen(false)} />
      )}
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo"></div>
          <h2>Store Admin</h2>
        </div>
        <nav>
          <ul>
            <li><NavLink to="/admin/dashboard" onClick={() => setSidebarOpen(false)}><i className="fa-solid fa-chart-pie"></i> Dashboard</NavLink></li>
            <li><NavLink to="/admin/products" onClick={() => setSidebarOpen(false)}><i className="fa-solid fa-box-open"></i> Products</NavLink></li>
            <li><NavLink to="/admin/categories" onClick={() => setSidebarOpen(false)}><i className="fa-solid fa-tags"></i> Categories</NavLink></li>
            <li><NavLink to="/admin/orders" onClick={() => setSidebarOpen(false)}><i className="fa-solid fa-cart-shopping"></i> Orders</NavLink></li>
            <li><NavLink to="/admin/customers" onClick={() => setSidebarOpen(false)}><i className="fa-solid fa-users"></i> Customers</NavLink></li>
            <li><NavLink to="/admin/settings" onClick={() => setSidebarOpen(false)}><i className="fa-solid fa-gear"></i> Settings</NavLink></li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <img src="https://i.pravatar.cc/150?img=68" alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div className="user-info">
            <h4 style={{ color: 'white', fontSize: '0.9rem' }}>Admin User</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--sidebar-text)' }}>Store Manager</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <i className="fa-solid fa-bars"></i>
            </button>
            <div className="search-bar">
              <i className="fa-solid fa-search" style={{ color: '#94a3b8' }}></i>
              <input type="text" placeholder="Search orders, products..." />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <button style={{ color: 'var(--text-muted)', fontSize: '1.25rem', border: 'none', background: 'transparent' }}><i className="fa-regular fa-bell"></i></button>
             <button className="btn-primary" style={{ fontSize: '0.875rem' }} onClick={() => window.open('/', '_blank')}>View Storefront</button>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
