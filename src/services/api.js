import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ||  "http://localhost:8080",
});

// attach the access token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// tracks an in-progress refresh call, shared across all concurrent failed requests
// so multiple simultaneous 403s only trigger ONE refresh call, not one each
let refreshPromise = null;

const performRefresh = () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    return Promise.reject(new Error("No refresh token available"));
  }

  return axios
    .post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/auth/refresh`, { refreshToken })
    .then((response) => {
      const newAccessToken = response.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    });
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      // if a refresh is already in progress, reuse it instead of starting a new one
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          // clear the shared promise once it settles, so the NEXT expiry starts a fresh refresh
          refreshPromise = null;
        });
      }

      try {
        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // refresh token itself is invalid/expired - force re-login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
