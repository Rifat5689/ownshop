import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../../app/providers/StoreProvider";
import { useAuth } from "../../../app/providers/AuthProvider";
import { useCatalog } from "../../../features/store/hooks/useCatalog";
import { ProductCard } from "../../../features/store/components/ProductCard";
import { QueryState } from "../../../components/common/QueryState";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import {
  TbArrowRight,
  TbBottle,
  TbBrush,
  TbBath,
  TbDropletFilled,
  TbShieldCheck,
  TbSparkles,
  TbPerfume,
  TbTruckDelivery,
  TbUserHeart,
} from "react-icons/tb";

const categories = [
  ["Beauty", TbSparkles],
  ["Skincare", TbDropletFilled],
  ["Makeup", TbBrush],
  ["Fragrance", TbPerfume],
  ["Tools", TbBottle],
  ["Bodycare", TbBath],
];

export default function BeautyHome() {
  const { storeSlug, store } = useStore();
  const { user } = useAuth();
  const { products } = useCatalog();
  const [slide, setSlide] = useState(0);
  const featured =
    products.data?.filter((item) => item.images?.[0]?.url).slice(0, 3) || [];
  const isStoreAdmin =
    ["ADMIN", "ECO"].includes(user?.role) &&
    String(user?.tenantId?._id || user?.tenantId) === String(store?._id);
  useEffect(() => {
    const timer = window.setInterval(
      () => setSlide((value) => (value + 1) % 3),
      3500,
    );
    return () => window.clearInterval(timer);
  }, []);
  return (
    <>
      <section className="ob-hero">
        {[0, 1, 2].map((index) => (
          <article className={slide === index ? "active" : ""} key={index}>
            <div>
              <span className="ob-kicker">
                {index === 1
                  ? "Skin ritual"
                  : index === 2
                    ? "Beauty edit"
                    : "New collection"}
              </span>
              <h1>
                {index === 1
                  ? "Glow begins with care"
                  : index === 2
                    ? "Your beauty, your way"
                    : "Everyday beauty, beautifully curated"}
              </h1>
              <p>
                Authentic beauty essentials chosen to make every routine feel a
                little more special.
              </p>
              <Link className="ob-primary" to={`/${storeSlug}/products`}>
                Shop the collection <TbArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="ob-hero-visual">
              {featured[index] ? (
                <img
                  src={featured[index].images[0].url}
                  alt={featured[index].name}
                />
              ) : (
                <span>O</span>
              )}
            </div>
          </article>
        ))}
        <div className="ob-slider-dots">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              className={slide === index ? "active" : ""}
              onClick={() => setSlide(index)}
              aria-label={`Show promotion ${index + 1}`}
            />
          ))}
        </div>
      </section>
      <section className="ob-home-section">
        <div className="ob-section-title">
          <div>
            <span className="ob-kicker">Find your ritual</span>
            <h2>Shop by category</h2>
          </div>
          <Link to={`/${storeSlug}/categories`}>
            View all <TbArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="ob-categories">
          {categories.map(([name, Icon]) => (
            <Link
              key={name}
              to={`/${storeSlug}/categories/${name.toLowerCase()}`}
            >
              <span>
                {React.createElement(Icon, { "aria-hidden": true })}
              </span>
              <strong>{name}</strong>
            </Link>
          ))}
        </div>
      </section>
      <section className="ob-home-section ob-products-section">
        <div className="ob-section-title">
          <div>
            <span className="ob-kicker">Our favourites</span>
            <h2>Curated for you</h2>
            <p>Discover beautiful essentials for every day.</p>
            {isStoreAdmin && (
              <span className="ob-admin-product-count">
                {products.data?.length || 0} total products
              </span>
            )}
          </div>
          <Link to={`/${storeSlug}/products`}>
            View all products <TbArrowRight aria-hidden="true" />
          </Link>
        </div>
        {products.isPending ? (
          <LoadingSpinner label="Loading curated products..." />
        ) : (
          <QueryState query={products} empty={products.data?.length === 0}>
            <div className="product-grid">
              {products.data?.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <Link className="ob-view-all-products" to={`/${storeSlug}/products`}>
              View all products <TbArrowRight aria-hidden="true" />
            </Link>
          </QueryState>
        )}
      </section>
      <section className="ob-promise">
        <div>
          <b>
            <TbShieldCheck aria-hidden="true" />
          </b>
          <strong>Authentic products</strong>
          <span>Carefully selected essentials</span>
        </div>
        <div>
          <b>
            <TbUserHeart aria-hidden="true" />
          </b>
          <strong>Beauty with care</strong>
          <span>Made for your daily ritual</span>
        </div>
        <div>
          <b>
            <TbTruckDelivery aria-hidden="true" />
          </b>
          <strong>Delivery nationwide</strong>
          <span>Reliable delivery to your door</span>
        </div>
        <div>
          <b>
            <TbSparkles aria-hidden="true" />
          </b>
          <strong>Here to help</strong>
          <span>Friendly customer support</span>
        </div>
      </section>
    </>
  );
}
