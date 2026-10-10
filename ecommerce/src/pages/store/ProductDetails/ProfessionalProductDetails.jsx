import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  TbCash,
  TbChevronRight,
  TbHeart,
  TbPackage,
  TbShieldCheck,
  TbShoppingBag,
  TbTruckDelivery,
} from "react-icons/tb";
import { request } from "../../../services/api";
import { useStore } from "../../../app/providers/StoreProvider";
import { useCart } from "../../../features/cart/CartProvider";
import { priceOf } from "../../../features/cart/utils/cartStorage";
import { ProductImage } from "../../../features/store/components/ProductCard";
import { QueryState, money } from "../../../components/common/QueryState";
import { PageMetadata } from "../../../components/common/PageMetadata";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

function DescriptionSection({ section }) {
  if (["text", "usage", "ingredients"].includes(section.type))
    return <p>{section.content}</p>;
  if (["bullets", "highlights"].includes(section.type))
    return (
      <ul className={section.type === "highlights" ? "ob-highlight-list" : ""}>
        {section.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  if (section.type === "table")
    return (
      <div className="ob-specification-table">
        {section.rows.map((row, index) => (
          <div key={index}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    );
  if (section.type === "faq")
    return (
      <div className="ob-faq-list">
        {section.rows.map((row, index) => (
          <details key={index}>
            <summary>{row.label}</summary>
            <p>{row.value}</p>
          </details>
        ))}
      </div>
    );
  return null;
}

export default function ProfessionalProductDetails() {
  const { productSlug } = useParams();
  const { storeSlug, store } = useStore();
  const { add, toggleWishlist, wishlist } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const query = useQuery({
    queryKey: ["product", storeSlug, productSlug],
    queryFn: () =>
      request("get", `/products/store/${storeSlug}/${productSlug}`),
  });
  const product = query.data;
  const saved = product
    ? wishlist.some((item) => item._id === product._id)
    : false;

  if (query.isPending)
    return (
      <div className="ob-product-loading">
        <LoadingSpinner label="Loading product details..." />
      </div>
    );

  return (
    <div className="shop-container ob-product-page">
      <PageMetadata
        title={
          product
            ? `${product.title || product.name} | ${store?.name || storeSlug}`
            : undefined
        }
        description={String(
          product?.shortDescription || product?.description || "",
        ).slice(0, 200)}
        image={product?.images?.[0]?.url}
      />
      <QueryState query={query}>
        {product && (
          <>
            <nav className="ob-product-breadcrumb" aria-label="Breadcrumb">
              <Link to={`/${storeSlug}`}>Home</Link>
              <TbChevronRight aria-hidden="true" />
              <Link to={`/${storeSlug}/products`}>Products</Link>
              <TbChevronRight aria-hidden="true" />
              <span>{product.name}</span>
            </nav>

            <div className="ob-product-main">
              <section className="ob-gallery" aria-label="Product images">
                <div className="ob-main-image">
                  <ProductImage
                    product={{
                      ...product,
                      images: product.images?.[imageIndex]
                        ? [product.images[imageIndex]]
                        : product.images,
                    }}
                  />
                  {product.discount > 0 && (
                    <span className="ob-detail-discount">
                      Save {product.discount}%
                    </span>
                  )}
                </div>
                {product.images?.length > 1 && (
                  <div className="ob-thumbnails">
                    {product.images.map((image, index) => (
                      <button
                        className={imageIndex === index ? "active" : ""}
                        key={image.url}
                        onClick={() => setImageIndex(index)}
                        aria-label={`View image ${index + 1}`}
                        aria-pressed={imageIndex === index}
                      >
                        <img src={image.url} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="ob-product-summary">
                <p className="ob-product-category">
                  {product.category?.name || "Beauty"}
                </p>
                <h1>{product.title || product.name}</h1>
                {product.subtitle && (
                  <p className="ob-product-subtitle">{product.subtitle}</p>
                )}
                <div className="ob-price-row">
                  <strong>{money(priceOf(product))}</strong>
                  {product.discount > 0 && <del>{money(product.price)}</del>}
                </div>
                <p
                  className={`ob-availability ${product.stock > 0 ? "available" : "unavailable"}`}
                >
                  <span />
                  {product.stock > 0
                    ? `In stock · ${product.stock} available`
                    : "Currently out of stock"}
                </p>
                <p className="ob-product-intro">
                  {product.shortDescription ||
                    product.description ||
                    "A carefully selected beauty essential for your everyday routine."}
                </p>

                <div className="ob-purchase-row">
                  <label>
                    Quantity
                    <select
                      value={quantity}
                      disabled={product.stock < 1}
                      onChange={(event) =>
                        setQuantity(Number(event.target.value))
                      }
                    >
                      {Array.from(
                        { length: Math.min(product.stock, 10) },
                        (_, index) => index + 1,
                      ).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="ob-add-button"
                    disabled={product.stock < 1}
                    onClick={() => add(product, quantity)}
                  >
                    <TbShoppingBag aria-hidden="true" />
                    Add to cart
                  </button>
                  <button
                    className="ob-wishlist-button"
                    aria-label={
                      saved ? "Remove from wishlist" : "Add to wishlist"
                    }
                    aria-pressed={saved}
                    onClick={() => toggleWishlist(product)}
                  >
                    <TbHeart aria-hidden="true" />
                  </button>
                </div>
                <button
                  className="ob-buy-button"
                  disabled={product.stock < 1}
                  onClick={() => {
                    add(product, quantity);
                    navigate(`/${storeSlug}/checkout`);
                  }}
                >
                  Buy now
                </button>

                <div className="ob-service-list">
                  <div>
                    <TbTruckDelivery aria-hidden="true" />
                    <span>
                      <strong>Reliable delivery</strong>Nationwide shipping
                    </span>
                  </div>
                  <div>
                    <TbCash aria-hidden="true" />
                    <span>
                      <strong>Cash on delivery</strong>Pay when it arrives
                    </span>
                  </div>
                  <div>
                    <TbShieldCheck aria-hidden="true" />
                    <span>
                      <strong>Authentic products</strong>Carefully selected
                    </span>
                  </div>
                </div>
              </section>
            </div>

            <div className="ob-product-information">
              <section>
                <h2>Product overview</h2>
                <p>
                  {product.description ||
                    product.shortDescription ||
                    "No additional product description is available."}
                </p>
              </section>
              <section>
                <h2>Product information</h2>
                <dl>
                  <div>
                    <dt>Category</dt>
                    <dd>{product.category?.name || "Beauty"}</dd>
                  </div>
                  <div>
                    <dt>Availability</dt>
                    <dd>{product.stock > 0 ? "In stock" : "Out of stock"}</dd>
                  </div>
                  <div>
                    <dt>Product code</dt>
                    <dd>{String(product._id).slice(-8).toUpperCase()}</dd>
                  </div>
                  <div>
                    <dt>Store</dt>
                    <dd>{store?.name || "Origins of Beauty"}</dd>
                  </div>
                </dl>
              </section>
              <section>
                <h2>Delivery and payment</h2>
                <ul>
                  <li>
                    <TbPackage aria-hidden="true" />
                    Orders are prepared with protective packaging.
                  </li>
                  <li>
                    <TbTruckDelivery aria-hidden="true" />
                    Delivery time depends on your location.
                  </li>
                  <li>
                    <TbCash aria-hidden="true" />
                    Cash on delivery is available at checkout.
                  </li>
                </ul>
              </section>
            </div>
            {!!product.descriptionSections?.filter((section) => section.enabled)
              .length && (
              <div className="ob-custom-description">
                {product.descriptionSections
                  .filter((section) => section.enabled)
                  .map((section, index) => (
                    <section key={`${section.type}-${index}`}>
                      {section.title && <h2>{section.title}</h2>}
                      <DescriptionSection section={section} />
                    </section>
                  ))}
              </div>
            )}
          </>
        )}
      </QueryState>
    </div>
  );
}
