import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../../services/api";
export function useSettingsPage(platform) {
  const endpoint = platform ? "/platform/settings" : "/stores/mine";
  const client = useQueryClient();
  const query = useQuery({
    queryKey: [endpoint],
    queryFn: () => request("get", endpoint),
  });
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);
  const mutation = useMutation({
    mutationFn: () =>
      request("patch", endpoint, {
        name: form.name,
        supportEmail: form.supportEmail,
        description: form.description,
        shippingFee: Number(form.shippingFee || 0),
        currency: form.currency,
        timezone: form.timezone,
      }),
    onSuccess: () => {
      setSaved(true);
      client.invalidateQueries({ queryKey: [endpoint] });
      client.invalidateQueries({ queryKey: ["store"] });
    },
  });
  return {
    query,
    form,
    setForm: (value) => {
      setSaved(false);
      setForm(value);
    },
    mutation,
    saved,
  };
}
