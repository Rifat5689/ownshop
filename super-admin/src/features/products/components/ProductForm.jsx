import React from "react";
import { ProductEditor } from "./ProductsManager";
import { useProductsPage } from "../hooks/useProductsPage";
export default function ProductForm() {
  const hook = useProductsPage();
  return <ProductEditor hook={hook} base="/products" />;
}
