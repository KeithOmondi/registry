import axios from "axios";
import { refreshSession, logout } from "../store/slices/authSlice";

let store: any;
export const injectStore = (_store: any) => {
  store = _store;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  // REMOVED: "Content-Type": "application/json"
  // Letting Axios detect the content type automatically is safer for file uploads
});

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
        return api(originalRequest); // This will now correctly re-send FormData if the original request was an upload
      } catch (err) {
        store.dispatch(logout());
        return Promise.reject(err);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;