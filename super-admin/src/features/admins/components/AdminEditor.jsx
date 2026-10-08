import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errorMessage } from "../../../services/api";
export function AdminEditor({ admin, hook }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: admin?.username || "",
    email: admin?.email || "",
    password: "",
    tenantId: admin?.tenantId?._id || "",
    role: admin?.role === "ECO" ? "ECO" : "ADMIN",
  });
  const change = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <form
      className="card editor form-stack"
      onSubmit={(event) => {
        event.preventDefault();
        hook.mutation.mutate(
          { method: admin ? "patch" : "post", id: admin?._id, data: form },
          { onSuccess: () => navigate("/admins") },
        );
      }}
    >
      <h2>{admin ? "Edit Administrator" : "Create Administrator"}</h2>
      <label>
        Name
        <input
          required
          value={form.username}
          onChange={(event) => change("username", event.target.value)}
        />
      </label>
      <label>
        Email
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) => change("email", event.target.value)}
        />
      </label>
      <label>
        Role
        <select
          value={form.role}
          onChange={(event) => change("role", event.target.value)}
        >
          <option value="ADMIN">Store Admin</option>
          <option value="ECO">Store Staff</option>
        </select>
      </label>
      <label>
        Assigned Store
        <select
          required
          value={form.tenantId}
          onChange={(event) => change("tenantId", event.target.value)}
        >
          <option value="">Select Store</option>
          {hook.stores.data?.map((store) => (
            <option key={store._id} value={store._id}>
              {store.name}
            </option>
          ))}
        </select>
      </label>
      {(
        <label>
          {admin ? "New Password (leave blank to keep current)" : "Password"}
          <input
            required={!admin}
            type="password"
            minLength={6}
            maxLength={6}
            pattern="[0-9]{6}"
            inputMode="numeric"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => change("password", event.target.value)}
          />
        </label>
      )}
      {hook.mutation.isError && (
        <p className="error" role="alert">
          {errorMessage(hook.mutation.error)}
        </p>
      )}
      <div className="row">
        <Link className="btn-secondary" to="/admins">
          Cancel
        </Link>
        <button className="btn-primary" disabled={hook.mutation.isPending}>
          {hook.mutation.isPending ? "Saving..." : "Save Administrator"}
        </button>
      </div>
    </form>
  );
}
