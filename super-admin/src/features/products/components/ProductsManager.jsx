import React, { useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useProductsPage } from "../hooks/useProductsPage";
import { QueryState, money } from "../../../components/common/QueryState";
import { Pagination } from "../../../components/common/Pagination";
import { errorMessage } from "../../../services/api";
import { useProductImages } from "../hooks/useProductImages";
export function ProductEditor({ product, hook, base }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price ?? "",
    stock: product?.stock ?? 0,
    discount: product?.discount ?? 0,
    category: product?.category?._id || "",
    tenantId: product?.tenantId || hook.stores.data?.[0]?._id || "",
    imageUrls: (product?.images || []).map((image) => image.url).join("\n"),
    isActive: product?.isActive ?? true,
  });
  const upload = useProductImages(form.tenantId, hook.platform);
  const [uploadedImages, setUploadedImages] = useState([]);
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const data = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      discount: Number(form.discount),
      images: form.imageUrls
        .split(/\r?\n/)
        .map((url) => url.trim())
        .filter(Boolean)
        .map(
          (url) =>
            [...(product?.images || []), ...uploadedImages].find(
              (image) => image.url === url,
            ) || { url },
        ),
    };
    delete data.imageUrls;
    if (!hook.platform) delete data.tenantId;
    hook.mutation.mutate(
      { method: product ? "patch" : "post", id: product?._id, data },
      { onSuccess: () => navigate(base) },
    );
  };
  return (
    <form className="card form-stack editor" onSubmit={submit}>
      <h2>{product ? "Edit Product" : "Create Product"}</h2>
      {hook.platform && (
        <label>
          Store
          <select
            required
            disabled={!!product}
            value={form.tenantId}
            onChange={(event) => set("tenantId", event.target.value)}
          >
            <option value="">Select Store</option>
            {hook.stores.data?.map((store) => (
              <option key={store._id} value={store._id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Product Name
        <input
          required
          value={form.name}
          onChange={(event) => set("name", event.target.value)}
        />
      </label>
      <label>
        Description
        <textarea
          value={form.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </label>
      <div className="form-grid">
        {["price", "stock", "discount"].map((field) => (
          <label key={field}>
            {field === "price"
              ? "Price (BDT)"
              : field === "stock"
                ? "Stock"
                : "Discount (%)"}
            <input
              type="number"
              min="0"
              max={field === "discount" ? 100 : undefined}
              step={field === "price" ? "0.01" : "1"}
              required
              value={form[field]}
              onChange={(event) => set(field, event.target.value)}
            />
          </label>
        ))}
      </div>
      {!hook.platform && (
        <label>
          Category
          <select
            value={form.category}
            onChange={(event) => set("category", event.target.value)}
          >
            <option value="">No Category</option>
            {hook.categories.data?.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Image URLs (one per line)
        <textarea
          placeholder="https://..."
          value={form.imageUrls}
          onChange={(event) => set("imageUrls", event.target.value)}
        />
      </label>
      <label>
        Upload Photos (JPEG, PNG or WebP; up to 5 MB each)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={upload.isPending || (hook.platform && !form.tenantId)}
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            if (files.length)
              upload.mutate(files, {
                onSuccess: (images) => {
                  setUploadedImages((current) => [...current, ...images]);
                  setForm((current) => ({
                    ...current,
                    imageUrls: [
                      current.imageUrls,
                      ...images.map((image) => image.url),
                    ]
                      .filter(Boolean)
                      .join("\n"),
                  }));
                },
              });
            event.target.value = "";
          }}
        />
      </label>
      {upload.isPending && <p role="status">Uploading photos...</p>}
      {upload.isError && (
        <p role="alert" className="error">
          {errorMessage(upload.error)}
        </p>
      )}
      <label className="row">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => set("isActive", event.target.checked)}
        />{" "}
        Published
      </label>
      {hook.mutation.isError && (
        <p role="alert" className="error">
          {errorMessage(hook.mutation.error)}
        </p>
      )}
      <div className="row">
        <Link className="btn-secondary" to={base}>
          Cancel
        </Link>
        <button
          className="btn-primary"
          disabled={hook.mutation.isPending || upload.isPending}
        >
          {hook.mutation.isPending ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
export function ProductsManager({ base = "/admin/products" }) {
  const hook = useProductsPage();
  const { id } = useParams();
  const { pathname } = useLocation();
  const editing = pathname.endsWith("/create") || pathname.endsWith("/edit");
  const product = hook.query.data?.find((item) => item._id === id);
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Products Management</h1>
          <p>Manage inventory, pricing and availability.</p>
        </div>
        {!editing && (
          <Link className="btn-primary" to={`${base}/create`}>
            + Add Product
          </Link>
        )}
      </div>
      <QueryState query={hook.query}>
        {editing ? (
          id && !product ? (
            <div className="state-card">Product not found.</div>
          ) : (
            <ProductEditor
              key={id || "new"}
              product={product}
              hook={hook}
              base={base}
            />
          )
        ) : (
          <>
            <div className="filters">
              <label>
                Search
                <input
                  placeholder="Search products..."
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
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hook.rows.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="row">
                          {item.images?.[0]?.url && (
                            <img
                              className="table-image"
                              src={item.images[0].url}
                              alt=""
                            />
                          )}
                          {item.name}
                        </div>
                      </td>
                      <td>{money(item.price)}</td>
                      <td>{item.stock}</td>
                      <td>
                        <span
                          className={`status-badge ${item.isActive ? "status-active" : "status-inactive"}`}
                        >
                          {item.isActive ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <div className="row">
                          <Link
                            aria-label={`Edit ${item.name}`}
                            to={`${base}/${item._id}/edit`}
                          >
                            Edit
                          </Link>
                          <button
                            className="text-button danger"
                            disabled={hook.mutation.isPending}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Delete ${item.name}? This cannot be undone.`,
                                )
                              )
                                hook.mutation.mutate({
                                  method: "delete",
                                  id: item._id,
                                  data: hook.platform
                                    ? { tenantId: item.tenantId }
                                    : undefined,
                                });
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!hook.rows.length && (
                <p className="state-card">No products found.</p>
              )}
            </div>
            <Pagination {...hook} />
          </>
        )}
      </QueryState>
    </>
  );
}
