import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import { QueryState, money } from "../../../components/common/QueryState";
function RevenueChart({ daily = [] }) {
  const max = Math.max(1, ...daily.map((day) => day.revenue));
  const points = daily
    .map(
      (day, i) =>
        `${40 + (i * 520) / Math.max(1, daily.length - 1)},${190 - (day.revenue / max) * 150}`,
    )
    .join(" ");
  return (
    <div className="line-chart">
      <svg
        viewBox="0 0 600 230"
        role="img"
        aria-label="Revenue for orders placed in the selected period"
      >
        {[40, 90, 140, 190].map((y) => (
          <line key={y} x1="40" x2="570" y1={y} y2={y} stroke="#eaf0f7" />
        ))}
        <text x="2" y="43" fill="#8195aa" fontSize="10">
          {money(max)}
        </text>
        <text x="8" y="193" fill="#8195aa" fontSize="10">
          0
        </text>
        {daily.length ? (
          <>
            <polyline
              points={points}
              fill="none"
              stroke="#2874ff"
              strokeWidth="2.5"
            />
            {daily.map((day, i) => (
              <g key={day._id}>
                <circle
                  cx={40 + (i * 520) / Math.max(1, daily.length - 1)}
                  cy={190 - (day.revenue / max) * 150}
                  r="3"
                  fill="#2874ff"
                >
                  <title>
                    {day._id}: {money(day.revenue)}
                  </title>
                </circle>
                {(i === 0 ||
                  i === daily.length - 1 ||
                  i % Math.ceil(daily.length / 6) === 0) && (
                  <text
                    x={40 + (i * 520) / Math.max(1, daily.length - 1)}
                    y="216"
                    textAnchor="middle"
                    fontSize="10"
                    fill="#8195aa"
                  >
                    {day._id.slice(5)}
                  </text>
                )}
              </g>
            ))}
          </>
        ) : (
          <text
            x="300"
            y="120"
            textAnchor="middle"
            fill="#8195aa"
            fontSize="13"
          >
            No orders in this period
          </text>
        )}
      </svg>
    </div>
  );
}
function StoreStatus({ data }) {
  const total = Math.max(1, data.totalStores || 0);
  const active =
    data.storeStatus?.find((item) => item._id === "ACTIVE")?.total || 0;
  const inactive =
    data.storeStatus?.find((item) => item._id === "INACTIVE")?.total || 0;
  return (
    <section className="card">
      <h2>Store Status</h2>
      <div className="status-chart">
        <div
          className="donut"
          style={{
            background: `conic-gradient(#0a9fe8 0 ${(active / total) * 100}%, #ffb54a ${(active / total) * 100}% ${((active + inactive) / total) * 100}%, #ed6679 ${((active + inactive) / total) * 100}% 100%)`,
          }}
        >
          <div>
            <strong>{data.totalStores || 0}</strong>
            <small>Total Stores</small>
          </div>
        </div>
        <ul>
          {["ACTIVE", "INACTIVE", "SUSPENDED"].map((status, i) => (
            <li key={status}>
              <span
                style={{ background: ["#0a9fe8", "#ffb54a", "#ed6679"][i] }}
              />
              {status.toLowerCase()}{" "}
              <strong>
                {data.storeStatus?.find((item) => item._id === status)?.total ||
                  0}
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
export function DashboardView({ platform = false }) {
  const { storeSlug } = useParams();
  const [days, setDays] = useState("30");
  const query = useDashboard(days);
  const data = query.data || {};
  const compactMoney = (value) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      currencyDisplay: "narrowSymbol",
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value || 0);
  const stats = platform
    ? [
        ["Total Stores", data.totalStores],
        ["Store Admins", data.admins],
        ["Total Customers", data.totalCustomers],
        ["Total Revenue", compactMoney(data.totalRevenue)],
        ["Pending Orders", data.pendingOrders],
      ]
    : [
        ["Total Products", data.products],
        ["Total Orders", data.totalOrders],
        ["Total Customers", data.totalCustomers],
        ["Total Revenue", compactMoney(data.totalRevenue)],
        ["Pending Orders", data.pendingOrders],
      ];
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            {platform ? "Overview of your platform" : "Overview of your store"}
          </p>
        </div>
        <div className="row">
          <label className="sr-only" htmlFor="dashboard-range">
            Date Range
          </label>
          <select
            id="dashboard-range"
            value={days}
            onChange={(event) => setDays(event.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <button className="btn-primary" onClick={() => query.refetch()}>
            Refresh
          </button>
        </div>
      </div>
      <QueryState query={query}>
        <div className="stats-grid">
          {stats.map(([label, value], i) => (
            <div className="card stat-card" key={label}>
              <span
                className={`stat-icon ${["blue", "purple", "green", "orange", "blue"][i]}`}
              >
                ◈
              </span>
              <div>
                <p>{label}</p>
                <strong
                  className="metric"
                  title={
                    label === "Total Revenue"
                      ? money(data.totalRevenue)
                      : undefined
                  }
                >
                  {value ?? 0}
                </strong>
              </div>
            </div>
          ))}
        </div>
        <div className={platform ? "platform-charts-grid" : "charts-grid"}>
          <section className="card">
            <h2>Revenue Overview</h2>
            <p className="muted">
              Collected revenue from orders placed in the last {days} days
            </p>
            <RevenueChart daily={data.daily} />
          </section>
          {platform && (
            <>
              <section className="card">
                <div className="section-heading">
                  <h2>Top Stores by Revenue</h2>
                  <Link to="/stores">View All →</Link>
                </div>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Store</th>
                        <th>Revenue</th>
                        <th>Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topStores?.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <Link to={`/stores/${item._id}`}>
                              {item.store.name}
                            </Link>
                          </td>
                          <td>{money(item.revenue)}</td>
                          <td>{item.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!data.topStores?.length && (
                    <p className="muted">No collected revenue yet.</p>
                  )}
                </div>
              </section>
              <StoreStatus data={data} />
            </>
          )}
          {!platform && (
            <section className="card">
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                <Link to={`/${storeSlug}/admin/products/create`}>+ Add Product</Link>
                <Link to={`/${storeSlug}/admin/orders`}>Manage Orders</Link>
                <Link to={`/${storeSlug}/admin/settings`}>Settings</Link>
              </div>
            </section>
          )}
        </div>
        {platform && (
          <div className="charts-grid">
            <section className="card">
              <h2>Recent Stores</h2>
              {data.recentStores?.map((store) => (
                <div className="summary-line" key={store._id}>
                  <div>
                    <Link to={`/stores/${store._id}`}>{store.name}</Link>
                    <p className="muted">
                      Created{" "}
                      {new Date(store.createdAt).toLocaleDateString("en-BD")}
                    </p>
                  </div>
                  <span
                    className={`status-badge status-${store.status.toLowerCase()}`}
                  >
                    {store.status}
                  </span>
                </div>
              ))}
              {!data.recentStores?.length && (
                <p className="muted">No stores yet.</p>
              )}
            </section>
            <section className="card">
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                <Link to="/stores/create">+ Create Store</Link>
                <Link to="/admins/create">Add Admin</Link>
                <Link to="/settings">Settings</Link>
              </div>
            </section>
          </div>
        )}
        <section className="card">
          <h2>Recent Orders</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders?.map((order) => (
                  <tr key={order._id}>
                    <td>
                      {platform ? (
                        order._id.slice(-8)
                      ) : (
                        <Link to={`/${storeSlug}/admin/orders/${order._id}`}>
                          {order._id.slice(-8)}
                        </Link>
                      )}
                    </td>
                    <td>{order.shippingDetails?.name}</td>
                    <td>{money(order.totalPrice)}</td>
                    <td>
                      <span className="status-badge">{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.recentOrders?.length && (
              <p className="state-card">No orders yet.</p>
            )}
          </div>
        </section>
      </QueryState>
    </>
  );
}
