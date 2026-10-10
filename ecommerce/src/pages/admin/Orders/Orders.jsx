import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useOrdersPage,
  transitions,
} from "../../../features/orders/hooks/useOrdersPage";
import { QueryState, money } from "../../../components/common/QueryState";
import { Pagination } from "../../../components/common/Pagination";
import { errorMessage } from "../../../services/api";
import {
  TbRefresh,
  TbSearch,
  TbShoppingCart,
} from "react-icons/tb";
export default function Orders() {
  const { id, storeSlug } = useParams();
  const hook = useOrdersPage(id);
  const client = useQueryClient();
  const order = hook.details.data;
  if (id)
    return (
      <>
        <Link to={`/${storeSlug}/admin/orders`}>← Back to Orders</Link>
        <h1>Order #{id.slice(-8)}</h1>
        <QueryState query={hook.details}>
          {order && (
            <>
              <div className="card form-stack">
                <h2>Status: {order.status}</h2>
                <div className="row">
                  {transitions[order.status]?.map((status) => (
                    <button
                      className="btn-primary"
                      key={status}
                      disabled={hook.mutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Change this order to ${status}?`))
                          hook.mutation.mutate(
                            { method: "patch", id, data: { status } },
                            {
                              onSuccess: () =>
                                client.invalidateQueries({
                                  queryKey: ["adminOrder", id],
                                }),
                            },
                          );
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                {hook.mutation.isError && (
                  <p className="error" role="alert">
                    {errorMessage(hook.mutation.error)}
                  </p>
                )}
              </div>
              <div className="checkout-grid">
                <section className="card">
                  <h2>Order Items</h2>
                  {order.orderItems.map((item) => (
                    <div className="summary-line" key={item.productId}>
                      {item.name} × {item.quantity}
                      <strong>{money(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </section>
                <aside className="card order-summary">
                  <h2>Shipping Details</h2>
                  <p>{order.shippingDetails.name}</p>
                  <p>{order.shippingDetails.phone}</p>
                  <p>{order.shippingDetails.address}</p>
                  <div>
                    Shipping<strong>{money(order.shippingFee)}</strong>
                  </div>
                  <div className="total">
                    Total<strong>{money(order.totalPrice)}</strong>
                  </div>
                  <p>Payment: {order.payment?.paymentStatus}</p>
                </aside>
              </div>
            </>
          )}
        </QueryState>
      </>
    );
  return (
    <>
      <div className="dashboard-header merchant-page-heading admin-heading-with-icon">
        <span className="admin-title-icon"><TbShoppingCart /></span>
        <div>
          <h1>Orders</h1>
          <p>Track fulfilment and delivery.</p>
        </div>
        <button className="btn-secondary" onClick={() => hook.query.refetch()}>
          <TbRefresh aria-hidden="true" /> Refresh
        </button>
      </div>
      <div className="order-status-tabs">
        {["", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
          <button
            key={status || "all"}
            className={hook.status === status ? "active" : ""}
            onClick={() => hook.setStatus(status)}
          >
            {status ? status[0].toUpperCase() + status.slice(1) : "All Orders"}
            <span>
              {(hook.query.data || []).filter((order) => !status || order.status === status).length}
            </span>
          </button>
        ))}
      </div>
      <div className="filters admin-filter-bar">
        <label className="admin-search-box">
          <TbSearch aria-hidden="true" />
          <input
            placeholder="Search orders, customer name or order ID..."
            value={hook.search}
            onChange={(event) => hook.setSearch(event.target.value)}
          />
        </label>
        <label className="admin-select-control">
          Status
          <select
            value={hook.status}
            onChange={(event) => hook.setStatus(event.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.keys(transitions).map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      <QueryState query={hook.query}>
        <div className="card table-container admin-list-card order-list-card">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {hook.rows.map((item) => (
                <tr key={item._id}>
                  <td>#{item._id.slice(-8)}</td>
                  <td>{item.shippingDetails?.name}</td>
                  <td>{money(item.totalPrice)}</td>
                  <td>
                    <span className="status-badge">{item.status}</span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/${storeSlug}/admin/orders/${item._id}`}>View Details →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!hook.rows.length && <p className="state-card">No orders found.</p>}
        </div>
        <Pagination {...hook} />
      </QueryState>
    </>
  );
}
