import React, { useEffect, useMemo, useState } from "react";
import {
  Outlet,
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useStore } from "../app/providers/StoreProvider";
import { useAuth } from "../app/providers/AuthProvider";
import { CartProvider, useCart } from "../features/cart/CartProvider";
import { QueryState } from "../components/common/QueryState";
import LoadingSpinner from "../shared/components/LoadingSpinner";
import { request } from "../services/api";
import { Capacitor } from "@capacitor/core";
import {
  TbCategory2,
  TbBuildingStore,
  TbHeart,
  TbHome,
  TbMenu2,
  TbPackage,
  TbSearch,
  TbShoppingBag,
  TbUserCircle,
  TbX,
} from "react-icons/tb";

const customerKey = (storeId) => `ownshop:customer:${storeId}`;
const browserKey = "ownshop:browser-id";

function CustomerDialog({ open, onClose, customer, onSave, onLogout }) {
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setUsername(customer?.username || ""), [customer, open]);
  if (!open) return null;
  return (
    <div className="ob-modal" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="ob-modal-close" onClick={onClose} aria-label="Close">
          <TbX aria-hidden="true" />
        </button>
        <span className="ob-kicker">Origins of Beauty</span>
        <h2 id="customer-title">
          {customer ? `Hi, ${customer.username}` : "Sign in or sign up"}
        </h2>
        <p>
          No password or email needed. Your name stays signed in only on this
          browser.
        </p>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const value = username.trim();
            if (!value || saving) return;
            setSaving(true);
            setError("");
            try {
              await onSave(value);
            } catch {
              setError("Unable to sign in right now. Please try again.");
            } finally {
              setSaving(false);
            }
          }}
        >
          <label>
            Username
            <input
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              minLength="2"
              maxLength="40"
              pattern="[A-Za-z0-9_. -]+"
              required
              placeholder="Your username"
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="ob-primary" type="submit" disabled={saving}>
            {saving && <span className="spinner" />}{" "}
            {saving ? "Signing in..." : "Continue"}
          </button>
        </form>
        {customer && (
          <button className="ob-link-button" onClick={onLogout}>
            Sign out on this browser
          </button>
        )}
      </section>
    </div>
  );
}

