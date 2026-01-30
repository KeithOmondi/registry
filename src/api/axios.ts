import axios from "axios";
import { refreshSession, logout } from "../store/slices/authSlice";

let store: any;
export const injectStore = (_store: any) => {
  store = _store;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send HttpOnly cookies
  headers: { "Content-Type": "application/json" },
});

// Response interceptor for 401 → refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

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
