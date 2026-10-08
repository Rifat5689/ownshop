import React from "react";
import { Link, useParams } from "react-router-dom";
import { useManagementPage } from "../../../features/management/hooks/useManagementPage";
import { QueryState, money } from "../../../components/common/QueryState";
import { Pagination } from "../../../components/common/Pagination";
export default function Customers() {
  const hook = useManagementPage("customers", "/orders/customers");
  const { id } = useParams();
  const customer = hook.query.data?.find((item) => item._id === id);
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Customers</h1>
          <p>Customers who placed orders in your store.</p>
        </div>
      </div>
      <QueryState query={hook.query}>
        {id ? (
          customer ? (
            <section className="card form-stack">
              <Link to="/admin/customers">← Back to Customers</Link>
              <h2>{customer.name}</h2>
              <p>Phone: {customer._id}</p>
              <p>{customer.address}</p>
              <p>
                {customer.orders} orders · {money(customer.total)} ordered
              </p>
            </section>
          ) : (
            <p className="state-card">Customer not found.</p>
          )
        ) : (
          <>
            <div className="filters">
              <label>
                Search
                <input
                  value={hook.search}
                  onChange={(event) => hook.setSearch(event.target.value)}
                  placeholder="Search customers..."
                />
              </label>
            </div>
            <div className="card table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Orders</th>
                    <th>Total Ordered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hook.rows.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item._id}</td>
                      <td>{item.orders}</td>
                      <td>{money(item.total)}</td>
                      <td>
                        <Link
                          to={`/admin/customers/${encodeURIComponent(item._id)}`}
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!hook.rows.length && (
                <p className="state-card">No customers yet.</p>
              )}
            </div>
            <Pagination {...hook} />
          </>
        )}
      </QueryState>
    </>
  );
}
