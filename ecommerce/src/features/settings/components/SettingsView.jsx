import React from "react";
import { useSettingsPage } from "../hooks/useSettingsPage";
import { QueryState } from "../../../components/common/QueryState";
import { errorMessage } from "../../../services/api";
import { TbBrandWhatsapp, TbPhotoPlus } from "react-icons/tb";
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
        ["whatsappNumber", "WhatsApp Number"],
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
          {!platform && (
            <div className="store-profile-setting">
              {hook.form.profileImage?.url ? (
                <img
                  src={hook.form.profileImage.url}
                  alt="Current store profile"
                />
              ) : (
                <div>
                  <TbPhotoPlus aria-hidden="true" />
                </div>
              )}
              <label>
                Store profile image
                <small>JPEG, PNG or WebP, up to 5 MB.</small>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={hook.imageUpload.isPending}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) hook.imageUpload.mutate(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
          )}
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
          {!platform && (
            <>
              <div className="form-grid">
                <label>
                  Inside Dhaka Shipping (BDT)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={hook.form.shippingFees?.insideDhaka ?? ""}
                    onChange={(event) =>
                      hook.setForm({
                        ...hook.form,
                        shippingFees: {
                          ...hook.form.shippingFees,
                          insideDhaka: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Outside Dhaka Shipping (BDT)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={hook.form.shippingFees?.outsideDhaka ?? ""}
                    onChange={(event) =>
                      hook.setForm({
                        ...hook.form,
                        shippingFees: {
                          ...hook.form.shippingFees,
                          outsideDhaka: event.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>
              <label className="row">
                <input
                  type="checkbox"
                  checked={hook.form.showShippingFees !== false}
                  onChange={(event) =>
                    hook.setForm({
                      ...hook.form,
                      showShippingFees: event.target.checked,
                    })
                  }
                />
                Show delivery fees and WhatsApp contact on the storefront
              </label>
              {hook.form.whatsappNumber && (
                <p className="muted">
                  <TbBrandWhatsapp aria-hidden="true" /> Customers will see this
                  contact number.
                </p>
              )}
            </>
          )}
          {(hook.imageUpload?.isError || hook.imageError) && (
            <p className="error" role="alert">
              {hook.imageError || errorMessage(hook.imageUpload.error)}
            </p>
          )}
          {hook.imageUpload?.isPending && (
            <p role="status">
              <span className="spinner" /> Uploading store image...
            </p>
          )}
          {hook.imageUpload?.isSuccess && (
            <p role="status" className="stock-label">
              Store profile image updated.
            </p>
          )}
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
