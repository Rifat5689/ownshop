import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  TbBuildingStore,
  TbCreditCard,
  TbHomeStats,
  TbLogout,
  TbMenu2,
  TbPackage,
  TbPlus,
  TbSettings,
  TbShield,
  TbUsers,
  TbX,
} from "react-icons/tb";
import { useAuth } from "../app/providers/AuthProvider";
import { errorMessage } from "../services/api";

const links = [
  ["Dashboard", "/dashboard", TbHomeStats],
  ["Stores", "/stores", TbBuildingStore],
  ["Admins", "/admins", TbUsers],
  ["Products", "/products", TbPackage],
  ["Subscriptions", "/subscriptions", TbCreditCard],
  ["Platform Settings", "/settings", TbSettings],
];

export function ProfessionalAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const close = (event) => event.key === "Escape" && setSidebarOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate("/login");
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
          <TbShield className="sidebar-logo" />
          <h2>Super Admin</h2>
          <button
            className="drawer-close"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <TbX />
          </button>
        </div>
        <div className="sidebar-profile">
          <span className="profile-circle">
            {user?.username?.[0]?.toUpperCase()}
          </span>
          <div>
            <strong>{user?.username}</strong>
            <small>Platform Owner</small>
          </div>
        </div>
        <nav aria-label="Admin navigation">
          <ul>
            {links.map(([label, to, Icon]) => (
              <li key={to}>
                <NavLink to={to} onClick={() => setSidebarOpen(false)}>
                  <Icon aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={signOut} disabled={signingOut}>
            <TbLogout />
            {signingOut ? "Signing out..." : "Logout"}
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
              <TbMenu2 />
            </button>
            <span className="muted">Platform Overview</span>
          </div>
          <div className="row">
            <Link to="/stores/create" className="btn-primary">
              <TbPlus />
              Create Store
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
        {links.slice(0, 4).map(([label, to, Icon]) => (
          <NavLink key={to} to={to} aria-label={label} title={label}>
            <Icon aria-hidden="true" />
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
