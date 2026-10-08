import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../../app/providers/StoreProvider";
import { useCart } from "../../../features/cart/CartProvider";
import { ProductCard } from "../../../features/store/components/ProductCard";
export function Wishlist() {
  const { wishlist } = useCart();
  const { storeSlug } = useStore();
  return (
    <div className="shop-container">
      <h1>Your Wishlist</h1>
      {wishlist.length ? (
        <div className="product-grid">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="state-card">
          <p>Your wishlist is empty.</p>
          <Link className="btn-primary" to={`/${storeSlug}/products`}>
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
export default function Account() {
  const { storeSlug } = useStore();
  return (
    <div className="shop-container">
      <h1>My Account</h1>
      <section className="card">
        <h2>Welcome, Guest</h2>
        <p>
          Shop without creating an account. Your cart, wishlist and order links
          are saved in this browser.
        </p>
        <div className="quick-actions">
          <Link to={`/${storeSlug}/orders`}>My Orders →</Link>
          <Link to={`/${storeSlug}/wishlist`}>Wishlist →</Link>
          <Link to={`/${storeSlug}/cart`}>Cart →</Link>
        </div>
      </section>
    </div>
  );
}
