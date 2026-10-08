import React, { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { errorMessage } from "../services/api";
const links = [
  ["Dashboard", "/admin/dashboard", "▧"],
  ["Products", "/admin/products", "◇"],
  ["Categories", "/admin/categories", "▦"],
  ["Orders", "/admin/orders", "▤"],
  ["Customers", "/admin/customers", "♙"],
  ["Store Settings", "/admin/settings", "⚙"],
];
export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate("/admin/login");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSigningOut(false);
    }
  };
  return (
    <div className="app-container">
      {sidebarOpen && (
        <button
          className="drawer-overlay"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        id="admin-sidebar"
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
      >
        <div className="sidebar-header">
          <span className="sidebar-logo">◉</span>
          <h2>Store Admin</h2>
          <button
            className="drawer-close"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="sidebar-profile">
          <span className="profile-circle">
            {user?.username?.[0]?.toUpperCase()}
          </span>
          <div>
            <strong>{user?.username}</strong>
            <small>Store Manager</small>
          </div>
        </div>
        <nav aria-label="Admin navigation">
          <ul>
            {links.map(([label, to, icon]) => (
              <li key={to}>
                <NavLink to={to} onClick={() => setSidebarOpen(false)}>
                  <span aria-hidden="true">{icon}</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={signOut} disabled={signingOut}>
            ↪ {signingOut ? "Signing Out..." : "Logout"}
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="row">
            <button
              className="mobile-menu-btn"
              aria-label="Open menu"
              aria-controls="admin-sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <span className="muted">Your Store</span>
          </div>
          <div className="row">
            user?.store?.slug &&{" "}
            <Link
              className="btn-primary"
              to={`/${user.store.slug}`}
              target="_blank"
            >
              View Storefront ↗
            </Link>
            <span className="profile-circle">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
        </header>
        <div className="content-area">
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <Outlet />
        </div>
      </main>
      <nav className="admin-bottom-nav" aria-label="Mobile admin navigation">
        {links.slice(0, 4).map(([label, to]) => (
          <NavLink key={to} to={to}>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
