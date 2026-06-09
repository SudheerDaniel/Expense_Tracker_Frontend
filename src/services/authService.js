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
  localStorage.setItem("token", response.data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};
export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};
