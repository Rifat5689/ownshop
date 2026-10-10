import React, { useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useCatalog } from "../../../features/store/hooks/useCatalog";
import { ProductCard } from "../../../features/store/components/ProductCard";
import { QueryState } from "../../../components/common/QueryState";
import { priceOf } from "../../../features/cart/utils/cartStorage";
export default function Products() {
  const { products, categories, storeSlug } = useCatalog();
  const { categorySlug } = useParams();
  const [params, setParams] = useSearchParams();
  const gridTopRef = useRef(null);
  const change = (key, value) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      return next;
    });
  const search = params.get("q") || "";
  const category = categorySlug || params.get("category") || "";
  const sort = params.get("sort") || "newest";
  const filtered = (products.data || []).filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (!category || product.category?.slug === category),
  );
  if (sort === "price-low") filtered.sort((a, b) => priceOf(a) - priceOf(b));
  if (sort === "price-high") filtered.sort((a, b) => priceOf(b) - priceOf(a));
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  const page = Math.max(
    1,
    Math.min(
      Math.ceil(filtered.length / 12) || 1,
      Number(params.get("page")) || 1,
    ),
  );
  useEffect(() => {
    if (!products.isPending) {
      gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page, products.isPending]);
  return (
    <div className="shop-container">
      <p className="breadcrumb">
        <Link to={`/${storeSlug}`}>Home</Link> / Products
      </p>
      <div className="section-heading">
        <h1>
          {category
            ? categories.data?.find((item) => item.slug === category)?.name ||
              "Category Products"
            : "All Products"}
        </h1>
        <span>{filtered.length} products</span>
      </div>
      <div className="filters">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => change("q", event.target.value)}
            placeholder="Search products"
          />
        </label>
        {!categorySlug && (
          <label>
            Category
            <select
              value={category}
              onChange={(event) => change("category", event.target.value)}
            >
              <option value="">All Categories</option>
              {categories.data?.map((item) => (
                <option value={item.slug} key={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Sort by
          <select
            value={sort}
            onChange={(event) => change("sort", event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
      <div ref={gridTopRef} className="ob-product-grid-top" />
      <QueryState query={products} empty={!filtered.length}>
        <div className="product-grid">
          {filtered.slice((page - 1) * 12, page * 12).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </QueryState>
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() =>
            setParams((current) => {
              const next = new URLSearchParams(current);
              next.set("page", page - 1);
              return next;
            })
          }
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.max(1, Math.ceil(filtered.length / 12))}
        </span>
        <button
          disabled={page * 12 >= filtered.length}
          onClick={() =>
            setParams((current) => {
              const next = new URLSearchParams(current);
              next.set("page", page + 1);
              return next;
            })
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}
