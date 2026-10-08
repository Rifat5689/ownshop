import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useStoresPage } from "../../features/stores/hooks/useStoresPage";
import { StoreEditor } from "../../features/stores/components/StoreEditor";
import { QueryState } from "../../components/common/QueryState";
import { Pagination } from "../../components/common/Pagination";
import { errorMessage } from "../../services/api";
export default function Stores() {
  const hook = useStoresPage();
  const { id } = useParams();
  const { pathname } = useLocation();
  const editing = pathname.endsWith("/create") || pathname.endsWith("/edit");
  const store = hook.query.data?.find((item) => item._id === id);
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Store Management</h1>
          <p>Manage your platform stores.</p>
        </div>
        <Link className="btn-primary" to="/stores/create">
          + Create Store
        </Link>
      </div>
      <QueryState query={hook.query}>
        {editing ? (
          id && !store ? (
            <div className="state-card">Store not found.</div>
          ) : (
            <StoreEditor
              key={id || "new"}
              store={store}
              mutation={hook.mutation}
            />
          )
        ) : id ? (
          store ? (
            <section className="card form-stack">
              <h2>{store.name}</h2>
              <dl>
                <dt>Slug</dt>
                <dd>{store.slug}</dd>
                <dt>Plan</dt>
                <dd>{store.plan}</dd>
                <dt>Status</dt>
                <dd>{store.status}</dd>
                <dt>Created</dt>
                <dd>{new Date(store.createdAt).toLocaleDateString()}</dd>
              </dl>
              <p>{store.description}</p>
              <div className="row">
                <Link className="btn-primary" to={`/stores/${id}/edit`}>
                  Edit Store
                </Link>
                <a
                  className="btn-secondary"
                  target="_blank"
                  rel="noreferrer"
                  href={`${import.meta.env.VITE_STOREFRONT_URL || "https://ornionshop.web.app"}/${store.slug}`}
                >
                  Visit Store →
                </a>
              </div>
            </section>
          ) : (
            <div className="state-card">Store not found.</div>
          )
        ) : (
          <>
            <div className="filters">
              <label>
                Search
                <input
                  value={hook.search}
                  onChange={(event) => hook.setSearch(event.target.value)}
                  placeholder="Search stores..."
                />
              </label>
              <label>
                Status
                <select
                  value={hook.status}
                  onChange={(event) => hook.setStatus(event.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option>ACTIVE</option>
                  <option>INACTIVE</option>
                  <option>SUSPENDED</option>
                </select>
              </label>
            </div>
            {hook.mutation.isError && (
              <p role="alert" className="error">
                {errorMessage(hook.mutation.error)}
              </p>
            )}
            <div className="card table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Slug</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hook.rows.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <Link to={`/stores/${item._id}`}>{item.name}</Link>
                      </td>
                      <td>{item.slug}</td>
                      <td>{item.plan}</td>
                      <td>
                        <span
                          className={`status-badge status-${item.status.toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="row">
                          <Link to={`/stores/${item._id}/edit`}>Edit</Link>
                          <button
                            className="text-button danger"
                            disabled={hook.mutation.isPending}
                            onClick={() => {
                              const next =
                                item.status === "ACTIVE"
                                  ? "INACTIVE"
                                  : "ACTIVE";
                              if (
                                window.confirm(
                                  `${next === "ACTIVE" ? "Activate" : "Disable"} ${item.name}?`,
                                )
                              )
                                hook.mutation.mutate({
                                  method: "patch",
                                  id: item._id,
                                  data: { status: next },
                                });
                            }}
                          >
                            {item.status === "ACTIVE" ? "Disable" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!hook.rows.length && (
                <p className="state-card">No stores found.</p>
              )}
            </div>
            <Pagination {...hook} />
          </>
        )}
      </QueryState>
    </>
  );
}
