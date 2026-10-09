import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { BeautyStoreLayout as StoreLayout } from "../../layouts/BeautyStoreLayout";
import Home from "../../pages/store/Home/BeautyHome";
import Products from "../../pages/store/Products/Products";
import ProductDetails from "../../pages/store/ProductDetails/ProductDetails";
import Categories from "../../pages/store/Categories/Categories";
import Cart from "../../pages/store/Cart/Cart";
import Checkout from "../../pages/store/Checkout/Checkout";
import Orders, {
  OrderDetails,
  OrderSuccess,
} from "../../pages/store/Orders/Orders";
import Account, { Wishlist } from "../../pages/store/Account/Account";
export default function StoreRoutes() {
  const { pathname } = useLocation();
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route
          path="products/:productSlug"
          element={<ProductDetails key={pathname} />}
        />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:categorySlug" element={<Products />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="account" element={<Account />} />
        <Route
          path="*"
          element={
            <div className="state-card">
              <h1>Page not found</h1>
              <Link to="..">Back to Store</Link>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
