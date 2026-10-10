import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import {
  TbBell,
  TbBox,
  TbPackageOff,
  TbShoppingBag,
  TbX,
} from "react-icons/tb";
import { request } from "../../services/api";

export default function AdminNotifications({ base }) {
  const [open, setOpen] = useState(false);
  const initialized = useRef(false);
  const previousPending = useRef(new Set());
  const orders = useQuery({
    queryKey: ["mobileNotifications", "orders"],
    queryFn: () => request("get", "/orders"),
    refetchInterval: 30000,
  });
  const products = useQuery({
    queryKey: ["mobileNotifications", "products"],
    queryFn: () => request("get", "/products"),
    refetchInterval: 60000,
  });
  const pendingOrders = useMemo(
    () => (orders.data || []).filter((order) => order.status === "pending"),
    [orders.data],
  );
  const lowStock = useMemo(
    () =>
      (products.data || []).filter(
        (product) => product.isActive && product.stock <= 5,
      ),
    [products.data],
  );
  useEffect(() => {
    if (!orders.data) return;
    const current = new Set(pendingOrders.map((order) => order._id));
    if (initialized.current && Capacitor.isNativePlatform()) {
      const added = pendingOrders.filter(
        (order) => !previousPending.current.has(order._id),
      );
      if (added.length)
        import("@capacitor/local-notifications")
          .then(async ({ LocalNotifications }) => {
            const permission = await LocalNotifications.checkPermissions();
            if (permission.display === "prompt")
              await LocalNotifications.requestPermissions();
            await LocalNotifications.schedule({
              notifications: added.slice(0, 5).map((order, index) => ({
                id:
                  Math.abs(
                    [...order._id.slice(-7)].reduce(
                      (total, character) =>
                        total * 31 + character.charCodeAt(0),
                      index + 1,
                    ),
                  ) % 2147483647,
                title: "New order received",
                body: `${order.shippingDetails?.name || "A customer"} placed order #${order._id.slice(-8)}.`,
                schedule: { at: new Date(Date.now() + 500) },
              })),
            });
          })
          .catch(() => {});
    }
    previousPending.current = current;
    initialized.current = true;
  }, [orders.data, pendingOrders]);
  const count = pendingOrders.length + lowStock.length;
  return (
    <div className="admin-notifications">
      <button
        className="notification-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label={`${count} business notifications`}
        aria-expanded={open}
      >
        <TbBell aria-hidden="true" />
        {count > 0 && <span>{Math.min(count, 99)}</span>}
      </button>
      {open && (
        <section className="notification-panel">
          <header>
            <div>
              <strong>Notifications</strong>
              <small>Orders and inventory requiring attention</small>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
            >
              <TbX />
            </button>
          </header>
          <div>
            {pendingOrders.slice(0, 5).map((order) => (
              <Link
                key={order._id}
                to={`${base}/orders/${order._id}`}
                onClick={() => setOpen(false)}
              >
                <TbShoppingBag />
                <span>
                  <strong>New order #{order._id.slice(-8)}</strong>
                  <small>
                    {order.shippingDetails?.name} ·{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </small>
                </span>
              </Link>
            ))}
            {lowStock.slice(0, 5).map((product) => (
              <Link
                key={product._id}
                to={`${base}/products/${product._id}/edit`}
                onClick={() => setOpen(false)}
              >
                {product.stock === 0 ? <TbPackageOff /> : <TbBox />}
                <span>
                  <strong>
                    {product.stock === 0 ? "Out of stock" : "Low stock"}:{" "}
                    {product.name}
                  </strong>
                  <small>
                    {product.stock} item{product.stock === 1 ? "" : "s"}{" "}
                    remaining
                  </small>
                </span>
              </Link>
            ))}
            {!count && <p>No new items require your attention.</p>}
          </div>
          <footer>
            <Link to={`${base}/orders`} onClick={() => setOpen(false)}>
              View all orders
            </Link>
          </footer>
        </section>
      )}
    </div>
  );
}
