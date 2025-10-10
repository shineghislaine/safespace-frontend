// src/api/axios.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// ✅ Automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle global auth errors (auto logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const msg = error.response.data?.message || "";

      // Handle account restrictions
      if (
        error.response.status === 403 &&
        (msg.includes("deactivated") ||
         msg.includes("suspended") ||
         msg.includes("banned"))
      ) {
        alert(msg || "Your account is restricted. Please contact admin.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      // Invalid or expired token
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
