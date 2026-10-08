import React from "react";
import { useSettingsPage } from "../hooks/useSettingsPage";
import { QueryState } from "../../../components/common/QueryState";
import { errorMessage } from "../../../services/api";
export function SettingsView({ platform = false }) {
  const hook = useSettingsPage(platform);
  const fields = platform
    ? [
        ["name", "Platform Name"],
        ["supportEmail", "Support Email"],
        ["timezone", "Timezone"],
      ]
    : [
        ["name", "Store Name"],
        ["description", "Description"],
        ["supportEmail", "Support Email"],
        ["shippingFee", "Shipping Fee (BDT)"],
      ];
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>{platform ? "Platform" : "Store"} Settings</h1>
          <p>Configure your business information.</p>
        </div>
      </div>
      <QueryState query={hook.query}>
        <form
          className="card form-stack editor"
          onSubmit={(event) => {
            event.preventDefault();
            hook.mutation.mutate();
          }}
        >
          <h2>General Settings</h2>
          {fields.map(([field, label]) => (
            <label key={field}>
              {label}
              <input
                required={field === "name"}
                type={
                  field === "supportEmail"
                    ? "email"
                    : field === "shippingFee"
                      ? "number"
                      : "text"
                }
                min={field === "shippingFee" ? 0 : undefined}
                step={field === "shippingFee" ? "0.01" : undefined}
                value={hook.form[field] ?? ""}
                onChange={(event) =>
                  hook.setForm({ ...hook.form, [field]: event.target.value })
                }
              />
            </label>
          ))}
          <label>
            Currency
            <input value="BDT — Bangladeshi Taka" readOnly />
          </label>
          {hook.mutation.isError && (
            <p className="error" role="alert">
              {errorMessage(hook.mutation.error)}
            </p>
          )}
          {hook.saved && (
            <p role="status" className="stock-label">
              Settings saved.
            </p>
          )}
          <button className="btn-primary" disabled={hook.mutation.isPending}>
            {hook.mutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </QueryState>
    </>
  );
}
