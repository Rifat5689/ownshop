import { useQuery } from "@tanstack/react-query";
import { request } from "../../../services/api";
import { useAuth } from "../../../app/providers/AuthProvider";
export const useDashboard = (days = "30") => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["summary", user?._id, user?.tenantId, days],
    queryFn: () => request("get", `/platform/summary?days=${days}`),
  });
};
