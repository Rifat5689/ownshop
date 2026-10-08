import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAdminsPage } from "../../features/admins/hooks/useAdminsPage";
import { AdminEditor } from "../../features/admins/components/AdminEditor";
import { QueryState } from "../../components/common/QueryState";
import { Pagination } from "../../components/common/Pagination";
import { errorMessage } from "../../services/api";
export default function Admins() {
  const hook = useAdminsPage();
  const { id } = useParams();
  const { pathname } = useLocation();
  const editing = pathname.endsWith("/create") || pathname.endsWith("/edit");
  const admin = hook.query.data?.find((item) => item._id === id);
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Admin Management</h1>
          <p>Assign administrators to their stores.</p>
        </div>
        <Link className="btn-primary" to="/admins/create">
          + Create Admin
        </Link>
      </div>
      <QueryState query={hook.query}>
        {editing ? (
          id && (!admin || admin.role === "SUPER_ADMIN") ? (
            <div className="state-card">
              Administrator cannot be edited here.
            </div>
          ) : (
            <AdminEditor key={id || "new"} admin={admin} hook={hook} />
          )
        ) : id ? (
          admin ? (
            <section className="card form-stack">
              <h2>{admin.username}</h2>
              <p>{admin.email}</p>
              <p>
                {admin.role} · {admin.tenantId?.name || "Platform"}
              </p>
              {admin.role !== "SUPER_ADMIN" && (
                <Link className="btn-primary" to={`/admins/${id}/edit`}>
                  Edit Administrator
                </Link>
              )}
            </section>
          ) : (
            <div className="state-card">Administrator not found.</div>
          )
        ) : (
          <>
            <div className="filters">
              <label>
                Search
                <input
                  placeholder="Search admins..."
                  value={hook.search}
                  onChange={(event) => hook.setSearch(event.target.value)}
                />
              </label>
            </div>
            {hook.mutation.isError && (
              <p className="error" role="alert">
                {errorMessage(hook.mutation.error)}
              </p>
            )}
            <div className="card table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Store</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hook.rows.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <Link to={`/admins/${item._id}`}>{item.username}</Link>
                      </td>
                      <td>{item.email}</td>
                      <td>{item.role}</td>
                      <td>{item.tenantId?.name || "Platform"}</td>
                      <td>
                        <span
                          className={`status-badge ${item.isActive ? "status-active" : "status-inactive"}`}
                        >
                          {item.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        {item.role !== "SUPER_ADMIN" && (
                          <div className="row">
                            <Link to={`/admins/${item._id}/edit`}>Edit</Link>
                            <button
                              className="text-button danger"
                              disabled={hook.mutation.isPending}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `${item.isActive ? "Disable" : "Enable"} ${item.username}?`,
                                  )
                                )
                                  hook.mutation.mutate({
                                    method: "patch",
                                    id: item._id,
                                    data: { isActive: !item.isActive },
                                  });
                              }}
                            >
                              {item.isActive ? "Disable" : "Enable"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!hook.rows.length && (
                <p className="state-card">No administrators found.</p>
              )}
            </div>
            <Pagination {...hook} />
          </>
        )}
      </QueryState>
    </>
  );
}
