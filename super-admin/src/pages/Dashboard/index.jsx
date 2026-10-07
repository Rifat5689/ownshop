import React from 'react'

export default function Dashboard() {
  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your platform</p>
        </div>
        <select style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon blue"><i className="fa-solid fa-users"></i></div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <div className="value">12,458</div>
            <div className="trend up"><i className="fa-solid fa-arrow-up"></i> + 12% from last week</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon purple"><i className="fa-solid fa-cart-shopping"></i></div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <div className="value">3,429</div>
            <div className="trend up"><i className="fa-solid fa-arrow-up"></i> + 8% from last week</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green"><i className="fa-solid fa-money-bill-wave"></i></div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <div className="value">৳ 1,245,690</div>
            <div className="trend up"><i className="fa-solid fa-arrow-up"></i> + 15% from last week</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon orange"><i className="fa-solid fa-box-open"></i></div>
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <div className="value">248</div>
            <div className="trend down"><i className="fa-solid fa-arrow-down"></i> - 3% from last week</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue Overview</h3>
            <button style={{ color: 'var(--primary-color)', fontSize: '0.875rem', fontWeight: 500 }}>View Report <i className="fa-solid fa-chevron-right"></i></button>
          </div>
          {/* Placeholder for chart */}
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '1rem 0' }}>
            {/* Mock bars for aesthetics */}
            {[40, 70, 50, 90, 60, 80, 100].map((h, i) => (
              <div key={i} style={{ width: '10%', height: `${h}%`, background: 'linear-gradient(to top, var(--primary-color), #93c5fd)', borderRadius: '4px' }}></div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Stores</h3>
            <a href="/stores" style={{ fontSize: '0.875rem', color: 'var(--primary-color)' }}>View all</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-store" style={{ color: 'var(--text-muted)' }}></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem' }}>Store {item}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created 2 days ago</p>
                  </div>
                </div>
                <span className="status-badge status-active">Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
