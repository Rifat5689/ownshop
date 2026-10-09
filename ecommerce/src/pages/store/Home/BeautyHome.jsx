import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../../app/providers/StoreProvider";
import { useCatalog } from "../../../features/store/hooks/useCatalog";
import { ProductCard } from "../../../features/store/components/ProductCard";
import { QueryState } from "../../../components/common/QueryState";

const categories = [
  ["Beauty", "/icons/beauty.png"],
  ["Skincare", "/icons/skincare.png"],
  ["Makeup", "/icons/makeup.png"],
  ["Fragrance", "/icons/fragrance.png"],
  ["Tools", "/icons/tools.png"],
  ["Bodycare", "/icons/bodycare.png"],
];

export default function BeautyHome() {
  const { storeSlug } = useStore();
  const { products } = useCatalog();
  const [slide, setSlide] = useState(0);
  const featured =
    products.data?.filter((item) => item.images?.[0]?.url).slice(0, 3) || [];
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
                Shop the collection →
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
          <Link to={`/${storeSlug}/categories`}>View all →</Link>
        </div>
        <div className="ob-categories">
          {categories.map(([name, icon]) => (
            <Link
              key={name}
              to={`/${storeSlug}/categories/${name.toLowerCase()}`}
            >
              <span>
                <img src={icon} alt="" />
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
          </div>
          <Link to={`/${storeSlug}/products`}>View all products →</Link>
        </div>
        <QueryState query={products} empty={products.data?.length === 0}>
          <div className="product-grid">
            {products.data?.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </QueryState>
      </section>
      <section className="ob-promise">
        <div>
          <b>◇</b>
          <strong>Authentic products</strong>
          <span>Carefully selected essentials</span>
        </div>
        <div>
          <b>♡</b>
          <strong>Beauty with care</strong>
          <span>Made for your daily ritual</span>
        </div>
        <div>
          <b>♧</b>
          <strong>Delivery nationwide</strong>
          <span>Reliable delivery to your door</span>
        </div>
        <div>
          <b>✦</b>
          <strong>Here to help</strong>
          <span>Friendly customer support</span>
        </div>
      </section>
    </>
  );
}
