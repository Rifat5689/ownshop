import { useQuery } from "@tanstack/react-query";
import { useManagementPage } from "../../management/hooks/useManagementPage";
import { request } from "../../../services/api";
export function useOrdersPage(id) {
  const hook = useManagementPage("adminOrders", "/orders");
  const details = useQuery({
    queryKey: ["adminOrder", id],
    queryFn: () => request("get", `/orders/${id}`),
    enabled: !!id,
  });
  return { ...hook, details };
}
export const transitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};
