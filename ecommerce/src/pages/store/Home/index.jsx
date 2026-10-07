import React from 'react'
import { useStore } from '../../../app/providers/StoreProvider'
import { useQuery } from '@tanstack/react-query'
import { productService } from '../../../services/api'

export default function Home() {
  const { storeSlug } = useStore()
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', storeSlug],
    queryFn: () => productService.getProductsByStore(storeSlug),
    enabled: !!storeSlug
  });

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Welcome to <span style={{ color: 'var(--primary-color)' }}>{storeSlug}</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '2.5rem' }}>
            Discover our premium collection of products curated just for you. Shop the latest trends with amazing quality.
          </p>
          <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '99px' }}>
            Shop Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Featured Products</h2>
          <a href="#" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>View All</a>
        </div>
        
        {isLoading ? (
          <p>Loading products...</p>
        ) : products?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {products.map(product => (
              <div key={product._id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s ease', ':hover': { transform: 'translateY(-5px)' } }}>
                <div style={{ height: '250px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-image" style={{ fontSize: '4rem', color: '#cbd5e1' }}></i>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>{product.name}</h3>
                     <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>${product.price}</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{product.description}</p>
                  <button style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, color: '#0f172a', transition: 'all 0.2s hover:background-var(--primary-color) hover:color-white' }}>
                     Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p>No products available yet.</p>
           </div>
        )}
      </section>
    </div>
  )
}
