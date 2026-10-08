import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errorMessage } from "../../../services/api";
export function StoreEditor({ store, mutation }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: store?.name || "",
    slug: store?.slug || "",
    description: store?.description || "",
    plan: store?.plan || "Basic",
    status: store?.status || "ACTIVE",
  });
  const change = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  return (
    <form
      className="card form-stack editor"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(
          { method: store ? "patch" : "post", id: store?._id, data: form },
          { onSuccess: () => navigate("/stores") },
        );
      }}
    >
      <h2>{store ? "Edit Store" : "Create Store"}</h2>
      <label>
        Store Name
        <input
          required
          value={form.name}
          onChange={(event) => change("name", event.target.value)}
        />
      </label>
      <label>
        Store Slug
        <input
          required
          disabled={!!store}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          placeholder="rifat-fashion"
          value={form.slug}
          onChange={(event) => change("slug", event.target.value)}
        />
      </label>
      <label>
        Plan
        <select
          value={form.plan}
          onChange={(event) => change("plan", event.target.value)}
        >
          <option>Basic</option>
          <option>Premium</option>
        </select>
      </label>
      <label>
        Description
        <textarea
          value={form.description}
          onChange={(event) => change("description", event.target.value)}
        />
      </label>
      {store && (
        <label>
          Status
          <select
            value={form.status}
            onChange={(event) => change("status", event.target.value)}
          >
            <option>ACTIVE</option>
            <option>INACTIVE</option>
            <option>SUSPENDED</option>
          </select>
        </label>
      )}
      {mutation.isError && (
        <p className="error" role="alert">
          {errorMessage(mutation.error)}
        </p>
      )}
      <div className="row">
        <Link className="btn-secondary" to="/stores">
          Cancel
        </Link>
        <button className="btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Store"}
        </button>
      </div>
    </form>
  );
}
