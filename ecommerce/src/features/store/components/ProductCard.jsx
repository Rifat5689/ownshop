import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../../app/providers/StoreProvider";
import { useCart } from "../../cart/CartProvider";
import { priceOf } from "../../cart/utils/cartStorage";
import { money } from "../../../components/common/QueryState";
export function ProductImage({ product, ...props }) {
  const url = product.images?.[0]?.url;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [url]);
  return url && !failed ? (
    <img
      src={product.images[0].url}
      alt={product.name}
      loading="lazy"
      onError={() => setFailed(true)}
      {...props}
    />
  ) : (
    <div
      className="image-placeholder"
      role="img"
      aria-label={`${product.name}: no image`}
    >
      ◇
    </div>
  );
}
export function ProductCard({ product }) {
  const { storeSlug } = useStore();
  const { add, toggleWishlist, wishlist } = useCart();
  const saved = wishlist.some((item) => item._id === product._id);
  return (
    <article className="product-card">
      <Link
        className="product-image"
        to={`/${storeSlug}/products/${product.slug}`}
      >
        <ProductImage product={product} />
        {product.discount > 0 && (
          <span className="discount">-{product.discount}%</span>
        )}
      </Link>
      <div className="product-info">
        <Link to={`/${storeSlug}/products/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <strong>{money(priceOf(product))}</strong>
        {product.discount > 0 && <del>{money(product.price)}</del>}
        <p className="muted">{product.stock > 0 ? "In stock" : "Sold out"}</p>
        <div className="row">
          <button
            className="btn-primary"
            disabled={product.stock < 1}
            onClick={() => add(product)}
          >
            Add to Cart
          </button>
          <button
            className="icon-btn"
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={saved}
            onClick={() => toggleWishlist(product)}
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </article>
  );
}
