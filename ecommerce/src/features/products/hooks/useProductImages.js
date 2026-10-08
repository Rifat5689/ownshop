import { useMutation } from "@tanstack/react-query";
import { request } from "../../../services/api";

export function useProductImages(tenantId, platform) {
  return useMutation({
    mutationFn: (files) => {
      const body = new FormData();
      for (const file of files) body.append("images", file);
      const suffix = platform
        ? `?tenantId=${encodeURIComponent(tenantId)}`
        : "";
      return request("post", `/products/images${suffix}`, body);
    },
  });
}
