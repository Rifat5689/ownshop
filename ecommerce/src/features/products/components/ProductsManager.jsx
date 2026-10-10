import React, { useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useProductsPage } from "../hooks/useProductsPage";
import { QueryState, money } from "../../../components/common/QueryState";
import { Pagination } from "../../../components/common/Pagination";
import { errorMessage } from "../../../services/api";
import { useProductImages } from "../hooks/useProductImages";
import StructuredDescriptionEditor, {
  normalizeSections,
} from "./StructuredDescriptionEditor";
import { TbEdit, TbPhotoPlus, TbPlus, TbTrash } from "react-icons/tb";
export function ProductEditor({ product, hook, base }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: product?.name || "",
    title: product?.title || "",
    subtitle: product?.subtitle || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    descriptionSections: normalizeSections(product?.descriptionSections),
    price: product?.price ?? "",
    stock: product?.stock ?? 0,
    discount: product?.discount ?? 0,
    category: product?.category?._id || "",
    tenantId: product?.tenantId || hook.stores.data?.[0]?._id || "",
    images: product?.images || [],
    isActive: product?.isActive ?? true,
  });
  const upload = useProductImages(form.tenantId, hook.platform);
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const data = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      discount: Number(form.discount),
      descriptionSections: form.descriptionSections.map((section) => ({
        ...section,
        title: section.title.trim(),
        content: section.content.trim(),
        items: section.items.map((item) => item.trim()).filter(Boolean),
        rows: section.rows
          .map((row) => ({ label: row.label.trim(), value: row.value.trim() }))
          .filter((row) => row.label || row.value),
      })),
    };
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
        Storefront title
        <input
          value={form.title}
          onChange={(event) => set("title", event.target.value)}
          placeholder="Optional display title; product name is used by default"
        />
      </label>
      <label>
        Subtitle
        <input
          value={form.subtitle}
          onChange={(event) => set("subtitle", event.target.value)}
          placeholder="A short supporting line"
        />
      </label>
      <label>
        Short summary
        <textarea
          value={form.shortDescription}
          onChange={(event) => set("shortDescription", event.target.value)}
          placeholder="One or two sentences shown beside the product image"
        />
      </label>
      <label>
        Product overview
        <textarea
          value={form.description}
          onChange={(event) => set("description", event.target.value)}
          placeholder="A clear general description of the product"
        />
      </label>
      <StructuredDescriptionEditor
        value={form.descriptionSections}
        onChange={(sections) => set("descriptionSections", sections)}
      />
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
      <label className="product-upload">
        <span>
          <TbPhotoPlus aria-hidden="true" /> Product photos
        </span>
        <small>
          Upload JPEG, PNG or WebP files, up to 5 MB each. The first image is
          the primary image.
        </small>
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
                  setForm((current) => ({
                    ...current,
                    images: [...current.images, ...images],
                  }));
                },
              });
            event.target.value = "";
          }}
        />
      </label>
      {!!form.images.length && (
        <div className="product-image-editor">
          {form.images.map((image, index) => (
            <div key={image.public_id || image.url}>
              <img src={image.url} alt="" />
              {index === 0 && <span>Primary</span>}
              <button
                type="button"
                aria-label={`Remove image ${index + 1}`}
                onClick={() =>
                  set(
                    "images",
                    form.images.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <TbTrash />
              </button>
            </div>
          ))}
        </div>
      )}
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
          <div className="row">
            {!!hook.query.data?.length && !hook.platform && (
              <button
                type="button"
                className="btn-secondary danger"
                disabled={hook.mutation.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete all ${hook.query.data.length} products and their uploaded images? This cannot be undone.`,
                    )
                  )
                    hook.mutation.mutate({ method: "delete" });
                }}
              >
                <TbTrash aria-hidden="true" /> Delete all products
              </button>
            )}
            <Link className="btn-primary" to={`${base}/create`}>
              <TbPlus aria-hidden="true" /> Add Product
            </Link>
          </div>
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
                            <TbEdit aria-hidden="true" /> Edit
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
                            <TbTrash aria-hidden="true" /> Delete
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
