import React from "react";
import { errorMessage } from "../../services/api";
export function QueryState({ query, children, empty = false }) {
  if (query.isPending)
    return (
      <div className="state-card" role="status">
        <span className="spinner" />
        Loading...
      </div>
    );
  if (query.isError)
    return (
      <div className="state-card" role="alert">
        <h2>Unable to load this page</h2>
        <p>{errorMessage(query.error)}</p>
        <button className="btn-primary" onClick={() => query.refetch()}>
          Retry
        </button>
      </div>
    );
  if (empty)
    return (
      <div className="state-card">
        <h2>No results found</h2>
        <p>Try changing your search or filters.</p>
      </div>
    );
  return children;
}
export const money = (value) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(
    value || 0,
  );
