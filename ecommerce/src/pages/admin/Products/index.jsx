import React from "react";
import { useParams } from "react-router-dom";
import { ProductsManager } from "../../../features/products/components/ProductsManager";
export default function Products() {
  const { storeSlug } = useParams();
  return <ProductsManager base={`/${storeSlug}/admin/products`} />;
}
