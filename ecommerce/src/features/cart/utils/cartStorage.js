export const readStorage = (key, fallback = []) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
};
export const priceOf = (product) =>
  Math.round(
    Number(product.price) * (1 - Number(product.discount || 0) / 100) * 100,
  ) / 100;
export const addCartItem = (items, product, quantity = 1) => {
  if (!Number.isInteger(quantity) || quantity < 1 || product.stock < 1)
    return items;
  const existing = items.find((item) => item.product._id === product._id);
  const nextQuantity = Math.min(
    product.stock,
    (existing?.quantity || 0) + quantity,
  );
  return existing
    ? items.map((item) =>
        item.product._id === product._id
          ? { product, quantity: nextQuantity }
          : item,
      )
    : [...items, { product, quantity: nextQuantity }];
};
