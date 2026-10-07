import React from 'react'

export default function Dashboard() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Store Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Here is what is happening in your store today.</p>
        </div>
        <button className="btn-primary"><i className="fa-solid fa-plus"></i> Add Product</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}><i className="fa-solid fa-sack-dollar"></i></div>
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Today's Revenue</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>$450.00</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}><i className="fa-solid fa-boxes-stacked"></i></div>
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Products</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>124</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}><i className="fa-solid fa-cart-shopping"></i></div>
          <div>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pending Orders</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>12</div>
          </div>
        </div>
      </div>
    </div>
  )
}
