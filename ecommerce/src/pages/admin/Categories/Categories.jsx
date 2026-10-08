import React from "react";
import { useCategoriesPage } from "../../../features/categories/hooks/useCategoriesPage";
import { QueryState } from "../../../components/common/QueryState";
import { Pagination } from "../../../components/common/Pagination";
import { errorMessage } from "../../../services/api";
export default function Categories() {
  const hook = useCategoriesPage();
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Categories</h1>
          <p>Organise your product catalog.</p>
        </div>
      </div>
      <form className="card row category-form" onSubmit={hook.submit}>
        <label>
          Category Name
          <input
            required
            value={hook.name}
            onChange={(event) => hook.setName(event.target.value)}
          />
        </label>
        <button className="btn-primary" disabled={hook.mutation.isPending}>
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
        <div className="card table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hook.rows.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>
                    <div className="row">
                      <button
                        className="text-button"
                        onClick={() => hook.edit(category)}
                      >
                        Edit
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
                        Delete
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
