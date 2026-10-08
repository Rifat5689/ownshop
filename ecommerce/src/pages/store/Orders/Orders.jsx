import React from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "../../../app/providers/StoreProvider";
import { readStorage } from "../../../features/cart/utils/cartStorage";
import { request } from "../../../services/api";
import { QueryState, money } from "../../../components/common/QueryState";
export function OrderSuccess() {
  const { state } = useLocation();
  const { storeSlug } = useStore();
  return (
    <div className="state-card">
      <span className="success-mark">✓</span>
      <h1>
        {state?.order ? "Thank you for your order!" : "Order Confirmation"}
      </h1>
      {state?.order && (
        <>
          <p>Order #{state.order._id.slice(-8)}</p>
          <p>Total: {money(state.order.totalPrice)}</p>
          <Link
            className="btn-primary"
            to={`/${storeSlug}/orders/${state.order._id}`}
            state={{ order: state.order }}
          >
            Track Order
          </Link>
        </>
      )}
      <Link className="text-button" to={`/${storeSlug}/orders`}>
        My Orders
      </Link>
      <Link to={`/${storeSlug}/products`}>Continue Shopping</Link>
    </div>
  );
}
export default function Orders() {
  const { store, storeSlug } = useStore();
  const orders = readStorage(`ownshop:orders:${store._id}`);
  return (
    <div className="shop-container">
      <h1>My Orders</h1>
      <p className="muted">Guest orders placed in this browser.</p>
      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Total</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>#{order._id.slice(-8)}</td>
                <td>{money(order.totalPrice)}</td>
                <td>
                  <Link to={`/${storeSlug}/orders/${order._id}`}>
                    View Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && (
          <div className="state-card">
            <p>No orders yet.</p>
            <Link className="btn-primary" to={`/${storeSlug}/products`}>
              Shop Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
export function OrderDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const { store, storeSlug } = useStore();
  const saved =
    state?.order ||
    readStorage(`ownshop:orders:${store._id}`).find(
      (order) => order._id === id,
    );
  const query = useQuery({
    queryKey: ["guestOrder", storeSlug, id],
    queryFn: () =>
      request("get", `/orders/store/${storeSlug}/${id}`, undefined, {
        headers: { "X-Tracking-Token": saved?.trackingToken },
      }),
    enabled: !!saved?.trackingToken,
  });
  if (!saved?.trackingToken)
    return (
      <div className="state-card">
        <h1>Order unavailable</h1>
        <p>Open this order in the browser where it was placed.</p>
        <Link to={`/${storeSlug}/orders`}>Back to Orders</Link>
      </div>
    );
  const order = query.data;
  return (
    <div className="shop-container">
      <Link to={`/${storeSlug}/orders`}>← Back to Orders</Link>
      <h1>Order #{id.slice(-8)}</h1>
      <QueryState query={query}>
        {order && (
          <>
            <div className="card">
              <h2 className="stock-label">{order.status}</h2>
              <p>
                Placed{" "}
                {new Date(order.createdAt).toLocaleString("en-BD", {
                  timeZone: "Asia/Dhaka",
                })}
              </p>
            </div>
            <div className="checkout-grid">
              <section className="card">
                <h2>Items</h2>
                {order.orderItems.map((item) => (
                  <div className="summary-line" key={item.productId}>
                    {item.name} × {item.quantity}
                    <strong>{money(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </section>
              <aside className="card order-summary">
                <h2>Shipping Address</h2>
                <p>{order.shippingDetails.name}</p>
                <p>{order.shippingDetails.phone}</p>
                <p>{order.shippingDetails.address}</p>
                <div>
                  Payment <strong>{order.payment.paymentMethod}</strong>
                </div>
                <div className="total">
                  Total <strong>{money(order.totalPrice)}</strong>
                </div>
              </aside>
            </div>
          </>
        )}
      </QueryState>
    </div>
  );
}
