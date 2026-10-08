import React, { useState } from "react";
import { useStoresPage } from "../../features/stores/hooks/useStoresPage";
import { QueryState } from "../../components/common/QueryState";
import { errorMessage } from "../../services/api";
function SubscriptionForm({ store, mutation, close }) {
  const [form, setForm] = useState({
    plan: store.plan,
    subscriptionStatus: store.subscriptionStatus || "ACTIVE",
    renewalDate: store.renewalDate?.slice(0, 10) || "",
  });
  return (
    <form
      className="card form-stack editor"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate(
          {
            method: "patch",
            id: store._id,
            data: { ...form, renewalDate: form.renewalDate || null },
          },
          { onSuccess: close },
        );
      }}
    >
      <h2>{store.name}</h2>
      <label>
        Plan
        <select
          value={form.plan}
          onChange={(event) => setForm({ ...form, plan: event.target.value })}
        >
          <option>Basic</option>
          <option>Premium</option>
        </select>
      </label>
      <label>
        Status
        <select
          value={form.subscriptionStatus}
          onChange={(event) =>
            setForm({ ...form, subscriptionStatus: event.target.value })
          }
        >
          <option>ACTIVE</option>
          <option>EXPIRED</option>
          <option>CANCELLED</option>
        </select>
      </label>
      <label>
        Renewal Date
        <input
          type="date"
          value={form.renewalDate}
          onChange={(event) =>
            setForm({ ...form, renewalDate: event.target.value })
          }
        />
      </label>
      {mutation.isError && (
        <p role="alert" className="error">
          {errorMessage(mutation.error)}
        </p>
      )}
      <div className="row">
        <button type="button" className="btn-secondary" onClick={close}>
          Cancel
        </button>
        <button className="btn-primary" disabled={mutation.isPending}>
          Save Subscription
        </button>
      </div>
    </form>
  );
}
export default function Subscriptions() {
  const hook = useStoresPage();
  const [selected, setSelected] = useState(null);
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Subscription Management</h1>
          <p>Manage store plans and renewal dates.</p>
        </div>
      </div>
      <QueryState query={hook.query}>
        {selected ? (
          <SubscriptionForm
            store={selected}
            mutation={hook.mutation}
            close={() => setSelected(null)}
          />
        ) : (
          <div className="card table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Renewal Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hook.query.data?.map((store) => (
                  <tr key={store._id}>
                    <td>{store.name}</td>
                    <td>{store.plan}</td>
                    <td>{store.subscriptionStatus}</td>
                    <td>
                      {store.renewalDate
                        ? new Date(store.renewalDate).toLocaleDateString()
                        : "Not scheduled"}
                    </td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => setSelected(store)}
                      >
                        Edit Subscription
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!hook.query.data?.length && (
              <p className="state-card">
                Create a store to manage its subscription.
              </p>
            )}
          </div>
        )}
      </QueryState>
    </>
  );
}
