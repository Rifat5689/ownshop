import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  TbCategory2,
  TbBuildingStore,
  TbExternalLink,
  TbLayoutDashboard,
  TbLogout,
  TbMenu2,
  TbPackage,
  TbSettings,
  TbShoppingBag,
  TbUsers,
  TbX,
} from "react-icons/tb";
import { useAuth } from "../app/providers/AuthProvider";
import { errorMessage } from "../services/api";
import { Capacitor } from "@capacitor/core";
import AdminNotifications from "../features/notifications/AdminNotifications";

const navigation = [
  ["Dashboard", "dashboard", TbLayoutDashboard],
  ["Products", "products", TbPackage],
  ["Categories", "categories", TbCategory2],
  ["Orders", "orders", TbShoppingBag],
  ["Customers", "customers", TbUsers],
  ["Store Settings", "settings", TbSettings],
];

export function ProfessionalAdminLayout() {
  const { storeSlug } = useParams();
  const base = `/${storeSlug}/admin`;
  const links = navigation.map(([label, path, Icon]) => [
    label,
    `${base}/${path}`,
    Icon,
  ]);
  const bottomLinks = [
    ["Dashboard", `${base}/dashboard`, TbLayoutDashboard],
    ["Products", `${base}/products`, TbPackage],
    ["Orders", `${base}/orders`, TbShoppingBag],
    ["Store", `/${storeSlug}`, TbBuildingStore],
  ];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const close = (event) => event.key === "Escape" && setSidebarOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate(`${base}/login`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSigningOut(false);
    }
  };
  return (
    <div className="app-container merchant-admin-shell">
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
          <TbBuildingStore className="sidebar-logo" aria-hidden="true" />
          <h2>Store Admin</h2>
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
            <small>Store Manager</small>
          </div>
        </div>
        <nav aria-label="Admin navigation">
          <ul>
            {links.map(([label, to, Icon]) => (
              <li key={to}>
                <NavLink to={to} onClick={() => setSidebarOpen(false)}>
                  {React.createElement(Icon, { "aria-hidden": true })}
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={signOut} disabled={signingOut}>
            <TbLogout aria-hidden="true" />
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
            <TbBuildingStore className="topbar-store-icon" aria-hidden="true" />
            <strong className="topbar-store-name">Your Store</strong>
          </div>
          <div className="row">
            {user?.store?.slug && (
              <Link
                className="btn-primary"
                to={`/${user.store.slug}?adminPreview=1`}
                target={Capacitor.isNativePlatform() ? undefined : "_blank"}
              >
                View Storefront <TbExternalLink />
              </Link>
            )}
            <AdminNotifications base={base} />
            <span className="profile-circle">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
        </header>
        <div className="content-area" key={location.pathname}>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <Outlet />
        </div>
      </main>
      <nav className="admin-bottom-nav" aria-label="Mobile admin navigation">
        {bottomLinks.map(([label, to, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={label === "Store"}
            aria-label={label}
            title={label}
          >
            {React.createElement(Icon, { "aria-hidden": true })}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
