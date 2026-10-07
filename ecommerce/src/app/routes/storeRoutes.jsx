import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { StoreLayout } from '../../layouts/StoreLayout'
import Home from '../../pages/store/Home'

export default function StoreRoutes() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="" element={<Home />} />
        <Route path="products" element={<div>Products List</div>} />
        <Route path="products/:productSlug" element={<div>Product Details</div>} />
        <Route path="categories/:categorySlug" element={<div>Category Page</div>} />
        <Route path="cart" element={<div>Cart</div>} />
        <Route path="checkout" element={<div>Checkout</div>} />
        <Route path="order-success" element={<div>Order Success</div>} />
      </Route>
    </Routes>
  )
}
