import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { request } from "../../../services/api";
import { useStore } from "../../../app/providers/StoreProvider";
import { useCart } from "../../cart/CartProvider";
import { readStorage } from "../../cart/utils/cartStorage";
export function useCheckout() {
  const { store, storeSlug } = useStore();
  const cart = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [shippingZone, setShippingZone] = useState("insideDhaka");
  const [attempt, setAttempt] = useState(null);
  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        orderItems: cart.items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        shippingDetails: shipping,
        shippingZone,
        customerUsername: (() => {
          try {
            return JSON.parse(
              localStorage.getItem(`ownshop:customer:${store._id}`),
            )?.username;
          } catch {
            return undefined;
          }
        })(),
        paymentMethod: "cash on delivery",
      };
      const fingerprint = JSON.stringify(body);
      const current =
        attempt?.fingerprint === fingerprint
          ? attempt
          : { fingerprint, key: crypto.randomUUID() };
      setAttempt(current);
      return request("post", `/orders/store/${storeSlug}`, body, {
        headers: { "Idempotency-Key": current.key },
      });
    },
    onSuccess: (order) => {
      try {
        const key = `ownshop:orders:${store._id}`;
        localStorage.setItem(
          key,
          JSON.stringify([
            order,
            ...readStorage(key).filter((item) => item._id !== order._id),
          ]),
        );
      } catch {
        /* Order is already saved by the backend; the success screen keeps its token. */
      }
      cart.clear();
      queryClient.invalidateQueries({ queryKey: ["products", storeSlug] });
      navigate(`/${storeSlug}/order-success`, {
        state: { order },
        replace: true,
      });
    },
  });
  const shippingFee = store.useZoneShippingFees
    ? store.shippingFees?.[shippingZone] || 0
    : store.shippingFee || 0;
  return {
    shipping,
    setShipping,
    shippingZone,
    setShippingZone,
    shippingFee,
    mutation,
    cart,
    store,
    storeSlug,
  };
}
