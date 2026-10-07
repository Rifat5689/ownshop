import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="app-container">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo"></div>
          <h2>Super Admin</h2>
        </div>
        <nav>
          <ul>
            <li>
              <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)}>
                <i className="fa-solid fa-house"></i> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/stores" onClick={() => setSidebarOpen(false)}>
                <i className="fa-solid fa-store"></i> Store Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/admins" onClick={() => setSidebarOpen(false)}>
                <i className="fa-solid fa-users-gear"></i> Admin Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/subscriptions" onClick={() => setSidebarOpen(false)}>
                <i className="fa-solid fa-credit-card"></i> Subscriptions
              </NavLink>
            </li>
            {/* Commented out as per instructions */}
            {/* <li>
              <NavLink to="/payments">
                <i className="fa-solid fa-money-bill"></i> Payments
              </NavLink>
            </li> */}
            <li>
              <NavLink to="/settings" onClick={() => setSidebarOpen(false)}>
                <i className="fa-solid fa-gear"></i> System Settings
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="avatar" />
          <div className="user-info">
            <h4>Rifat Hasan</h4>
            <p>Super Admin</p>
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
              <input type="text" placeholder="Search anything..." />
            </div>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn">
              <i className="fa-regular fa-bell"></i>
              <span className="badge">3</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="avatar" style={{ width: '32px', height: '32px' }} />
              <div style={{ display: 'none' }} className="desktop-only">
                 <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Rifat Hasan</span>
                 <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.75rem', marginLeft: '4px' }}></i>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
