import React from 'react'

export default function Admins() {
  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Admin Management</h1>
          <p>Manage system administrators and their roles.</p>
        </div>
        <button className="btn-primary">
          <i className="fa-solid fa-user-plus"></i> Add Admin
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="avatar" style={{ width: '32px', height: '32px' }}/>
                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>Rifat Hasan</span>
                  </div>
                </td>
                <td>rifat@ownshop.com</td>
                <td><span style={{ color: 'var(--primary-color)', fontWeight: 500, fontSize: '0.875rem' }}>Super Admin</span></td>
                <td><span className="status-badge status-active">Active</span></td>
                <td>
                  <button className="icon-btn" style={{ marginRight: '10px' }}><i className="fa-regular fa-pen-to-square"></i></button>
                </td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="avatar" style={{ width: '32px', height: '32px' }}/>
                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>Samiul Islam</span>
                  </div>
                </td>
                <td>samiul@ownshop.com</td>
                <td><span style={{ color: '#0ea5e9', fontWeight: 500, fontSize: '0.875rem' }}>Admin</span></td>
                <td><span className="status-badge status-active">Active</span></td>
                <td>
                  <button className="icon-btn" style={{ marginRight: '10px' }}><i className="fa-regular fa-pen-to-square"></i></button>
                  <button className="icon-btn" style={{ color: 'var(--danger-color)' }}><i className="fa-regular fa-trash-can"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
