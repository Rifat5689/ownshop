import { request } from "../../../services/api";
export const authService = {
  login: (data) => request("post", "/users/auth/login", data),
  me: () => request("get", "/users/me"),
  logout: () => request("post", "/users/auth/logout"),
  refresh: () => request("post", "/users/auth/refreshtoken"),
};
