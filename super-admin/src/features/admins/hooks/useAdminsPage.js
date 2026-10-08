import { useQuery } from "@tanstack/react-query";
import { useManagementPage } from "../../management/hooks/useManagementPage";
import { request } from "../../../services/api";
export function useAdminsPage() {
  const hook = useManagementPage("admins", "/users/admins");
  const stores = useQuery({
    queryKey: ["stores"],
    queryFn: () => request("get", "/stores"),
  });
  return { ...hook, stores };
}
