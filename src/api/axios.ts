import axios, { type InternalAxiosRequestConfig } from "axios";
import { refreshSession, logout } from "../store/slices/authSlice";
import type { AppStore } from "../store/store";

let store: AppStore;

export const injectStore = (_store: AppStore) => {
  store = _store;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest: InternalAxiosRequestConfig & { _retry?: boolean } =
      error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        await store.dispatch(refreshSession()).unwrap();
        return api(originalRequest);
      } catch (err) {
        store.dispatch(logout());
        return Promise.reject(err);
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;