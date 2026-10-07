import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { storeService } from '../../services/api'

export default function Stores() {
  const { data: stores, isLoading, isError } = useQuery({
    queryKey: ['stores'],
    queryFn: storeService.getStores
  });

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Store Management</h1>
          <p>Manage platform stores and their statuses.</p>
        </div>
        <button className="btn-primary">
          <i className="fa-solid fa-plus"></i> Add New Store
        </button>
      </div>

      <div className="card">
        {isLoading ? (
           <p>Loading stores...</p>
        ) : isError ? (
           <p style={{color: 'red'}}>Failed to load stores. Make sure backend is running on port 5000.</p>
        ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Store ID</th>
                <th>Store Name</th>
                <th>Store URL (Slug)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores?.map((store) => (
              <tr key={store._id}>
                <td>{store._id.substring(18)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <i className="fa-solid fa-store" style={{ color: 'var(--primary-color)' }}></i>
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{store.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--primary-color)' }}>{store.slug}</td>
                <td><span className={`status-badge status-${store.status?.toLowerCase() || 'active'}`}>{store.status || 'Active'}</span></td>
                <td>
                  <button className="icon-btn" style={{ marginRight: '10px' }}><i className="fa-regular fa-pen-to-square"></i></button>
                  <button className="icon-btn" style={{ color: 'var(--danger-color)' }}><i className="fa-regular fa-trash-can"></i></button>
                </td>
              </tr>
              ))}
              {stores?.length === 0 && (
                 <tr><td colSpan="5" style={{textAlign:'center', padding: '2rem'}}>No stores created yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}
