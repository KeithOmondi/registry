import axios from "axios";
import { refreshSession, logout } from "../store/slices/authSlice";

let store: any;

/**
 * Injected in main.tsx to give this file access to Redux actions
 */
export const injectStore = (_store: any) => {
  store = _store;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // MANDATORY: This allows the browser to send cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR:
 * We no longer need to manually attach Bearer tokens from localStorage!
 * The browser handles the cookies for us.
 */
api.interceptors.request.use((config) => {
  return config;
});

/**
 * RESPONSE INTERCEPTOR:
 * Catches 401 errors and attempts to silently refresh the session using cookies.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    /**
     * 1. If 401 (Unauthorized)
     * 2. AND we haven't retried yet
     * 3. AND the failed request wasn't the refresh attempt itself
     */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // Dispatch the refreshSession thunk
        // This will trigger the backend to check the refreshToken cookie
        await store.dispatch(refreshSession()).unwrap();

        // If successful, the backend has sent NEW cookies.
        // We simply retry the original request.
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh call itself fails (cookie expired), log out the user
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    // Pass through any other errors (404, 400, 500, etc.)
    return Promise.reject(error.response?.data || error);
  },
);

export default api;
