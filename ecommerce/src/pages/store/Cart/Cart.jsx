import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../features/cart/CartProvider";
import { useStore } from "../../../app/providers/StoreProvider";
import { priceOf } from "../../../features/cart/utils/cartStorage";
import { ProductImage } from "../../../features/store/components/ProductCard";
import { money } from "../../../components/common/QueryState";
export default function Cart() {
  const { items, update, remove, clear, subtotal, count } = useCart();
  const { storeSlug, store } = useStore();
  return (
    <div className="shop-container">
      <div className="section-heading">
        <h1>Your Cart ({count})</h1>
        {items.length > 0 && (
          <button className="text-button" onClick={clear}>
            Clear All
          </button>
        )}
      </div>
      {!items.length ? (
        <div className="state-card">
          <h2>Your cart is empty</h2>
          <p>Find something you love.</p>
          <Link className="btn-primary" to={`/${storeSlug}/products`}>
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="checkout-grid">
          <section className="card cart-items">
            {items.map(({ product, quantity }) => (
              <article key={product._id} className="cart-item">
                <ProductImage product={product} />
                <div>
                  <Link to={`/${storeSlug}/products/${product.slug}`}>
                    <h3>{product.name}</h3>
                  </Link>
                  <strong>{money(priceOf(product))}</strong>
                  <div className="quantity">
                    <button
                      aria-label={`Decrease ${product.name} quantity`}
                      disabled={quantity <= 1}
                      onClick={() => update(product._id, quantity - 1)}
                    >
                      −
                    </button>
                    <span>{quantity}</span>
                    <button
                      aria-label={`Increase ${product.name} quantity`}
                      disabled={quantity >= product.stock}
                      onClick={() => update(product._id, quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  aria-label={`Remove ${product.name}`}
                  className="icon-btn"
                  onClick={() => remove(product._id)}
                >
                  ×
                </button>
              </article>
            ))}
          </section>
          <aside className="card order-summary">
            <h2>Order Summary</h2>
            <div>
              Subtotal <strong>{money(subtotal)}</strong>
            </div>
            <div>
              Shipping{" "}
              <strong>
                {store.useZoneShippingFees && store.shippingFees
                  ? `From ${money(
                      Math.min(
                        store.shippingFees.insideDhaka,
                        store.shippingFees.outsideDhaka,
                      ),
                    )}`
                  : money(store.shippingFee)}
              </strong>
            </div>
            <div className="total">
              Subtotal <strong>{money(subtotal)}</strong>
            </div>
            <Link className="btn-primary" to={`/${storeSlug}/checkout`}>
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
