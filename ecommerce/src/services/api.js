import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://myshop-bhh4bggcgkd9e6hq.centralindia-01.azurewebsites.net/api/v1",
  withCredentials: true,
  headers: { "X-App-Client": "store-admin" },
  timeout: 20000,
});
api.interceptors.request.use((config) => {
  const [, storeSlug, section] = window.location.pathname.split("/");
  if (storeSlug && section === "admin") config.headers["X-Store-Slug"] = decodeURIComponent(storeSlug);
  const token = sessionStorage.getItem("ownshop_access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
let refreshPromise;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const hasSession =
      sessionStorage.getItem("ownshop_access") ||
      localStorage.getItem("ownshop_session");
    if (
      error.response?.status !== 401 ||
      !config ||
      config._retried ||
      config.url?.includes("/auth/") ||
      !hasSession
    )
      return Promise.reject(error);
    config._retried = true;
    try {
      if (!refreshPromise)
        refreshPromise = api
          .post("/users/auth/refreshtoken")
          .then((response) => {
            const token = response.data.data?.accessToken;
            if (token) sessionStorage.setItem("ownshop_access", token);
          })
          .finally(() => {
            refreshPromise = null;
          });
      await refreshPromise;
      return api(config);
    } catch {
      sessionStorage.removeItem("ownshop_access");
      localStorage.removeItem("ownshop_session");
      window.dispatchEvent(new Event("ownshop:unauthorized"));
      return Promise.reject(error);
    }
  },
);
export const request = async (method, url, data, config) =>
  (await api.request({ method, url, data, ...config })).data.data;
export const errorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unable to complete the request";
export const productService = {
  getProductsByStore: (slug) =>
    request("get", `/products/store/${encodeURIComponent(slug)}`),
  createProduct: (data) => request("post", "/products", data),
};
export const storeService = {
  getStores: () => request("get", "/stores"),
  createStore: (data) => request("post", "/stores", data),
};
export default api;
