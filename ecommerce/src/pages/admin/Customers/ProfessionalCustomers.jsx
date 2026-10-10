import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TbPhone,
  TbSearch,
  TbShoppingBag,
  TbUserCheck,
  TbUsers,
} from "react-icons/tb";
import { request } from "../../../services/api";
import { QueryState, money } from "../../../components/common/QueryState";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

export default function ProfessionalCustomers() {
  const [tab, setTab] = useState("ordered");
  const [search, setSearch] = useState("");
  const ordered = useQuery({
    queryKey: ["customers", "ordered"],
    queryFn: () => request("get", "/orders/customers"),
  });
  const signed = useQuery({
    queryKey: ["customers", "signed"],
    queryFn: () => request("get", "/customers/signed"),
  });
  const query = tab === "ordered" ? ordered : signed;
  const rows = (query.data || []).filter((item) =>
    [item.name, item.username, item._id]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase()),
      ),
  );
  return (
    <>
      <div className="dashboard-header merchant-page-heading">
        <div>
          <h1>Customers</h1>
          <p>
            View customers identified by an order or by signing in to this
            store.
          </p>
        </div>
      </div>
      <div className="customer-tabs" role="tablist" aria-label="Customer type">
        <button
          className={tab === "ordered" ? "active" : ""}
          onClick={() => setTab("ordered")}
        >
          <TbShoppingBag />
          Ordered customers <span>{ordered.data?.length || 0}</span>
        </button>
        <button
          className={tab === "signed" ? "active" : ""}
          onClick={() => setTab("signed")}
        >
          <TbUserCheck />
          Signed-in customers <span>{signed.data?.length || 0}</span>
        </button>
      </div>
      <div className="filters admin-filter-bar">
        <label className="admin-search-box">
          <TbSearch aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              tab === "ordered"
                ? "Search name or phone..."
                : "Search username..."
            }
          />
        </label>
      </div>
      {query.isPending ? (
        <LoadingSpinner label="Loading customers..." />
      ) : (
        <QueryState query={query} empty={!rows.length}>
          <div className="card table-container admin-list-card customer-list-card">
            <table className="table">
              <thead>
                {tab === "ordered" ? (
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Orders</th>
                    <th>Total Ordered</th>
                    <th>Last Address</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Username</th>
                    <th>First Signed In</th>
                    <th>Last Seen</th>
                    <th>Identity</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {rows.map((item) =>
                  tab === "ordered" ? (
                    <tr key={item._id}>
                      <td>
                        <span className="customer-name">
                          <TbUsers />
                          {item.name}
                          {item.username && <small>@{item.username}</small>}
                        </span>
                      </td>
                      <td>
                        <span className="customer-phone">
                          <TbPhone />
                          {item._id}
                        </span>
                      </td>
                      <td>{item.orders}</td>
                      <td>{money(item.total)}</td>
                      <td>{item.address}</td>
                    </tr>
                  ) : (
                    <tr key={item._id}>
                      <td>
                        <span className="customer-name">
                          <TbUserCheck />
                          {item.username}
                        </span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(item.lastSeenAt).toLocaleString()}</td>
                      <td>
                        <span className="status-badge status-active">
                          Browser sign-in
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </QueryState>
      )}
    </>
  );
}
