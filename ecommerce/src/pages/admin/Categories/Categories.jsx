import React from "react";
import { useCategoriesPage } from "../../../features/categories/hooks/useCategoriesPage";
import { QueryState } from "../../../components/common/QueryState";
import { Pagination } from "../../../components/common/Pagination";
import { errorMessage } from "../../../services/api";
import {
  TbCategory2,
  TbEdit,
  TbPlus,
  TbSearch,
  TbTrash,
} from "react-icons/tb";
export default function Categories() {
  const hook = useCategoriesPage();
  return (
    <>
      <div className="dashboard-header merchant-page-heading">
        <div>
          <h1>Categories</h1>
          <p>Organize your products into categories.</p>
        </div>
        <div className="admin-count-chip">
          <TbCategory2 /> {hook.query.data?.length || 0} Categories
        </div>
      </div>
      <form className="card category-form category-create-card" onSubmit={hook.submit}>
        <div className="category-create-heading">
          <span><TbPlus /></span>
          <div>
            <h2>{hook.editing ? "Update Category" : "Create New Category"}</h2>
            <p>Add a new category to organize your products</p>
          </div>
        </div>
        <label>
          Category Name
          <input
            required
            value={hook.name}
            onChange={(event) => hook.setName(event.target.value)}
            placeholder="e.g. Beauty, Electronics, Clothing..."
          />
        </label>
        <button className="btn-primary" disabled={hook.mutation.isPending}>
          <TbPlus aria-hidden="true" />
          {hook.editing ? "Update Category" : "Create Category"}
        </button>
        {hook.editing && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => hook.edit(null)}
          >
            Cancel
          </button>
        )}
      </form>
      {hook.mutation.isError && (
        <p className="error" role="alert">
          {errorMessage(hook.mutation.error)}
        </p>
      )}
      <QueryState query={hook.query}>
        <div className="card table-container admin-list-card">
          <div className="admin-list-heading">
            <h2>All Categories</h2>
            <label className="admin-search-box">
              <TbSearch aria-hidden="true" />
              <input
                value={hook.search}
                onChange={(event) => hook.setSearch(event.target.value)}
                placeholder="Search categories..."
              />
            </label>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hook.rows.map((category, index) => (
                <tr key={category._id}>
                  <td>{(hook.page - 1) * 10 + index + 1}</td>
                  <td><span className="category-name-cell"><TbCategory2 /> {category.name}</span></td>
                  <td>{category.slug}</td>
                  <td>
                    <div className="row">
                      <button
                        className="text-button"
                        onClick={() => hook.edit(category)}
                      >
                        <TbEdit /> Edit
                      </button>
                      <button
                        className="text-button danger"
                        disabled={hook.mutation.isPending}
                        onClick={() => {
                          if (window.confirm(`Delete ${category.name}?`))
                            hook.mutation.mutate({
                              method: "delete",
                              id: category._id,
                            });
                        }}
                      >
                        <TbTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!hook.rows.length && (
            <p className="state-card">No categories yet.</p>
          )}
        </div>
        <Pagination {...hook} />
      </QueryState>
    </>
  );
}
