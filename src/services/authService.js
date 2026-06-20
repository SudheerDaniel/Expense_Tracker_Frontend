import api from "./api";

export const signup = async (name, email, password) => {
  const response = await api.post("/api/auth/signup", {
    name,
    email,
    password,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post("/api/auth/login", { email, password });
  // store both tokens seperately - accessToken is used for normal requests,
  // refreshToken is used only to silently obtain a new accessToken when it expires
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  return response.data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    // tell the backend to invalidate the refresh token, so it can't be reused
    // even if someone gets hold of it after logout
    if (refreshToken) {
      await api.post("/api/auth/logout", {refreshToken});
    }
  } catch (err) {
    // even if this fails (e.g. network issue), still clear local tokens below
    console.error("Failed to invalidate refresh token on server", err);
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
export const isLoggedIn = () => {
  return !!localStorage.getItem("accessToken");
};
