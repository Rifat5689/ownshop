import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '../../../services/api'
import { useStore } from '../../../app/providers/StoreProvider'

export default function Products() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', price: '', description: '', stock: '' });
  
  // Since this is the admin panel, we assume the user is managing a specific store.
  // For demonstration, we hardcode 'rifat-fashion' or pull from a global context.
  const storeSlug = 'rifat-fashion'; 

  const queryClient = useQueryClient();
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['adminProducts', storeSlug],
    queryFn: () => productService.getProductsByStore(storeSlug)
  });

  const mutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] })
      setShowAddForm(false)
      setFormData({ name: '', slug: '', price: '', description: '', stock: '' })
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...formData, storeSlug, price: Number(formData.price), stock: Number(formData.stock) });
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Products Management</h1>
          <p>Manage inventory for your store.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <i className="fa-solid fa-plus"></i> {showAddForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Add New Product</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input placeholder="Product Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            <input placeholder="Slug (e.g. black-tshirt)" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            <input placeholder="Price" type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            <input placeholder="Stock" type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            <textarea placeholder="Description" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '100px' }} />
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Product'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {isLoading ? (
           <p>Loading products...</p>
        ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
              <tr key={product._id}>
                <td>
                   <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <i className="fa-solid fa-image" style={{ color: 'var(--text-muted)' }}></i>
                   </div>
                </td>
                <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{product.name}</td>
                <td>${product.price}</td>
                <td>{product.stock} in stock</td>
                <td><span className={product.stock > 0 ? "status-badge status-active" : "status-badge status-inactive"}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
                <td>
                  <button className="icon-btn" style={{ marginRight: '10px' }}><i className="fa-regular fa-pen-to-square"></i></button>
                  <button className="icon-btn" style={{ color: 'var(--danger-color)' }}><i className="fa-regular fa-trash-can"></i></button>
                </td>
              </tr>
              ))}
              {products?.length === 0 && (
                 <tr><td colSpan="6" style={{textAlign:'center', padding: '2rem'}}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}