function StoreShell() {
  const { storeSlug, store } = useStore();
  const { user } = useAuth();
  const { count, notice, dismissNotice } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const base = `/${storeSlug}`;
  const isAdminPreview =
    Capacitor.isNativePlatform() &&
    new URLSearchParams(location.search).get("adminPreview") === "1";
  const [menuOpen, setMenuOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const isHome = location.pathname === base || location.pathname === `${base}/`;
  const [customer, setCustomer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(customerKey(store._id)));
    } catch {
      return null;
    }
  });
  const links = useMemo(
    () => [
      ["Home", base],
      ["Products", `${base}/products`],
      ["Categories", `${base}/categories`],
      ["Wishlist", `${base}/wishlist`],
      ["My Orders", `${base}/orders`],
    ],
    [base],
  );
  const saveCustomer = async (username) => {
    let browserId = localStorage.getItem(browserKey);
    if (!browserId) {
      browserId = crypto.randomUUID();
      localStorage.setItem(browserKey, browserId);
    }
    const identity = await request("post", `/customers/store/${storeSlug}`, {
      username,
      browserId,
    });
    const value = {
      username,
      browserId,
      isMerchant: identity?.isMerchant === true,
      signedInAt: new Date().toISOString(),
    };
    localStorage.setItem(customerKey(store._id), JSON.stringify(value));
    setCustomer(value);
    setIdentityOpen(false);
  };
  const logout = () => {
    localStorage.removeItem(customerKey(store._id));
    setCustomer(null);
    setIdentityOpen(false);
  };
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  useEffect(() => {
    const updateScrollState = () => setScrolledPast(window.scrollY > 80);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);
  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`${base}/products?q=${encodeURIComponent(searchValue.trim())}`);
  };
  const authenticatedStoreAdmin =
    ["ADMIN", "ECO"].includes(user?.role) &&
    String(user?.tenantId?._id || user?.tenantId) === String(store._id);
  return (
    <div className="ob-store">
      {isAdminPreview && (
        <div className="mobile-preview-bar">
          <span>Customer storefront preview</span>
          <Link to={`/${storeSlug}/admin/dashboard`}>Return to Admin</Link>
        </div>
      )}
      <header className={`ob-header ${isHome ? "ob-header-flow" : ""}`}>
        <div className="ob-nav">
          <button
            className="ob-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <TbMenu2 aria-hidden="true" />
          </button>
          <Link className="ob-brand" to={base}>
            <span>
              {store.profileImage?.url ? (
                <img src={store.profileImage.url} alt="" />
              ) : (
                "O"
              )}
            </span>
            <strong>
              Origins<em>ofBeauty</em>
            </strong>
          </Link>
          <form
            className="ob-search"
            role="search"
            onSubmit={submitSearch}
          >
            <span>
              <TbSearch aria-hidden="true" />
            </span>
            <input
              name="q"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              aria-label="Search products"
              placeholder="Search products..."
            />
            <button>Search</button>
          </form>
          <nav className="ob-desktop-nav">
            {(customer?.isMerchant || authenticatedStoreAdmin) && (
              <Link
                to={`/${storeSlug}/admin`}
                aria-label="Merchant Admin"
                title="Merchant Admin"
              >
                <TbBuildingStore aria-hidden="true" />
              </Link>
            )}
            <Link
              to={`${base}/categories`}
              aria-label="Browse categories"
              title="Categories"
            >
              <TbCategory2 aria-hidden="true" />
            </Link>
            <button
              onClick={() => setIdentityOpen(true)}
              aria-label={
                customer ? `Signed in as ${customer.username}` : "Sign in"
              }
              title={customer?.username || "Sign in"}
            >
              <TbUserCircle aria-hidden="true" />
            </button>
            <Link
              className="ob-cart-link"
              to={`${base}/cart`}
              aria-label={`Shopping bag with ${count} items`}
              title="Shopping bag"
            >
              <TbShoppingBag aria-hidden="true" />
              <b>{count}</b>
            </Link>
          </nav>
        </div>
      </header>
      {isHome && (
        <div className={`ob-floating-search ${scrolledPast ? "visible" : ""}`}>
          <form role="search" onSubmit={submitSearch}>
            <TbSearch aria-hidden="true" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              aria-label="Search products"
              placeholder="Search products..."
            />
          </form>
        </div>
      )}
      <div
        className={`ob-drawer-backdrop ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside className={`ob-drawer ${menuOpen ? "open" : ""}`}>
        <div className="ob-drawer-head">
          <Link className="ob-brand" to={base}>
            <span>
              {store.profileImage?.url ? (
                <img src={store.profileImage.url} alt="" />
              ) : (
                "O"
              )}
            </span>
            <strong>
              Origins<em>ofBeauty</em>
            </strong>
          </Link>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <TbX aria-hidden="true" />
          </button>
        </div>
        {links.map(([label, to]) => (
          <NavLink end key={to} to={to}>
            {label === "Home" && <TbHome aria-hidden="true" />}
            {label === "Products" && <TbPackage aria-hidden="true" />}
            {label === "Categories" && <TbCategory2 aria-hidden="true" />}
            {label === "Wishlist" && <TbHeart aria-hidden="true" />}
            {label === "My Orders" && <TbShoppingBag aria-hidden="true" />}
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => {
            setMenuOpen(false);
            setIdentityOpen(true);
          }}
        >
          <TbUserCircle aria-hidden="true" />
          {customer ? `Signed in as ${customer.username}` : "Sign In / Sign Up"}
        </button>
        {(customer?.isMerchant || authenticatedStoreAdmin) && (
          <Link to={`/${storeSlug}/admin`}>Merchant Admin</Link>
        )}
      </aside>
      {notice && (
        <div className="ob-toast" role="status">
          {notice}
          <button onClick={dismissNotice} aria-label="Dismiss notification">
            <TbX aria-hidden="true" />
          </button>
        </div>
      )}
      <main className="ob-main">
        <Outlet context={{ customer }} />
      </main>
      <footer className="ob-footer">
        <div>
          <Link className="ob-brand" to={base}>
            <span>
              {store.profileImage?.url ? (
                <img src={store.profileImage.url} alt="" />
              ) : (
                "O"
              )}
            </span>
            <strong>
              Origins<em>ofBeauty</em>
            </strong>
          </Link>
          <p>
            {store.description ||
              "Authentic beauty, skincare and self-care essentials."}
          </p>
        </div>
        <div>
          <strong>Explore</strong>
          <Link to={`${base}/products`}>All products</Link>
          <Link to={`${base}/categories`}>Categories</Link>
          <Link to={`${base}/orders`}>Track orders</Link>
        </div>
        <div>
          <strong>Customer care</strong>
          <a
            href={`mailto:${store.supportEmail || "support@originsofbeauty.com"}`}
          >
            Contact us
          </a>
          {store.showShippingFees && store.whatsappNumber && (
            <a
              href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp: {store.whatsappNumber}
            </a>
          )}
          {store.showShippingFees &&
            store.useZoneShippingFees &&
            store.shippingFees && (
              <span className="ob-footer-delivery">
                Delivery: {store.shippingFees.insideDhaka} BDT inside Dhaka ·{" "}
                {store.shippingFees.outsideDhaka} BDT outside Dhaka
              </span>
            )}
          {(customer?.isMerchant || authenticatedStoreAdmin) && (
            <Link to={`/${storeSlug}/admin`}>Merchant Admin</Link>
          )}
        </div>
        <small>
          © {new Date().getFullYear()} Origins of Beauty · Powered by OwnShop
        </small>
      </footer>
      <nav
        className={`ob-bottom-nav ${isHome && scrolledPast ? "visible" : ""}`}
      >
        <NavLink end to={base} aria-label="Home" title="Home">
          <TbHome aria-hidden="true" />
        </NavLink>
        <NavLink
          to={`${base}/categories`}
          aria-label="Categories"
          title="Categories"
        >
          <TbCategory2 aria-hidden="true" />
        </NavLink>
        <NavLink
          className="ob-mobile-bag"
          to={`${base}/cart`}
          aria-label={`Shopping bag with ${count} items`}
          title="Shopping bag"
        >
          <TbShoppingBag aria-hidden="true" />
          {count > 0 && <b>{count}</b>}
        </NavLink>
        <button
          onClick={() => setIdentityOpen(true)}
          aria-label={
            customer ? `Signed in as ${customer.username}` : "Sign in"
          }
          title={customer?.username || "Sign in"}
        >
          <TbUserCircle aria-hidden="true" />
        </button>
      </nav>
      <CustomerDialog
        open={identityOpen}
        onClose={() => setIdentityOpen(false)}
        customer={customer}
        onSave={saveCustomer}
        onLogout={logout}
      />
    </div>
  );
}

export function BeautyStoreLayout() {
  const { store, query } = useStore();
  if (query.isPending)
    return (
      <div className="ob-route-loader">
        <LoadingSpinner label="Loading store..." />
      </div>
    );
  return (
    <QueryState query={query}>
      {store && (
        <CartProvider key={store._id} store={store}>
          <StoreShell />
        </CartProvider>
      )}
    </QueryState>
  );
}
