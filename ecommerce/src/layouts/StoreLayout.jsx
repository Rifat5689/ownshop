import React from 'react'
import { Outlet, Link, useParams } from 'react-router-dom'
import { useStore } from '../app/providers/StoreProvider'

export function StoreLayout() {
  const { storeSlug } = useStore()
  const params = useParams()
  const slug = storeSlug || params.storeSlug

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'white', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to={`/${slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ width: '40px', height: '40px', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {slug?.charAt(0).toUpperCase()}
             </div>
             <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{slug?.toUpperCase() || 'STORE'}</h1>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to={`/${slug}/products`} style={{ textDecoration: 'none', color: '#475569', fontWeight: 500 }}>Products</Link>
            <Link to={`/${slug}/categories`} style={{ textDecoration: 'none', color: '#475569', fontWeight: 500 }}>Categories</Link>
            <Link to={`/${slug}/cart`} style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, position: 'relative' }}>
              <i className="fa-solid fa-cart-shopping" style={{ fontSize: '1.25rem' }}></i>
              <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: 'var(--primary-color)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>0</span>
            </Link>
            <button className="btn-primary" style={{ borderRadius: '99px' }}>Sign In</button>
          </nav>
        </div>
      </header>
      
      <main style={{ flexGrow: 1, background: '#f8fafc' }}>
        <Outlet />
      </main>

      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '3rem 2rem', textAlign: 'center' }}>
         <p>&copy; {new Date().getFullYear()} {slug?.toUpperCase()}. All rights reserved.</p>
         <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Powered by OwnShop SaaS</p>
      </footer>
    </div>
  )
}
