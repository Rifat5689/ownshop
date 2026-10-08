import React from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../../../features/store/hooks/useCatalog";
import { QueryState } from "../../../components/common/QueryState";
export default function Categories() {
  const { categories, storeSlug } = useCatalog();
  return (
    <div className="shop-container">
      <h1>Shop by Category</h1>
      <QueryState query={categories} empty={categories.data?.length === 0}>
        <div className="category-grid">
          {categories.data?.map((category) => (
            <Link
              className="card"
              key={category._id}
              to={`/${storeSlug}/categories/${category.slug}`}
            >
              <span>◇</span>
              <h2>{category.name} →</h2>
            </Link>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
