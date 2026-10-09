import React, { useEffect, useMemo, useState } from "react";
import {
  Outlet,
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useStore } from "../app/providers/StoreProvider";
import { CartProvider, useCart } from "../features/cart/CartProvider";
import { QueryState } from "../components/common/QueryState";

const customerKey = (storeId) => `ownshop:customer:${storeId}`;

function CustomerDialog({ open, onClose, customer, onSave, onLogout }) {
  const [username, setUsername] = useState("");
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
          ×
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
          onSubmit={(event) => {
            event.preventDefault();
            const value = username.trim();
            if (value) onSave(value);
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
          <button className="ob-primary" type="submit">
            Continue
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
  const { count, notice, dismissNotice } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const base = `/${storeSlug}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
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
  const saveCustomer = (username) => {
    const value = { username, signedInAt: new Date().toISOString() };
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
  return (
    <div className="ob-store">
      <header className="ob-header">
        <div className="ob-nav">
          <button
            className="ob-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <Link className="ob-brand" to={base}>
            <span>O</span>
            <strong>
              Origins<em>ofBeauty</em>
            </strong>
          </Link>
          <form
            className="ob-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              navigate(
                `${base}/products?q=${encodeURIComponent(new FormData(event.currentTarget).get("q") || "")}`,
              );
            }}
          >
            <span>⌕</span>
            <input
              name="q"
              aria-label="Search products"
              placeholder="Search products..."
            />
            <button>Search</button>
          </form>
          <nav className="ob-desktop-nav">
            <Link to={`${base}/categories`}>Shop</Link>
            <button onClick={() => setIdentityOpen(true)}>
              ♙ {customer?.username || "Sign In"}
            </button>
            <Link className="ob-cart-link" to={`${base}/cart`}>
              Bag <b>{count}</b>
            </Link>
          </nav>
        </div>
      </header>
      <div
        className={`ob-drawer-backdrop ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside className={`ob-drawer ${menuOpen ? "open" : ""}`}>
        <div className="ob-drawer-head">
          <Link className="ob-brand" to={base}>
            <span>O</span>
            <strong>
              Origins<em>ofBeauty</em>
            </strong>
          </Link>
          <button onClick={() => setMenuOpen(false)}>Close</button>
        </div>
        {links.map(([label, to]) => (
          <NavLink end key={to} to={to}>
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => {
            setMenuOpen(false);
            setIdentityOpen(true);
          }}
        >
          {customer ? `Signed in as ${customer.username}` : "Sign In / Sign Up"}
        </button>
        <Link to={`/${storeSlug}/admin`}>Merchant Admin</Link>
      </aside>
      {notice && (
        <div className="ob-toast" role="status">
          {notice}
          <button onClick={dismissNotice}>×</button>
        </div>
      )}
      <main className="ob-main">
        <Outlet context={{ customer }} />
      </main>
      <footer className="ob-footer">
        <div>
          <Link className="ob-brand" to={base}>
            <span>O</span>
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
          <Link to={`/${storeSlug}/admin`}>Merchant login</Link>
        </div>
        <small>
          © {new Date().getFullYear()} Origins of Beauty · Powered by OwnShop
        </small>
      </footer>
      <nav className="ob-bottom-nav">
        <NavLink end to={base}>
          Home
        </NavLink>
        <NavLink to={`${base}/categories`}>Categories</NavLink>
        <NavLink to={`${base}/cart`}>Bag ({count})</NavLink>
        <button onClick={() => setIdentityOpen(true)}>
          {customer?.username || "Sign In"}
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
