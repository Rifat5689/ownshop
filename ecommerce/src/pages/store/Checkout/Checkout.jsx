import React from "react";
import { Link } from "react-router-dom";
import { useCheckout } from "../../../features/orders/hooks/useCheckout";
import { money } from "../../../components/common/QueryState";
import { errorMessage } from "../../../services/api";
export default function Checkout() {
  const { shipping, setShipping, mutation, cart, store, storeSlug } =
    useCheckout();
  if (!cart.items.length)
    return (
      <div className="state-card">
        <h1>Your cart is empty</h1>
        <Link className="btn-primary" to={`/${storeSlug}/products`}>
          Browse Products
        </Link>
      </div>
    );
  return (
    <div className="shop-container">
      <h1>Checkout</h1>
      <p className="breadcrumb">Shipping → Payment → Confirmation</p>
      <form
        className="checkout-grid"
        onSubmit={(event) => {
          event.preventDefault();
          if (!mutation.isPending) mutation.mutate();
        }}
      >
        <section className="card form-stack">
          <h2>Shipping Address</h2>
          {["name", "phone", "address"].map((field) => (
            <label key={field}>
              {field === "name"
                ? "Full Name"
                : field === "phone"
                  ? "Phone Number"
                  : "Delivery Address"}
              <input
                required
                maxLength={field === "address" ? 500 : 100}
                type={field === "phone" ? "tel" : "text"}
                autoComplete={
                  field === "name"
                    ? "name"
                    : field === "phone"
                      ? "tel"
                      : "street-address"
                }
                value={shipping[field]}
                onChange={(event) =>
                  setShipping({ ...shipping, [field]: event.target.value })
                }
              />
            </label>
          ))}
          <h2>Payment Method</h2>
          <label className="row">
            <input type="radio" name="payment" checked readOnly /> Cash on
            Delivery
          </label>
          <p className="muted">Pay your merchant when your order arrives.</p>
        </section>
        <aside className="card order-summary">
          <h2>Order Summary</h2>
          {cart.items.map((item) => (
            <div key={item.product._id}>
              {item.product.name} × {item.quantity}
            </div>
          ))}
          <div>
            Subtotal <strong>{money(cart.subtotal)}</strong>
          </div>
          <div>
            Shipping <strong>{money(store.shippingFee)}</strong>
          </div>
          <div className="total">
            Total{" "}
            <strong>{money(cart.subtotal + (store.shippingFee || 0))}</strong>
          </div>
          <p className="muted">
            Availability and prices are confirmed when you place your order.
          </p>
          {mutation.isError && (
            <p role="alert" className="error">
              {errorMessage(mutation.error)}
            </p>
          )}
          <button className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
